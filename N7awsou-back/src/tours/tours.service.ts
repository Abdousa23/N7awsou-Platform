import { Body, Injectable, ValidationPipe, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { CreateTourDto } from './DTO/create-tour.dto';
import { UpdateTourDto } from './DTO/update-tour.dto';
import { TourFilterDto } from './DTO/tour-filter.dto';
import { DatabaseService } from 'src/database/database.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { filter } from 'rxjs';


@Injectable()
export class ToursService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly cloudinaryService: CloudinaryService
    ) { }
    async createTour(createTour: CreateTourDto, userId: number, images?: Express.Multer.File[]) {
        try {
            console.log('Creating tour with data:', createTour, 'for user ID:', userId);

            // Validate required fields
            if (!createTour.name || !createTour.description) {
                throw new BadRequestException('Tour name and description are required');
            }

            if (!createTour.price || createTour.price <= 0) {
                throw new BadRequestException('Tour price must be greater than 0');
            }

            if (!createTour.departureDate || !createTour.returnDate) {
                throw new BadRequestException('Departure and return dates are required');
            }

            const {duration , ...rest} = createTour

            // Validate dates
            const departureDate = new Date(createTour.departureDate);
            const returnDate = new Date(createTour.returnDate);
            const now = new Date();

            if (departureDate <= now) {
                throw new BadRequestException('Departure date must be in the future');
            }

            if (returnDate <= departureDate) {
                throw new BadRequestException('Return date must be after departure date');
            }

            if (createTour.availableCapacity && createTour.availableCapacity <= 0) {
                throw new BadRequestException('Available capacity must be greater than 0');
            }






            // Upload images to Cloudinary if provided
            let imageUrls: string[] = [];
            if (images && images.length > 0) {
                console.log(`Uploading ${images.length} images to Cloudinary...`);
                const uploadResults = await this.cloudinaryService.uploadMultipleFiles(images);
                imageUrls = uploadResults.map(result => result.secure_url);
                console.log('Uploaded image URLs:', imageUrls);
            }

            // Merge existing images with new uploaded images
            const finalImages = [...(createTour.images || []), ...imageUrls];

            return await this.databaseService.tour.create({
                data: {
                    ...rest,
                    duration: typeof duration !== "number" ? parseInt(duration) : duration,
                    images: finalImages,
                    seller: {
                        connect: { userId: userId }
                    }
                },
                include: {
                    seller: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            });
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof ForbiddenException) {
                throw error;
            }

            if (error.code === 'P2002') {
                throw new BadRequestException('A tour with this information already exists');
            }

            if (error.code === 'P2003') {
                throw new BadRequestException('Invalid seller reference');
            }

            console.log('Error creating tour:', error);
            throw new InternalServerErrorException('Failed to create tour. Please try again later.');
        }
    }

    async updateTour(id: number, updateTourDto: UpdateTourDto, images?: Express.Multer.File[]) {
        try {
            // Check if tour exists
            const existingTour = await this.databaseService.tour.findUnique({
                where: { id }
            });

            if (!existingTour) {
                throw new NotFoundException(`Tour with ID ${id} not found`);
            }

            // Validate dates if provided
            if (updateTourDto.departureDate || updateTourDto.returnDate) {
                const departureDate = new Date(updateTourDto.departureDate || existingTour.departureDate);
                const returnDate = new Date(updateTourDto.returnDate || existingTour.returnDate);
                const now = new Date();

                if (departureDate <= now) {
                    throw new BadRequestException('Departure date must be in the future');
                }

                if (returnDate <= departureDate) {
                    throw new BadRequestException('Return date must be after departure date');
                }
            }

            // Validate price if provided
            if (updateTourDto.price !== undefined && updateTourDto.price <= 0) {
                throw new BadRequestException('Tour price must be greater than 0');
            }

            // Validate capacity if provided
            if (updateTourDto.availableCapacity !== undefined && updateTourDto.availableCapacity < 0) {
                throw new BadRequestException('Available capacity cannot be negative');
            }

            // Upload new images to Cloudinary if provided
            let newImageUrls: string[] = [];
            if (images && images.length > 0) {
                console.log(`Uploading ${images.length} new images to Cloudinary...`);
                const uploadResults = await this.cloudinaryService.uploadMultipleFiles(images);
                newImageUrls = uploadResults.map(result => result.secure_url);
                console.log('New uploaded image URLs:', newImageUrls);
            }

            // Handle image updates
            let finalImages = existingTour.images;
            if (updateTourDto.images !== undefined) {
                // If images array is provided in DTO, use it as base and add new uploads
                finalImages = [...updateTourDto.images, ...newImageUrls];
            } else if (newImageUrls.length > 0) {
                // If only new images uploaded, add to existing images
                finalImages = [...existingTour.images, ...newImageUrls];
            }

            return await this.databaseService.tour.update({
                where: { id },
                data: {
                    ...updateTourDto,
                    images: finalImages
                },
                include: {
                    seller: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }

            if (error.code === 'P2025') {
                throw new NotFoundException(`Tour with ID ${id} not found`);
            }

            console.log('Error updating tour:', error);
            throw new InternalServerErrorException('Failed to update tour. Please try again later.');
        }
    }

    async deleteTour(id: number) {
        try {
            // Check if tour exists
            const existingTour = await this.databaseService.tour.findUnique({
                where: { id },
                include: {
                    Payments: {
                        where: {
                            status: 'COMPLETED'
                        }
                    }
                }
            });

            if (!existingTour) {
                throw new NotFoundException(`Tour with ID ${id} not found`);
            }

            // Check if tour has bookings
            if (existingTour.Payments && existingTour.Payments.length > 0) {
                throw new BadRequestException('Cannot delete tour with existing bookings. Please contact customers first.');
            }

            return await this.databaseService.tour.delete({
                where: { id }
            });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }

            if (error.code === 'P2025') {
                throw new NotFoundException(`Tour with ID ${id} not found`);
            }

            if (error.code === 'P2003') {
                throw new BadRequestException('Cannot delete tour due to existing dependencies');
            }

            console.log('Error deleting tour:', error);
            throw new InternalServerErrorException('Failed to delete tour. Please try again later.');
        }
    }

    async findAllTours(filters?: TourFilterDto) {
        try {
            const where: any = {};

            // Filter by departure location
            if (filters?.departureLocation) {
                where.departureLocation = {
                    contains: filters.departureLocation,
                    mode: 'insensitive'
                };
            }

            // Filter by destination location
            if (filters?.destinationLocation) {
                where.destinationLocation = {
                    contains: filters.destinationLocation,
                    mode: 'insensitive'
                };
            }

            // Filter by category
            if (filters?.category) {
                where.category = {
                    contains: filters.category,
                    mode: 'insensitive'
                };
            }

            // Filter by trip type
            if (filters?.tripType) {
                where.tripType = filters.tripType;
            }

            // Filter by departure date
            if (filters?.departureDate) {
                const filterDate = new Date(filters.departureDate);
                if (isNaN(filterDate.getTime())) {
                    throw new BadRequestException('Invalid departure date format');
                }
                where.departureDate = {
                    gte: filterDate
                };
            }

            // Filter by return date
            if (filters?.returnDate) {
                const filterDate = new Date(filters.returnDate);
                if (isNaN(filterDate.getTime())) {
                    throw new BadRequestException('Invalid return date format');
                }
                where.returnDate = {
                    lte: filterDate
                };
            }

            // Filter by price range
            if (filters?.minPrice || filters?.maxPrice) {
                filters.minPrice = filters.minPrice ? parseFloat(filters.minPrice.toString()) : undefined;
                filters.maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice.toString()) : undefined
                where.price = {};
                if (filters.minPrice) {
                    if (filters.minPrice < 0) {
                        throw new BadRequestException('Minimum price cannot be negative');
                    }
                    where.price.gte = filters.minPrice;
                }
                if (filters.maxPrice) {
                    if (filters.maxPrice < 0) {
                        throw new BadRequestException('Maximum price cannot be negative');
                    }
                    if (filters.minPrice && filters.maxPrice < filters.minPrice) {
                        throw new BadRequestException('Maximum price must be greater than minimum price');
                    }
                    where.price.lte = filters.maxPrice;
                }
            }

            // Filter by availability (check if tour has available spots)
            if (filters?.availability) {
                where.availableCapacity = {
                    gt: 0
                };
                where.available = true;
            }

            // Only show available tours by default
            where.available = true;

            const tours = await this.databaseService.tour.findMany({
                where,
                include: {
                    GuideTours: {
                        include: {
                            guide: {
                                select: {
                                    id: true,
                                    username: true,
                                    email: true
                                }
                            }
                        }
                    },
                    Payments: {
                        where: {
                            status: 'COMPLETED'
                        },
                        include:{
                            user :{
                                select:{
                                    username : true,
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            Payments: {
                                where: {
                                    status: 'COMPLETED'
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    departureDate: 'asc'
                }
            });

            // Calculate remaining capacity for each tour
            const toursWithCapacity = tours.map(tour => ({
                ...tour,
                bookedPeople: tour.Payments.reduce((sum, payment) => sum + payment.numberOfPeople, 0),
                remainingCapacity: tour.availableCapacity - tour.Payments.reduce((sum, payment) => sum + payment.numberOfPeople, 0)
            }));

            return toursWithCapacity;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            console.log('Error fetching tours:', error);
            throw new InternalServerErrorException('Failed to fetch tours. Please try again later.');
        }
    }

    findTourById(id: number) {
        return this.databaseService.tour.findUnique({
            where: { id },
            include: {
                GuideTours: {
                    include: {
                        guide: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                                role: true
                            }
                        }
                    }
                },
            }
        });
    }

    findSellerTours(sellerId: number) {
        return this.databaseService.tour.findMany({
            where:{
                sellerId,
            },
            include: {
                Payments : {
                    include:{
                        user:{
                            select :{
                                username: true,
                                email: true,
                            }
                        }
                    }
                }
            }
    })}

    async addTourImages(id: number, images: Express.Multer.File[]) {
        try {
            // Check if tour exists
            const existingTour = await this.databaseService.tour.findUnique({
                where: { id }
            });

            if (!existingTour) {
                throw new NotFoundException(`Tour with ID ${id} not found`);
            }

            if (!images || images.length === 0) {
                throw new BadRequestException('At least one image is required');
            }

            // Upload images to Cloudinary
            console.log(`Uploading ${images.length} images to Cloudinary for tour ${id}...`);
            const uploadResults = await this.cloudinaryService.uploadMultipleFiles(images);
            const newImageUrls = uploadResults.map(result => result.secure_url);
            console.log('New uploaded image URLs:', newImageUrls);

            // Add new images to existing ones
            const updatedImages = [...existingTour.images, ...newImageUrls];

            return await this.databaseService.tour.update({
                where: { id },
                data: {
                    images: updatedImages
                },
                select: {
                    id: true,
                    name: true,
                    images: true
                }
            });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }

            console.log('Error adding tour images:', error);
            throw new InternalServerErrorException('Failed to add images to tour. Please try again later.');
        }
    }

    async removeTourImages(id: number, imageUrls: string[]) {
        try {
            // Check if tour exists
            const existingTour = await this.databaseService.tour.findUnique({
                where: { id }
            });

            if (!existingTour) {
                throw new NotFoundException(`Tour with ID ${id} not found`);
            }

            if (!imageUrls || imageUrls.length === 0) {
                throw new BadRequestException('At least one image URL is required');
            }

            // Remove specified images from tour
            const updatedImages = existingTour.images.filter(url => !imageUrls.includes(url));

            return await this.databaseService.tour.update({
                where: { id },
                data: {
                    images: updatedImages
                },
                select: {
                    id: true,
                    name: true,
                    images: true
                }
            });
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }

            console.log('Error removing tour images:', error);
            throw new InternalServerErrorException('Failed to remove images from tour. Please try again later.');
        }
    }
}
