import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable } from '@nestjs/common';
import { Request } from "express"
import { env } from "process";

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy , 'jwt-refresh'){

    constructor(){
        super({
            jwtFromRequest: (req) => {
                // Extract token from the 'refresh-token' cookie
                if (req && req.cookies) {
                    return req.cookies['refresh-token'];
                }
                return null;
            },
            secretOrKey: 'REFRESH_TOKEN_SECRET',
            passReqToCallback: true
        })
    }
    
    validate(request: Request, payload: any) {
        const refreshToken = request.cookies['refresh-token'];
        return {
            ...payload,
            refreshToken
        }
    }
}