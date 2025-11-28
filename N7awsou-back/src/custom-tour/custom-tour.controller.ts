import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { CustomTourService } from './custom-tour.service';
import { CreateCustomTourDto } from './dto/create-custom-tour.dto';
import { UpdateCustomTourDto } from './dto/update-custom-tour.dto';
import { Auth, Role } from 'src/common/decorators';

@Controller('custom-tour')
export class CustomTourController {
  constructor(private readonly customTourService: CustomTourService) {}

  @Auth(Role.VENDEUR, Role.ADMIN , Role.TOURIST)
  @Post()
  create(@Body(ValidationPipe) createCustomTourDto: CreateCustomTourDto) {
    console.log("Creating custom tour with data:", createCustomTourDto);
    return this.customTourService.create(createCustomTourDto);
  }

  @Get()
  findAll() {
    return this.customTourService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customTourService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomTourDto: UpdateCustomTourDto) {
    return this.customTourService.update(+id, updateCustomTourDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customTourService.remove(+id);
  }
}
