import { Controller } from '@nestjs/common';
import { ToursService } from './tours.service';
import { CreateTourDto } from './DTO/create-tour.dto';
import { UpdateTourDto } from './DTO/update-tour.dto';
import { TourFilterDto } from './DTO/tour-filter.dto';
import { GetCurrentUser, Public } from 'src/common/decorators';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Role } from 'src/common/decorators/roles.decorator';
import { Body, Get, Post, Patch, Delete, Param, ParseIntPipe, Query, ValidationPipe, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { HistoryService } from 'src/history/history.service';

@Controller('tours')
export class ToursController {
    constructor(private readonly toursService: ToursService,
        private readonly historyService: HistoryService
    ) { }

    // Only SELLERS and ADMINS can create tours
    @Auth(Role.VENDEUR, Role.ADMIN)
    @Post()
    @UseInterceptors(FilesInterceptor('images', 10)) // Allow up to 10 images
    createTour(
        @Body(ValidationPipe) createTourDto: CreateTourDto,
        @GetCurrentUser("sub") userId: number,
        @UploadedFiles() images?: Express.Multer.File[]
    ) {
        return this.toursService.createTour(createTourDto, userId, images);
    }

    // Only VENDEURS and ADMINS can update tours
    @Auth(Role.VENDEUR, Role.ADMIN)
    @Patch(':id')
    @UseInterceptors(FilesInterceptor('images', 10)) // Allow up to 10 images
    updateTour(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) updateTourDto: UpdateTourDto,
        @GetCurrentUser("sub") userId: number,
        @UploadedFiles() images?: Express.Multer.File[]
    ) {
        return this.toursService.updateTour(id, updateTourDto, images);
    }

    // Only ADMINS can delete tours
    @Auth(Role.ADMIN)
    @Delete(':id')
    deleteTour(@Param('id', ParseIntPipe) id: number) {
        return this.toursService.deleteTour(id);
    }

    @Auth(Role.VENDEUR, Role.ADMIN)
    @Get('seller/:id')
    findToursBySeller(@Param('id', ParseIntPipe) sellerId: number) {
        return this.toursService.findSellerTours(sellerId);
    }

    // Public route - anyone can view tours
    @Get()
    @Public()
    findAllTours(@Query(ValidationPipe) filterDto: TourFilterDto) {
        return this.toursService.findAllTours(filterDto);
    }

    // Public route - anyone can view a specific tour
    @Get(':id')
    @Public()
    async findTourById(
        @Param('id', ParseIntPipe) id: number,
        @GetCurrentUser('sub') userId?: number
    ) {
        const getTour = await this.toursService.findTourById(id);

        // Only track history for authenticated users
        if (userId) {
            try {
                await this.historyService.incrementHistoryEntryViews(id, userId);
            } catch (error) {
                // Log the error but don't fail the tour retrieval
                console.log('Failed to track user interaction:', error.message);
            }
        }

        return getTour;
    }

    // Add images to existing tour and probably gonna be deleted later
    @Auth(Role.VENDEUR, Role.ADMIN)
    @Post(':id/images')
    @UseInterceptors(FilesInterceptor('images', 10))
    async addTourImages(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFiles() images: Express.Multer.File[],
        @GetCurrentUser("sub") userId: number
    ) {
        return this.toursService.addTourImages(id, images);
    }

    // Remove specific images from tour
    @Auth(Role.VENDEUR, Role.ADMIN)
    @Delete(':id/images')
    async removeTourImages(
        @Param('id', ParseIntPipe) id: number,
        @Body('imageUrls') imageUrls: string[],
        @GetCurrentUser("sub") userId: number
    ) {
        return this.toursService.removeTourImages(id, imageUrls);
    }
}
