import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsPositive } from 'class-validator';

export class CreatePaymentDto {
    userId?: number; // Will be set from JWT token
    
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
    currency?: string = 'DZD';
    
    @IsOptional()
    @IsString()
    transactionId?: string; // From payment gateway
    
    @IsOptional()
    @IsString()
    notes?: string;
}
