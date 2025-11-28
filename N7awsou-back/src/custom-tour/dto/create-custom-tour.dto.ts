import { IsDate, IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean } from "class-validator";
import { Transform, Type } from "class-transformer";

export class CreateCustomTourDto {
    @IsNumber()
    @IsNotEmpty()
    guests: number;

    @Transform(({ value }) => {
        if (typeof value === 'string') {
            // If it's a date string like "2026-01-01", convert to full DateTime
            return new Date(value + 'T00:00:00.000Z');
        }
        return value;
    })
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    departureDate: Date;

    @Transform(({ value }) => {
        if (typeof value === 'string') {
            // If it's a date string like "2026-01-07", convert to full DateTime
            return new Date(value + 'T23:59:59.999Z');
        }
        return value;
    })
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    returnDate: Date;

    @IsString()
    @IsNotEmpty()
    departureLocation: string;

    @IsString()
    @IsNotEmpty()
    destinationLocation: string;

    @IsNumber()
    @IsNotEmpty()
    countryId: number;

    @IsNumber()
    @IsOptional()
    cityId?: number;

    @IsNumber()
    @IsOptional()
    hotelId?: number;

    @IsNumber()
    @IsOptional()
    roomId?: number;

    @IsBoolean()
    @IsOptional()
    withGuide?: boolean;

    @IsNumber()
    @IsNotEmpty()
    duration: number;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsNumber()
    @IsNotEmpty()
    transportId: number; // Should be required, not optional
}