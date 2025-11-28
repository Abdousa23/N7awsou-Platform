import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { CityFilterDto } from './dto/city-filter.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CityService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCityDto: CreateCityDto) {
    try {
      // Check if country exists
      const country = await this.databaseService.country.findUnique({
        where: { id: createCityDto.countryId },
      });

      if (!country) {
        throw new NotFoundException(`Country with ID ${createCityDto.countryId} not found`);
      }

      const city = await this.databaseService.city.create({
        data: createCityDto,
        include: {
          country: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return city;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`City with name '${createCityDto.name}' already exists in this country`);
      }
      throw error;
    }
  }

  async findAll(filterDto?: CityFilterDto) {
    const {
      search,
      countryId,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filterDto || {};

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { country: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (countryId) {
      where.countryId = countryId;
    }

    let orderBy: any = {};
    switch (sortBy) {
      case 'name':
        orderBy = { name: sortOrder };
        break;
      case 'countryName':
        orderBy = { country: { name: sortOrder } };
        break;
      case 'hotelCount':
        orderBy = { hotels: { _count: sortOrder } };
        break;
      case 'customTourCount':
        orderBy = { CustomTour: { _count: sortOrder } };
        break;
      default:
        orderBy = { name: sortOrder };
    }

    const cities = await this.databaseService.city.findMany({
      where,
      include: {
        country: {
          select: {
            id: true,
            name: true,
          },
        },
        hotels: {
          select: {
            id: true,
            name: true,
            rating: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            hotels: true,
            CustomTour: true,
          },
        },
      },
      orderBy,
    });

    return cities;
  }

  async findOne(id: number) {
    const city = await this.databaseService.city.findUnique({
      where: { id },
      include: {
        country: {
          select: {
            id: true,
            name: true,
          },
        },
        hotels: {
          include: {
            rooms: {
              select: {
                id: true,
                priceLevel: true,
                pricePerNight: true,
                occupancy: true,
              },
            },
            _count: {
              select: {
                rooms: true,
                customTours: true,
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
        CustomTour: {
          select: {
            id: true,
            guests: true,
            departureDate: true,
            returnDate: true,
            price: true,
            duration: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            hotels: true,
            CustomTour: true,
          },
        },
      },
    });

    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }

    return city;
  }

  async findByCountry(countryId: number) {
    // Check if country exists
    const country = await this.databaseService.country.findUnique({
      where: { id: countryId },
    });

    if (!country) {
      throw new NotFoundException(`Country with ID ${countryId} not found`);
    }

    const cities = await this.databaseService.city.findMany({
      where: { countryId },
      include: {
        country: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            hotels: true,
            CustomTour: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return cities;
  }

  async findByName(name: string) {
    const cities = await this.databaseService.city.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      include: {
        country: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            hotels: true,
            CustomTour: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return cities;
  }

  async getStatistics() {
    const totalCities = await this.databaseService.city.count();
    
    const citiesPerCountry = await this.databaseService.city.groupBy({
      by: ['countryId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    const topCountriesWithCities = await Promise.all(
      citiesPerCountry.slice(0, 5).map(async (item) => {
        const country = await this.databaseService.country.findUnique({
          where: { id: item.countryId },
          select: { name: true },
        });
        return {
          countryId: item.countryId,
          countryName: country?.name || 'Unknown',
          cityCount: item._count.id,
        };
      })
    );

    const citiesWithMostHotels = await this.databaseService.city.findMany({
      take: 5,
      include: {
        country: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            hotels: true,
          },
        },
      },
      orderBy: {
        hotels: {
          _count: 'desc',
        },
      },
    });

    const citiesWithMostCustomTours = await this.databaseService.city.findMany({
      take: 5,
      include: {
        country: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            CustomTour: true,
          },
        },
      },
      orderBy: {
        CustomTour: {
          _count: 'desc',
        },
      },
    });

    return {
      totalCities,
      topCountriesWithCities,
      citiesWithMostHotels: citiesWithMostHotels.map(city => ({
        id: city.id,
        name: city.name,
        countryName: city.country.name,
        hotelCount: city._count.hotels,
      })),
      citiesWithMostCustomTours: citiesWithMostCustomTours.map(city => ({
        id: city.id,
        name: city.name,
        countryName: city.country.name,
        customTourCount: city._count.CustomTour,
      })),
    };
  }

  async update(id: number, updateCityDto: UpdateCityDto) {
    // Check if city exists
    const existingCity = await this.databaseService.city.findUnique({
      where: { id },
    });

    if (!existingCity) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }

    // If countryId is being updated, check if the new country exists
    if (updateCityDto.countryId && updateCityDto.countryId !== existingCity.countryId) {
      const country = await this.databaseService.country.findUnique({
        where: { id: updateCityDto.countryId },
      });

      if (!country) {
        throw new NotFoundException(`Country with ID ${updateCityDto.countryId} not found`);
      }
    }

    try {
      const city = await this.databaseService.city.update({
        where: { id },
        data: updateCityDto,
        include: {
          country: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return city;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`City with name '${updateCityDto.name}' already exists in this country`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    // Check if city exists
    const city = await this.databaseService.city.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            hotels: true,
            CustomTour: true,
          },
        },
      },
    });

    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }

    // Check for related records (optional warning)
    if (city._count.hotels > 0 || city._count.CustomTour > 0) {
      // You might want to prevent deletion or cascade delete
      // For now, we'll allow deletion as the schema has cascade delete
    }

    await this.databaseService.city.delete({
      where: { id },
    });

    return { message: `City with ID ${id} has been successfully deleted` };
  }
}
