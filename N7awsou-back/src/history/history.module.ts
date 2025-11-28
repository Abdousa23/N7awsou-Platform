import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [HistoryController],
  providers: [HistoryService]
})
export class HistoryModule {}
