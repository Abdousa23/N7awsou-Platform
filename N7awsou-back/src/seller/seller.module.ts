import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SellerController],
  providers: [SellerService],
})

export class SellerModule {}
