import { IsOptional, IsString, IsArray, IsEnum, MinLength, IsInt, IsPositive, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum CountrySortBy {
    NAME = 'name',
    CITIES_COUNT = 'citiesCount',
    CUSTOM_TOURS_COUNT = 'customToursCount',
    HOTELS_COUNT = 'hotelsCount',
    ROOMS_COUNT = 'roomsCount',
    CREATED_AT = 'createdAt'
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}

export class CountryFilterDto {
    @IsOptional()
    @MinLength(1, { message: 'Search term must be at least 1 character long' })
    search?: string;

    @IsOptional()
    @MinLength(1, { message: 'Country name must be at least 1 character long' })
    countryName?: string;

    @IsOptional()
    @MinLength(1, { message: 'City name must be at least 1 character long' })
    cityName?: string;

    @IsOptional()
    @IsArray()
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    transportTypes?: string[];

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    transportId?: number;

    @IsOptional()
    @MinLength(1, { message: 'Hotel name must be at least 1 character long' })
    hotelName?: string;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    hotelId?: number;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    minRating?: number;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    maxRating?: number;

    @IsOptional()
    @IsArray()
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    priceLevels?: string[];

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    roomId?: number;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    minRoomPrice?: number;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    maxRoomPrice?: number;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    minRoomOccupancy?: number;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    maxRoomOccupancy?: number;

    @IsOptional()
    @IsEnum(CountrySortBy)
    sortBy?: CountrySortBy = CountrySortBy.NAME;

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.ASC;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    includeTransport?: boolean = false;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    includeCities?: boolean = true;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    includeCustomTours?: boolean = false;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    includeHotels?: boolean = false;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    includeRooms?: boolean = false;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @IsPositive()
    limit?: number = 50;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(0)
    offset?: number = 0;
}
