import { Controller, Post, Get, Put, Body, Param, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './DTO/create-payment.dto';
import { InitiatePaymentDto } from './DTO/initiate-payment.dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { GetCurrentUser } from 'src/common/decorators';
import { Role } from 'src/common/decorators/roles.decorator';

@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post()
    makePayment(
        @Body(ValidationPipe) createPaymentDto: CreatePaymentDto,
        @GetCurrentUser("sub") userId: number
    ) {
        return this.paymentService.makePayment({
            ...createPaymentDto,
            userId
        });
    }

    @Put('update-transaction/:orderNum')
    updatePaymentTransaction(
        @GetCurrentUser("sub") userId: number,
        @Param('orderNum') orderNum: string
    ) {
        return this.paymentService.updatePaymentTransaction(userId, orderNum);
    }

    // Get all user's payments
    @Get('my')
    getMyPayments(@GetCurrentUser("sub") userId: number) {
        return this.paymentService.getUserPayments(userId);
    }

    // Get payment by ID (user can only access their own, admins can access all)
    @Get(':id')
    getPaymentById(
        @Param('id', ParseIntPipe) id: number,
        @GetCurrentUser("sub") userId: number,
        @GetCurrentUser("role") userRole: string
    ) {
        return this.paymentService.getPaymentById(id, userId, userRole);
    }

    // Refund payment (admin only)
    @Auth(Role.ADMIN)
    @Put(':id/refund')
    refundPayment(
        @Param('id', ParseIntPipe) id: number,
        @Body('refundAmount') refundAmount?: number
    ) {
        return this.paymentService.refundPayment(id, refundAmount);
    }

    @Post('initiate')
    initiatePayment(
        @Body(ValidationPipe) initiatePaymentDto: InitiatePaymentDto,
        @GetCurrentUser("sub") userId: number
    ) {
        return this.paymentService.initiatePayment(initiatePaymentDto, userId);
    }
}
