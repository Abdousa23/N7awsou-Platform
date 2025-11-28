import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { MyLoggerModule } from './my-logger/my-logger.module';
import { AuthModule } from './auth/auth.module';
import { AtGuard } from './common/guards';
import { RolesGuard } from './common/guards/roles.guard';
import { ToursModule } from './tours/tours.module';
import { PrismaService } from './prisma/prisma.service';
import { SellerModule } from './seller/seller.module';
import { HistoryModule } from './history/history.module';
import { HotelModule } from './hotel/hotel.module';
import { PaymentModule } from './payment/payment.module';
import { ReviewModule } from './review/review.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CustomTourModule } from './custom-tour/custom-tour.module';
import { TransportModule } from './transport/transport.module';
import { CountryModule } from './country/country.module';
import { CityModule } from './city/city.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UsersModule,
    DatabaseModule,
    SellerModule,
    HotelModule,
    ThrottlerModule.forRoot(
      [
        {
          name: "short",
          ttl: 1000,
          limit: 400
        },
        {
          name: "long",
          ttl: 60000,
          limit: 100
        }

      ]),
    MyLoggerModule,
    AuthModule,
    ToursModule,
    HistoryModule,
    PaymentModule,
    ReviewModule,
    CloudinaryModule,
    CustomTourModule,
    TransportModule,
    CountryModule,
    CityModule
  ],
  controllers: [AppController],
  providers: [AppService
    , {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_GUARD,
      useClass: AtGuard
    },
    RolesGuard,
    PrismaService
  ],
})
export class AppModule { }
