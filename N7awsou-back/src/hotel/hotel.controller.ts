/* eslint-disable*/
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { CreateCityDto } from './dto/create-city.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { CreateRoomDto } from './dto/create-rooms.dto';

@Controller('hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post('country')
  createCountry(@Body() dto: CreateCountryDto) {
    return this.hotelService.createCountry(dto);
  }

  @Post('city')
  createCity(@Body() dto: CreateCityDto) {
    return this.hotelService.createCity(dto);
  }

  @Post('hotel')
  createHotel(@Body() dto: CreateHotelDto) {
    return this.hotelService.createHotel(dto);
  }

  @Post('room')
  createRoom(@Body() dto: CreateRoomDto) {
    return this.hotelService.createRoom(dto);
  }

  @Get('cities/:countryId')
  getCities(@Param('countryId') countryId: string) {
    return this.hotelService.getCitiesByCountry(+countryId);
  }

  @Get('hotels/:cityId')
  getHotels(@Param('cityId') cityId: string) {
    return this.hotelService.getHotelsByCity(+cityId);
  }
}
