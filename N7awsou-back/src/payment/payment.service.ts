import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePaymentDto } from './DTO/create-payment.dto';
import { InitiatePaymentDto } from './DTO/initiate-payment.dto';
import { DatabaseService } from 'src/database/database.service';
import axios from 'axios';

@Injectable()
export class PaymentService {
    constructor(private readonly databaseService: DatabaseService) { }

    async makePayment(paymentDto: CreatePaymentDto) {
        // Ensure userId is provided
        if (!paymentDto.userId) {
            throw new BadRequestException('User ID is required');
        }



        // Check if the tour exists and is available
        let existingTour = await this.databaseService.tour.findUnique({
            where: {
                id: paymentDto.tourId,
                available: true, // Ensure the tour is available
            },
        });

        const customTour = await this.databaseService.customTour.findUnique({
            where: {
                id: paymentDto.tourId,
            },
        });
        console.log('Custom Tour:', customTour);
        console.log('Existing Tour:', existingTour);
        console.log(!existingTour && !customTour)


        if (!existingTour && !customTour) {

            throw new NotFoundException("Tour not found or not available");
        }



        // Check if there's enough capacity
        if (existingTour && paymentDto.numberOfPeople > existingTour.availableCapacity) {
            throw new BadRequestException('Not enough capacity for the selected tour');
        }

        // Calculate total amount
        const totalAmount = existingTour ? existingTour.price * paymentDto.numberOfPeople : customTour && customTour.price * paymentDto.numberOfPeople;

        // Initiate payment with Guiddini
        let guiddiniResponse;
        try {
            guiddiniResponse = await this.initiateGuiddiniPayment(totalAmount!);
        } catch (error) {
            console.log('Guiddini payment initiation failed:', error);
            throw new HttpException(
                'Payment initiation failed. Please try again.',
                HttpStatus.BAD_GATEWAY
            );
        }

        // Create the payment with Guiddini transaction data
        const payment = await this.databaseService.payment.create({
            data: {
                userId: paymentDto.userId,
                tourId: paymentDto.tourId,
                amount: totalAmount!,
                numberOfPeople: paymentDto.numberOfPeople,
                currency: paymentDto.currency || 'DZD',
                transactionId: guiddiniResponse.transaction_id || guiddiniResponse.id,
                notes: paymentDto.notes,
                status: 'PROCESSING', // Set as processing until confirmed
                processedAt: new Date()
            },
        });

        // Return payment info along with Guiddini payment URL
        return {
            payment,
            paymentUrl: guiddiniResponse.payment_url || guiddiniResponse.url,
            transactionId: guiddiniResponse.transaction_id || guiddiniResponse.id,
            guiddiniResponse
        };
    }

    async updatePaymentTransaction(userId: number, orderNum: string) {
        // Get the last payment created by the user
        const foundPayment = await this.databaseService.payment.findUnique({
            where: {
                transactionId: orderNum,
            },

        });

        if (!foundPayment) {
            throw new NotFoundException('No payment found for this transaction');
        }

        // Update the transaction ID for the last payment
        const updatedPayment = await this.databaseService.payment.update({
            where: {
                id: foundPayment.id
            },
            data: {
                status: 'COMPLETED',
                processedAt: new Date()
            },
            /*             include: {
                            tour: {
                                select: {
                                    name: true,
                                    departureDate: true,
                                    departureLocation: true,
                                    price: true
                                }
                            }
                        } */
        });

        if (!updatedPayment) {
            throw new NotFoundException('Payment not found or could not be updated');
        }
        if (updatedPayment.tourId) {
            const tour = await this.databaseService.tour.findUnique({
                where: {
                    id: updatedPayment.tourId
                }
            });

            if (!tour) {
                throw new NotFoundException('Tour not found for the last payment');
            }

            await this.databaseService.tour.update({
                where: { id: tour.id },
                data: {
                    availableCapacity: tour.availableCapacity - foundPayment.numberOfPeople
                }
            });
        }


        return updatedPayment;
    }

