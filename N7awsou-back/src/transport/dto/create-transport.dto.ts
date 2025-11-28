import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

// Define the enum locally to avoid Prisma client issues
export enum TransportType {
  BUS = 'BUS',
  TRAIN = 'TRAIN',
  FLIGHT = 'FLIGHT',
  CAR = 'CAR'
}

export class CreateTransportDto {
    @IsArray()
    @IsEnum(TransportType, { each: true })
    @IsNotEmpty()
    type: TransportType[];

    @IsNumber()
    @IsNotEmpty()
    capacity: number;

    @IsString()
    @IsNotEmpty()
    destination: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;
}
