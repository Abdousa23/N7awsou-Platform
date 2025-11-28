import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { createAUth } from './DTO/create-auth';
import { Tokens } from './DTO/types';
import { SigninDto } from './DTO/signin.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { RtGuard, AtGuard } from 'src/common/guards';
import { GetCurrentUser, Public } from 'src/common/decorators';

interface RequestWithUser extends Request {
    user: {
        id: number,
        sub?: string,
        refreshToken: string
    };
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    signUpLocal(@Body(ValidationPipe) user: createAUth): Promise<Tokens> {
        return this.authService.signUpLocal(user)
    }

    @Public()
    @Post('signin')
    @HttpCode(HttpStatus.OK)
    signInLocal(
        @Body(ValidationPipe) user: SigninDto,
        @Res({ passthrough: true }) res: Response
    ) {
        return this.authService.signInLocal(user, res)
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(
        @GetCurrentUser('sub') userId: number,
        @Res({passthrough:true}) res :Response
            
    
) {
        console.log('Attempting logout for user ID:', userId);
        return this.authService.logout(userId , res);
    }

    @Public()
    @UseGuards(RtGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refreshTokens(
        @GetCurrentUser('refreshToken') refreshToken: string,
        @GetCurrentUser('sub') userId: number,
        @Res({ passthrough: true }) res: Response
    ) {
        // No need to extract tokens from request body - they come from cookies now
        return this.authService.refreshTokens(userId, refreshToken, res);
    }
}