    async getUserPayments(userId: number) {
        return this.databaseService.payment.findMany({
            where: { userId },
            include: {
                tour: {
                    select: {
                        name: true,
                        departureDate: true,
                        departureLocation: true,
                        price: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getPaymentById(id: number, userId: number, userRole: string) {
        const payment = await this.databaseService.payment.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        username: true,
                        email: true
                    }
                },
                tour: true
            }
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        // Users can only access their own payments, admins can access all
        if (userRole !== 'ADMIN' && payment.userId !== userId) {
            throw new BadRequestException('Access denied');
        }

        return payment;
    }

    async refundPayment(id: number, refundAmount?: number) {
        const payment = await this.databaseService.payment.findUnique({
            where: { id }
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        if (payment.status !== 'COMPLETED') {
            throw new BadRequestException('Only completed payments can be refunded');
        }

        const refundAmountFinal = refundAmount || payment.amount;

        return this.databaseService.payment.update({
            where: { id },
            data: {
                status: 'REFUNDED',
                refundAmount: refundAmountFinal,
                refundedAt: new Date()
            }
        });
    }

    private async initiateGuiddiniPayment(amount: number) {
        const APP_KEY = process.env.PAYMENT_API_KEY;
        const APP_SECRET = process.env.PAYMENT_API_SECRET;

        if (!APP_KEY || !APP_SECRET) {
            throw new HttpException(
                'Payment configuration error: API credentials not found',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        try {
            const response = await axios.post(
                'https://epay.guiddini.dz/api/payment/initiate',
                {
                    amount: amount.toString(),
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'x-app-key': APP_KEY,
                        'x-app-secret': APP_SECRET
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            console.log('Guiddini API Error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            throw new HttpException(
                `Payment gateway error: ${error.response?.data?.message || error.message}`,
                error.response?.status || HttpStatus.BAD_GATEWAY
            );
        }
    }

    async getLastPaymentByUser(userId: number) {
        const lastPayment = await this.databaseService.payment.findFirst({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                tour: {
                    select: {
                        name: true,
                        departureDate: true,
                        departureLocation: true,
                        price: true
                    }
                }
            }
        });

        if (!lastPayment) {
            throw new NotFoundException('No payments found for this user');
        }

        return lastPayment;
    }

    async initiatePayment(initiatePaymentDto: InitiatePaymentDto, userId: number) {
        // Check if the tour exists and is available
        const existingTour = await this.databaseService.tour.findUnique({
            where: {
                id: initiatePaymentDto.tourId,
                available: true,
            },
        });

        const customTour = await this.databaseService.customTour.findUnique({
            where: {
                id: initiatePaymentDto.tourId,
            },
        });
        console.log('Custom Tour:', customTour);
        console.log('Existing Tour:', existingTour);
        console.log(!existingTour && !customTour)


        if (!existingTour && !customTour) {

            throw new NotFoundException("Tour not found or not available");
        }
        // Check if there's enough capacity

        // Check if there's enough capacity
        if (existingTour && initiatePaymentDto.numberOfPeople > existingTour.availableCapacity) {
            throw new BadRequestException('Not enough capacity for the selected tour');
        }


        // Calculate total amount
        const totalAmount = existingTour ? existingTour.price * initiatePaymentDto.numberOfPeople : customTour && customTour.price * initiatePaymentDto.numberOfPeople;

        // Initiate payment with Guiddini
        let guiddiniResponse;
        try {
            guiddiniResponse = await this.initiateGuiddiniPayment(totalAmount!);
        } catch (error) {
            console.log('Guiddini payment initiation failed:', error);
            throw new HttpException(
                'Payment initiation failed. Please try again.',
                HttpStatus.BAD_GATEWAY
            );
        }

        // Create the payment record with Guiddini transaction data
        console.log('Creating payment record with Guiddini response:', guiddiniResponse);
        const payment = await this.databaseService.payment.create({
            data: {
                userId: userId,
                tourId: existingTour ? existingTour.id : null,
                customTourId: customTour ? customTour.id : null,
                amount: totalAmount!,
                numberOfPeople: initiatePaymentDto.numberOfPeople,
                currency: 'DZD',
                transactionId: guiddiniResponse.data.id,
                notes: initiatePaymentDto.notes,
                status: 'PROCESSING',
                formUrl: guiddiniResponse.data.attributes?.form_url, // Store full response for debugging
                processedAt: new Date()
            },
        });

        existingTour && await this.databaseService.touristTours.create({
            data: {
                touristId: userId,
                tourId: existingTour.id,
                guests: initiatePaymentDto.numberOfPeople,
            }
        })

        // Return payment info along with Guiddini payment URL
        return {
            payment: {
                id: payment.id,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                transactionId: payment.transactionId,
                formUrl: payment.formUrl,
            },
        };
    }
}
