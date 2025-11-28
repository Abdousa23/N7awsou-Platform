import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Country name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Country name must not exceed 100 characters' })
  name: string;
}
