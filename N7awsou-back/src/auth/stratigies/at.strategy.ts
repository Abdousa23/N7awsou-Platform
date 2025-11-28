import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from "@nestjs/core";

type JwtPayload = {
    sub: string
    email: string
    role: string
}

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'ACCESS_TOKEN_SECRET',
            ignoreExpiration: false, // Ensure tokens aren't expired
        });
    }

    async validate(payload: JwtPayload) {
        try {
            // If payload doesn't have expected properties, reject it
            if (!payload || !payload.sub) {
                console.log('Invalid token payload:', payload);
                throw new UnauthorizedException('Invalid token structure');
            }

            console.log('Successfully validated token for user ID:', payload.sub);
            return payload;
        } catch (error) {
            console.log('Token validation error:', error);
            throw new UnauthorizedException('Authentication failed');
        }
    }
}