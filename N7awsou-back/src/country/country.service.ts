import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CountryFilterDto } from './dto/country-filter.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CountryService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCountryDto: CreateCountryDto) {
    try {
      const country = await this.databaseService.country.create({
        data: createCountryDto,
      });
      return country;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Country with name '${createCountryDto.name}' already exists`);
      }
      throw error;
    }
  }

  async findAll() {
    const countries = await this.databaseService.country.findMany({
      include: {
        cities: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            cities: true,
            customTours: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return countries;
  }

  async findOne(id: number) {
    const country = await this.databaseService.country.findUnique({
      where: { id },
      include: {
        cities: {
          include: {
            hotels: {
              select: {
                id: true,
                name: true,
                rating: true,
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
        },
        customTours: {
          select: {
            id: true,
            guests: true,
            departureDate: true,
            returnDate: true,
            price: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            cities: true,
            customTours: true,
          },
        },
      },
    });

    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    return country;
  }

  async findByName(name: string) {
    const countries = await this.databaseService.country.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      include: {
        cities: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            cities: true,
            customTours: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return countries;
  }

  async update(id: number, updateCountryDto: UpdateCountryDto) {
    // Check if country exists
    await this.findOne(id);

    try {
      const country = await this.databaseService.country.update({
        where: { id },
        data: updateCountryDto,
      });
      return country;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Country with name '${updateCountryDto.name}' already exists`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    // Check if country exists
    const country = await this.findOne(id);

    // Check if country has cities
    const citiesCount = await this.databaseService.city.count({
      where: { countryId: id },
    });

    if (citiesCount > 0) {
      throw new ConflictException(
        `Cannot delete country '${country.name}'. It has ${citiesCount} cities. Please delete all cities first.`
      );
    }

    // Check if country has custom tours
    const customToursCount = await this.databaseService.customTour.count({
      where: { countryId: id },
    });

    if (customToursCount > 0) {
      throw new ConflictException(
        `Cannot delete country '${country.name}'. It has ${customToursCount} custom tours. Please delete all custom tours first.`
      );
    }

    await this.databaseService.country.delete({
      where: { id },
    });

    return { message: `Country '${country.name}' has been successfully deleted` };
  }

  async getStatistics() {
    const total = await this.databaseService.country.count();
    
    const countriesWithMostCities = await this.databaseService.country.findMany({
      include: {
        _count: {
          select: {
            cities: true,
            customTours: true,
          },
        },
      },
      orderBy: {
        cities: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    const totalCities = await this.databaseService.city.count();
    const totalCustomTours = await this.databaseService.customTour.count();

    return {
      totalCountries: total,
      totalCities,
      totalCustomTours,
      countriesWithMostCities: countriesWithMostCities.map(country => ({
        id: country.id,
        name: country.name,
        citiesCount: country._count.cities,
        customToursCount: country._count.customTours,
      })),
    };
  }

  async findAllWithFilters(filterDto?: CountryFilterDto) {
    const {
      search,
      countryName,
      cityName,
      transportTypes,
      transportId,
      hotelName,
      hotelId,
      minRating,
      maxRating,
      priceLevels,
      roomId,
      minRoomPrice,
      maxRoomPrice,
      minRoomOccupancy,
      maxRoomOccupancy,
      sortBy = 'name',
      sortOrder = 'asc',
      includeTransport = true,
      includeCities = true,
      includeCustomTours = false,
      includeHotels = false,
      includeRooms = false,
      limit = 50,
      offset = 0,
    } = filterDto || {};

    // Ensure proper type conversion for all numeric parameters
    const numericHotelId = hotelId ? Number(hotelId) : undefined;
    const numericRoomId = roomId ? Number(roomId) : undefined;
    const numericTransportId = transportId ? Number(transportId) : undefined;
    const numericMinRating = minRating ? Number(minRating) : undefined;
    const numericMaxRating = maxRating ? Number(maxRating) : undefined;
    const numericMinRoomPrice = minRoomPrice ? Number(minRoomPrice) : undefined;
    const numericMaxRoomPrice = maxRoomPrice ? Number(maxRoomPrice) : undefined;
    const numericMinRoomOccupancy = minRoomOccupancy ? Number(minRoomOccupancy) : undefined;
    const numericMaxRoomOccupancy = maxRoomOccupancy ? Number(maxRoomOccupancy) : undefined;

    // Build the where clause
    const where: any = {};
    const conditions: any[] = [];

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { cities: { some: { name: { contains: search, mode: 'insensitive' } } } },
          { cities: { some: { hotels: { some: { name: { contains: search, mode: 'insensitive' } } } } } },
        ],
      });
    }

    if (countryName) {
      conditions.push({
        name: { contains: countryName, mode: 'insensitive' },
      });
    }

    if (cityName) {
      conditions.push({
        cities: {
          some: {
            name: { contains: cityName, mode: 'insensitive' },
          },
        },
      });
    }

    if (hotelName) {
      conditions.push({
        cities: {
          some: {
            hotels: {
              some: {
                name: { contains: hotelName, mode: 'insensitive' },
              },
            },
          },
        },
      });
    }

    if (numericHotelId) {
      conditions.push({
        cities: {
          some: {
            hotels: {
              some: {
                id: numericHotelId,
              },
            },
          },
        },
      });
    }

    if (numericMinRating || numericMaxRating) {
      const ratingCondition: any = {};
      if (numericMinRating) ratingCondition.gte = numericMinRating;
      if (numericMaxRating) ratingCondition.lte = numericMaxRating;

      conditions.push({
        cities: {
          some: {
            hotels: {
              some: {
                rating: ratingCondition,
              },
            },
          },
        },
      });
    }

    if (priceLevels && priceLevels.length > 0) {
      const validPriceLevels = ['LOW', 'MEDIUM', 'HIGH'];
      const validLevels = priceLevels
        .map(level => level.toUpperCase())
        .filter(level => validPriceLevels.includes(level));

      if (validLevels.length > 0) {
        conditions.push({
          cities: {
            some: {
              hotels: {
                some: {
                  rooms: {
                    some: {
                      priceLevel: {
                        in: validLevels as any,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      }
    }

    if (numericRoomId) {
      conditions.push({
        cities: {
          some: {
            hotels: {
              some: {
                rooms: {
                  some: {
                    id: numericRoomId,
                  },
                },
              },
            },
          },
        },
      });
    }

    if (numericMinRoomPrice || numericMaxRoomPrice) {
      const priceCondition: any = {};
      if (numericMinRoomPrice) priceCondition.gte = numericMinRoomPrice;
      if (numericMaxRoomPrice) priceCondition.lte = numericMaxRoomPrice;

      conditions.push({
        cities: {
          some: {
            hotels: {
              some: {
                rooms: {
                  some: {
                    pricePerNight: priceCondition,
                  },
                },
              },
            },
          },
        },
      });
    }

    if (numericMinRoomOccupancy || numericMaxRoomOccupancy) {
      const occupancyCondition: any = {};
      if (numericMinRoomOccupancy) occupancyCondition.gte = numericMinRoomOccupancy;
      if (numericMaxRoomOccupancy) occupancyCondition.lte = numericMaxRoomOccupancy;

      conditions.push({
        cities: {
          some: {
            hotels: {
              some: {
                rooms: {
                  some: {
                    occupancy: occupancyCondition,
                  },
                },
              },
            },
          },
        },
      });
    }

    if (transportTypes && transportTypes.length > 0) {
      const validTransportTypes = ['BUS', 'TRAIN', 'FLIGHT', 'CAR'];
      const validTypes = transportTypes
        .map(type => type.toUpperCase())
        .filter(type => validTransportTypes.includes(type));

      if (validTypes.length > 0) {
        conditions.push({
          customTours: {
            some: {
              transport: {
                type: {
                  hasSome: validTypes as any,
                },
              },
            },
          },
        });
      }
    }

    if (numericTransportId) {
      conditions.push({
        customTours: {
          some: {
            transportId: numericTransportId,
          },
        },
      });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    // Build the orderBy clause
    let orderBy: any;
    switch (sortBy) {
      case 'citiesCount':
        orderBy = { cities: { _count: sortOrder } };
        break;
      case 'customToursCount':
        orderBy = { customTours: { _count: sortOrder } };
        break;
      case 'hotelsCount':
        // This will require a more complex query, so we'll sort after fetching
        orderBy = { name: sortOrder }; // Default sort, will be overridden later
        break;
      case 'roomsCount':
        // This will require a more complex query, so we'll sort after fetching
        orderBy = { name: sortOrder }; // Default sort, will be overridden later
        break;
      case 'createdAt':
        orderBy = { createdAt: sortOrder };
        break;
      default:
        orderBy = { name: sortOrder };
    }

    // Build the include clause
    const include: any = {
      _count: {
        select: {
          cities: true,
          customTours: true,
        },
      },
    };

    if (includeCities) {
      include.cities = {
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      };

      if (includeHotels) {
        include.cities.select.hotels = {
          select: {
            id: true,
            name: true,
            rating: true,
            email: true,
            phone: true,
          },
          orderBy: {
            name: 'asc',
          },
        };

        if (includeRooms) {
          include.cities.select.hotels.select.rooms = {
            select: {
              id: true,
              occupancy: true,
              priceLevel: true,
              pricePerNight: true,
            },
            orderBy: {
              priceLevel: 'asc',
            },
          };
        }

        // Add hotel count to cities
        include.cities.select._count = {
          select: {
            hotels: true,
          },
        };
      }
    }

    // Auto-enable includeCities and includeHotels when includeRooms is true
    if (includeRooms && !includeCities) {
      include.cities = {
        select: {
          id: true,
          name: true,
          hotels: {
            select: {
              id: true,
              name: true,
              rating: true,
              rooms: {
                select: {
                  id: true,
                  occupancy: true,
                  priceLevel: true,
                  pricePerNight: true,
                },
                orderBy: {
                  priceLevel: 'asc',
                },
              },
            },
            orderBy: {
              name: 'asc',
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      };
    }

    // Auto-enable includeCities when includeHotels is true but includeCities is false
    if (includeHotels && !includeCities) {
      include.cities = {
        select: {
          id: true,
          name: true,
          hotels: {
            select: {
              id: true,
              name: true,
              rating: true,
              email: true,
              phone: true,
            },
            orderBy: {
              name: 'asc',
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      };
    }

    if (includeCustomTours) {
      include.customTours = {
        select: {
          id: true,
          guests: true,
          departureDate: true,
          returnDate: true,
          price: true,
          duration: true,
          departureLocation: true,
          destinationLocation: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      };
    }

    if (includeTransport) {
      include.customTours = {
        ...include.customTours,
        select: {
          ...include.customTours?.select,
          transport: {
            select: {
              id: true,
              type: true,
              capacity: true,
              destination: true,
              price: true,
            },
          },
        },
      };
    }

    let countries = await this.databaseService.country.findMany({
      where,
      include,
      orderBy,
      take: Number(limit),
      skip: Number(offset),
    });

    // Handle complex sorting that requires post-processing
    if (sortBy === 'hotelsCount' || sortBy === 'roomsCount') {
      const countriesWithCounts = countries.map(country => {
        const cities = country.cities as any[] || [];
        const hotelsCount = cities.reduce((total, city) => 
          total + ((city.hotels as any[])?.length || 0), 0);
        const roomsCount = cities.reduce((total, city) => 
          total + ((city.hotels as any[])?.reduce((hotelTotal, hotel) => 
            hotelTotal + ((hotel.rooms as any[])?.length || 0), 0) || 0), 0);
        
        return {
          country,
          hotelsCount,
          roomsCount,
        };
      }).sort((a, b) => {
        const aValue = sortBy === 'hotelsCount' ? a.hotelsCount : a.roomsCount;
        const bValue = sortBy === 'hotelsCount' ? b.hotelsCount : b.roomsCount;
        
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      });

      countries = countriesWithCounts.map(item => item.country);
    }

    const total = await this.databaseService.country.count({ where });

    return {
      data: countries,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasNext: Number(offset) + Number(limit) < total,
        hasPrev: Number(offset) > 0,
      },
    };
  }

  async findOneWithDetails(id: number, includeTransport: boolean = false) {
    const include: any = {
      cities: {
        include: {
          hotels: {
            select: {
              id: true,
              name: true,
              rating: true,
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
      },
      customTours: {
        select: {
          id: true,
          guests: true,
          departureDate: true,
          returnDate: true,
          price: true,
          duration: true,
          departureLocation: true,
          destinationLocation: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          cities: true,
          customTours: true,
        },
      },
    };

    if (includeTransport) {
      include.customTours.select.transport = {
        select: {
          id: true,
          type: true,
          capacity: true,
          destination: true,
          price: true,
        },
      };
    }

    const country = await this.databaseService.country.findUnique({
      where: { id },
      include,
    });

    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    // Group transports by type if included
    if (includeTransport && country.customTours.length > 0) {
      const transports = country.customTours
        .map(tour => tour.transport)
        .filter((transport, index, self) => 
          index === self.findIndex(t => t.id === transport.id)
        );

      const transportsByType = transports.reduce((acc, transport) => {
        transport.type.forEach(type => {
          if (!acc[type]) {
            acc[type] = [];
          }
          acc[type].push(transport);
        });
        return acc;
      }, {} as Record<string, any[]>);

      return {
        ...country,
        transports: {
          all: transports,
          byType: transportsByType,
        },
      };
    }

    return country;
  }

  async getCountriesByTransportType(transportType: string) {
    // Validate transport type
    const validTransportTypes = ['BUS', 'TRAIN', 'FLIGHT', 'CAR'];
    const upperTransportType = transportType.toUpperCase();
    
    if (!validTransportTypes.includes(upperTransportType)) {
      throw new NotFoundException(`Invalid transport type: ${transportType}`);
    }

    const countries = await this.databaseService.country.findMany({
      where: {
        customTours: {
          some: {
            transport: {
              type: {
                has: upperTransportType as any,
              },
            },
          },
        },
      },
      include: {
        cities: {
          select: {
            id: true,
            name: true,
          },
        },
        customTours: {
          where: {
            transport: {
              type: {
                has: upperTransportType as any,
              },
            },
          },
          select: {
            id: true,
            price: true,
            duration: true,
            transport: {
              select: {
                id: true,
                type: true,
                capacity: true,
                destination: true,
                price: true,
              },
            },
          },
        },
        _count: {
          select: {
            cities: true,
            customTours: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return countries;
  }

  async getCountriesByHotelRating(minRating?: number, maxRating?: number) {
    const ratingCondition: any = {};
    if (minRating) ratingCondition.gte = minRating;
    if (maxRating) ratingCondition.lte = maxRating;

    const countries = await this.databaseService.country.findMany({
      where: {
        cities: {
          some: {
            hotels: {
              some: {
                rating: ratingCondition,
              },
            },
          },
        },
      },
      include: {
        cities: {
          include: {
            hotels: {
              where: {
                rating: ratingCondition,
              },
              select: {
                id: true,
                name: true,
                rating: true,
                email: true,
                phone: true,
                _count: {
                  select: {
                    rooms: true,
                  },
                },
              },
              orderBy: {
                rating: 'desc',
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            cities: true,
            customTours: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return countries;
  }

  async getCountriesByRoomPriceLevel(priceLevel: string) {
    // Validate price level
    const validPriceLevels = ['LOW', 'MEDIUM', 'HIGH'];
    const upperPriceLevel = priceLevel.toUpperCase();
    
    if (!validPriceLevels.includes(upperPriceLevel)) {
      throw new NotFoundException(`Invalid price level: ${priceLevel}`);
    }

    const countries = await this.databaseService.country.findMany({
      where: {
        cities: {
          some: {
            hotels: {
              some: {
                rooms: {
                  some: {
                    priceLevel: upperPriceLevel as any,
                  },
                },
              },
            },
          },
        },
      },
      include: {
        cities: {
          include: {
            hotels: {
              where: {
                rooms: {
                  some: {
                    priceLevel: upperPriceLevel as any,
                  },
                },
              },
              select: {
                id: true,
                name: true,
                rating: true,
                email: true,
                phone: true,
                rooms: {
                  where: {
                    priceLevel: upperPriceLevel as any,
                  },
                  select: {
                    id: true,
                    occupancy: true,
                    priceLevel: true,
                    pricePerNight: true,
                  },
                  orderBy: {
                    pricePerNight: 'asc',
                  },
                },
                _count: {
                  select: {
                    rooms: true,
                  },
                },
              },
              orderBy: {
                name: 'asc',
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            cities: true,
            customTours: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return countries;
  }

  async getCountriesByRoomPriceRange(minPrice?: number, maxPrice?: number) {
    const priceCondition: any = {};
    if (minPrice) priceCondition.gte = minPrice;
    if (maxPrice) priceCondition.lte = maxPrice;

    const countries = await this.databaseService.country.findMany({
      where: {
        cities: {
          some: {
            hotels: {
              some: {
                rooms: {
                  some: {
                    pricePerNight: priceCondition,
                  },
                },
              },
            },
          },
        },
      },
      include: {
        cities: {
          include: {
            hotels: {
              where: {
                rooms: {
                  some: {
                    pricePerNight: priceCondition,
                  },
                },
              },
              select: {
                id: true,
                name: true,
                rating: true,
                email: true,
                phone: true,
                rooms: {
                  where: {
                    pricePerNight: priceCondition,
                  },
                  select: {
                    id: true,
                    occupancy: true,
                    priceLevel: true,
                    pricePerNight: true,
                  },
                  orderBy: {
                    pricePerNight: 'asc',
                  },
                },
                _count: {
                  select: {
                    rooms: true,
                  },
                },
              },
              orderBy: {
                name: 'asc',
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            cities: true,
            customTours: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return countries;
  }

  async getRoomsByCountry(countryId: number) {
    const country = await this.databaseService.country.findUnique({
      where: { id: countryId },
      include: {
        cities: {
          include: {
            hotels: {
              select: {
                id: true,
                name: true,
                rating: true,
                email: true,
                phone: true,
                rooms: {
                  select: {
                    id: true,
                    occupancy: true,
                    priceLevel: true,
                    pricePerNight: true,
                  },
                  orderBy: [
                    { priceLevel: 'asc' },
                    { pricePerNight: 'asc' },
                  ],
                },
                _count: {
                  select: {
                    rooms: true,
                  },
                },
              },
              orderBy: {
                rating: 'desc',
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            cities: true,
            customTours: true,
          },
        },
      },
    });

    if (!country) {
      throw new NotFoundException(`Country with ID ${countryId} not found`);
    }

    return country;
  }
}

