/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { CreateCityDto } from './dto/create-city.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { CreateRoomDto } from './dto/create-rooms.dto';

@Injectable()
export class HotelService {
  constructor(private databaseService: DatabaseService) {}

  createCountry(dto: CreateCountryDto) {
    return this.databaseService.country.create({ data: dto });
  }

  createCity(dto: CreateCityDto) {
    return this.databaseService.city.create({
      data: {
        name: dto.name,
        country: { connect: { id: dto.countryId } },
      },
    });
  }

  createHotel(dto: CreateHotelDto) {
    return this.databaseService.hotel.create({
      data: {
        name: dto.name,
        rating: dto.rating,
        phone: dto.phone,
        email: dto.email,
        city: { connect: { id: dto.cityId } },
      },
    });
  }

  createRoom(dto: CreateRoomDto) {
    return this.databaseService.room.create({
      data: {
        hotelId: dto.hotelId,
        occupancy: dto.occupancy,
        priceLevel: dto.priceLevel,
        pricePerNight: dto.pricePerNight,
      },
    });
  }

  getHotelsByCity(cityId: number) {
    return this.databaseService.hotel.findMany({
      where: { cityId },
      include: { rooms: true },
    });
  }

  getCitiesByCountry(countryId: number) {
    return this.databaseService.city.findMany({ where: { countryId } });
  }
}
