import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  ParseIntPipe, 
  ValidationPipe 
} from '@nestjs/common';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { CountryFilterDto } from './dto/country-filter.dto';
import { Public } from 'src/common/decorators';

@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post()
  create(@Body(ValidationPipe) createCountryDto: CreateCountryDto) {
    return this.countryService.create(createCountryDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.countryService.findAll();
  }

  @Public()
  @Get('filter')
  findAllWithFilters(@Query(ValidationPipe) filterDto: CountryFilterDto) {
    return this.countryService.findAllWithFilters(filterDto);
  }

  @Public()
  @Get('transport/:type')
  findByTransportType(@Param('type') transportType: string) {
    return this.countryService.getCountriesByTransportType(transportType);
  }

  @Public()
  @Get('hotels/rating')
  findByHotelRating(
    @Query('minRating', ParseIntPipe) minRating?: number,
    @Query('maxRating', ParseIntPipe) maxRating?: number
  ) {
    return this.countryService.getCountriesByHotelRating(minRating, maxRating);
  }

  @Public()
  @Get('rooms/price-level/:level')
  findByRoomPriceLevel(@Param('level') priceLevel: string) {
    return this.countryService.getCountriesByRoomPriceLevel(priceLevel);
  }

  @Public()
  @Get('rooms/price-range')
  findByRoomPriceRange(
    @Query('minPrice', ParseIntPipe) minPrice?: number,
    @Query('maxPrice', ParseIntPipe) maxPrice?: number
  ) {
    return this.countryService.getCountriesByRoomPriceRange(minPrice, maxPrice);
  }

  @Public()
  @Get(':id/rooms')
  getRoomsByCountry(@Param('id', ParseIntPipe) countryId: number) {
    return this.countryService.getRoomsByCountry(countryId);
  }

  @Public()
  @Get('statistics')
  getStatistics() {
    return this.countryService.getStatistics();
  }

  @Public()
  @Get('search')
  findByName(@Query('name') name: string) {
    return this.countryService.findByName(name);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Query('includeTransport') includeTransport?: string) {
    const shouldIncludeTransport = includeTransport === 'true';
    return this.countryService.findOneWithDetails(id, shouldIncludeTransport);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body(ValidationPipe) updateCountryDto: UpdateCountryDto
  ) {
    return this.countryService.update(id, updateCountryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.countryService.remove(id);
  }
}
