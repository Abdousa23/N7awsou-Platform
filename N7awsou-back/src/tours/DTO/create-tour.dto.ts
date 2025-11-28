import { IsDate, IsNotEmpty, IsNumber, isNumber, IsString } from "class-validator";
import { TripType } from "generated/prisma";

export class CreateTourDto {
    @IsString()
    @IsNotEmpty()
    name: string;
    @IsString()
    description: string;
    @IsNotEmpty()
    @IsNumber()
    price: number;
    @IsNotEmpty()
    tripType: TripType;
    @IsNotEmpty()
    departureDate: Date;
    @IsNotEmpty()
    returnDate: Date;
    @IsString()
    @IsNotEmpty()
    departureLocation: string;
    @IsString()
    @IsNotEmpty()
    destinationLocation: string;
    includedFeatures: string[];
    images: string[];
    @IsString()
    dressCode?: string;
    duration: number;
    @IsNumber()
    availableCapacity?: number;
    @IsNumber()
    maxCapacity?: number;
}
