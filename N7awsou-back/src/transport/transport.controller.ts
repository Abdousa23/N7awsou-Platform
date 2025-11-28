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
  ValidationPipe,
  ParseFloatPipe
} from '@nestjs/common';
import { TransportService } from './transport.service';
import { CreateTransportDto, TransportType } from './dto/create-transport.dto';
import { UpdateTransportDto } from './dto/update-transport.dto';
import { Public } from 'src/common/decorators';

@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Post()
  create(@Body(ValidationPipe) createTransportDto: CreateTransportDto) {
    return this.transportService.create(createTransportDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.transportService.findAll();
  }

  @Public()
  @Get('types')
  getTransportTypes() {
    return this.transportService.getTransportTypes();
  }

  @Public()
  @Get('statistics')
  getStatistics() {
    return this.transportService.getStatistics();
  }

  @Public()
  @Get('by-type/:type')
  findByType(@Param('type') type: TransportType) {
    return this.transportService.findByType(type);
  }

  @Public()
  @Get('by-destination')
  findByDestination(@Query('destination') destination: string) {
    return this.transportService.findByDestination(destination);
  }

  @Public()
  @Get('by-capacity')
  findByCapacity(@Query('minCapacity', ParseIntPipe) minCapacity: number) {
    return this.transportService.findByCapacity(minCapacity);
  }

  @Public()
  @Get('by-price-range')
  findByPriceRange(
    @Query('minPrice', ParseFloatPipe) minPrice: number,
    @Query('maxPrice', ParseFloatPipe) maxPrice: number,
  ) {
    return this.transportService.findByPriceRange(minPrice, maxPrice);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transportService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body(ValidationPipe) updateTransportDto: UpdateTransportDto
  ) {
    return this.transportService.update(id, updateTransportDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.transportService.remove(id);
  }
}
