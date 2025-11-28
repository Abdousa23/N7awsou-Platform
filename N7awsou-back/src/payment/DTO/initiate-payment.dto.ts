import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsPositive } from 'class-validator';

export class InitiatePaymentDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    tourId: number;
    
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    numberOfPeople: number = 1;
    
    @IsOptional()
    @IsString()
    selectedDate?: string;
    
    @IsOptional()
    @IsString()
    notes?: string;
}
