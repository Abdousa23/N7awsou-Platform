import { Module } from '@nestjs/common';
import { TransportService } from './transport.service';
import { TransportController } from './transport.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TransportController],
  providers: [TransportService],
  exports: [TransportService],
})
export class TransportModule {}
