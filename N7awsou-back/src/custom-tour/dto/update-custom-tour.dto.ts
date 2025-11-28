import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomTourDto } from './create-custom-tour.dto';

export class UpdateCustomTourDto extends PartialType(CreateCustomTourDto) {}
