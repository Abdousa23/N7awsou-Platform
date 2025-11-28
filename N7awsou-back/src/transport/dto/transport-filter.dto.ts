import { IsOptional, IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TransportType } from './create-transport.dto';

export class TransportFilterDto {
    @IsOptional()
    @IsEnum(TransportType)
    type?: TransportType;

    @IsOptional()
    @IsString()
    destination?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    minCapacity?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxCapacity?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxPrice?: number;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    availableOnly?: boolean;
}
