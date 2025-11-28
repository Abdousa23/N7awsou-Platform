import { IsString, IsEmail, IsOptional, IsNotEmpty, IsInt } from 'class-validator';

export class CreateSellerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsInt()
  @IsNotEmpty()
  userId: number;
}
