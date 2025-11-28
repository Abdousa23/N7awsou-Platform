import { IsOptional, IsString, IsBoolean, IsDateString, IsNumber, Min, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TripType } from '@prisma/client';

export class TourFilterDto {
    @IsOptional()
    @IsString()
    departureLocation?: string;

    @IsOptional()
    @IsString()
    destinationLocation?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    tripType?: TripType;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    availability?: boolean;

    @IsOptional()
    departureDate?: Date;

    @IsOptional()
    returnDate?: Date;

    @IsOptional()
    @Type(() => Number)
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @Min(0)
    maxPrice?: number;
}
