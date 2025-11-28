import { IsNotEmpty, IsString, IsInt, MinLength, MaxLength, IsPositive } from 'class-validator';

export class CreateCityDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'City name must be at least 2 characters long' })
  @MaxLength(100, { message: 'City name must not exceed 100 characters' })
  name: string;

  @IsInt()
  @IsPositive({ message: 'Country ID must be a positive number' })
  countryId: number;
}
