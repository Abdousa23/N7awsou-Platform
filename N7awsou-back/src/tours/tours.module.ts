import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { ToursController } from './tours.controller';
import { ToursService } from './tours.service';
import { HistoryModule } from 'src/history/history.module';
import { HistoryService } from 'src/history/history.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
    imports: [DatabaseModule, HistoryModule, CloudinaryModule],
    controllers: [ToursController],
    providers: [ToursService, HistoryService]
})
export class ToursModule { }
