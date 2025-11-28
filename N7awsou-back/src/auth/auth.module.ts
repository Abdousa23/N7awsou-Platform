import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy, RtStrategy } from './stratigies';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';
import { AtGuard } from 'src/common/guards';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports : [DatabaseModule,JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService , AtStrategy , RtStrategy,
    {
      provide: APP_GUARD,
      useClass : AtGuard
    }
  ]
})
export class AuthModule {}
