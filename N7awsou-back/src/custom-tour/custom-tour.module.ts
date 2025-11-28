import { Module } from '@nestjs/common';
import { CustomTourService } from './custom-tour.service';
import { CustomTourController } from './custom-tour.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CustomTourController],
  providers: [CustomTourService],
})
export class CustomTourModule {}
