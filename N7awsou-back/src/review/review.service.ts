/* eslint-disable */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createReviewDto: CreateReviewDto) {
    const { rating, review, userId, tourId } = createReviewDto;

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5.');
    }

    const user = await this.databaseService.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const tour = await this.databaseService.tour.findUnique({ where: { id: tourId } });
    if (!tour) throw new NotFoundException('Tour not found');

    const existingReview = await this.databaseService.review.findFirst({
      where: { userId, tourId },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this tour.');
    }

    const newReview = await this.databaseService.review.create({
      data: {
        rating,
        review,
        user: { connect: { id: userId } },
        tour: { connect: { id: tourId } },
      },
    });

    await this.updateTourRating(tourId);

    return newReview;
  }

  async delete(reviewId: number, user: { id: number; role: string }) {
    const review = await this.databaseService.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== user.id && user.role !== 'ADMIN') {
      throw new BadRequestException('You are not allowed to delete this review');
    }

    await this.databaseService.review.delete({
      where: { id: reviewId },
    });

    await this.updateTourRating(review.tourId);

    return { message: 'Review deleted successfully' };
  }

  async findAll() {
    return this.databaseService.review.findMany({
      include: {
        user: true,
        tour: true,
      },
    });
  }

  private async updateTourRating(tourId: number) {
    const reviews = await this.databaseService.review.findMany({
      where: { tourId },
      select: { rating: true },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    await this.databaseService.tour.update({
      where: { id: tourId },
      data: { Rating: averageRating },
    });
  }
}
