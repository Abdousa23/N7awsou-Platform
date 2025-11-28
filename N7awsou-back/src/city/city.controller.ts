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
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { CityFilterDto } from './dto/city-filter.dto';
import { Public } from 'src/common/decorators';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  create(@Body(ValidationPipe) createCityDto: CreateCityDto) {
    return this.cityService.create(createCityDto);
  }

  @Public()
  @Get()
  findAll(@Query(ValidationPipe) filterDto: CityFilterDto) {
    return this.cityService.findAll(filterDto);
  }

  @Public()
  @Get('statistics')
  getStatistics() {
    return this.cityService.getStatistics();
  }

  @Public()
  @Get('search')
  findByName(@Query('name') name: string) {
    return this.cityService.findByName(name);
  }

  @Public()
  @Get('by-country/:countryId')
  findByCountry(@Param('countryId', ParseIntPipe) countryId: number) {
    return this.cityService.findByCountry(countryId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cityService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body(ValidationPipe) updateCityDto: UpdateCityDto
  ) {
    return this.cityService.update(id, updateCityDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cityService.remove(id);
  }
}
