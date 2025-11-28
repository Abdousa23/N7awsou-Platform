import { IsOptional, IsString, IsInt, IsPositive, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CityFilterDto {
    @IsOptional()
    @IsString()
    @MinLength(1, { message: 'Search term must be at least 1 character long' })
    search?: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @IsPositive({ message: 'Country ID must be a positive number' })
    countryId?: number;

    @IsOptional()
    @IsString()
    sortBy?: 'name' | 'countryName' | 'hotelCount' | 'customTourCount';

    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc';
}
