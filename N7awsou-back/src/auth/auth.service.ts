import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { createAUth } from './DTO/create-auth';
import { DatabaseService } from 'src/database/database.service';
import { emitWarning, ref } from 'process';
import * as bcrypt from "bcrypt"
import { Tokens } from './DTO/types';
import { JwtService } from '@nestjs/jwt';
import { SigninDto } from './DTO/signin.dto';
import { get } from 'http';
import { Response } from 'express';
import { strict } from 'assert';

@Injectable()
export class AuthService {

    constructor(private readonly databaseService: DatabaseService,
        private jwtService: JwtService
    ) { }


    async signUpLocal(user: createAUth): Promise<Tokens> {
        const hashedPassword = await this.hashFunc(user.password)
        const newUser = await this.databaseService.user.create({
            data: {
                username: user.username,
                email: user.email,
                hash: hashedPassword,
                role: 'TOURIST'
            }

        })
        const tokens = await this.getTokens(newUser.id, newUser.email, newUser.role)
        await this.updateRtHash(newUser.id, tokens.refreshToken)
        return { ...tokens, user: newUser }
    }


    async signInLocal(user: SigninDto, res?: Response) {

        const userFound = await this.databaseService.user.findUnique({
            where: {
                email: user.email
            },
        })
        //verifying user existance
        if (!userFound) {
            throw new NotFoundException("User not found , please verify your log-in email")
        }

        //checking password:
        const passwordMatches = await bcrypt.compare(user.password, userFound.hash)
        if (!passwordMatches) throw new ForbiddenException("Wrong password , ACCESS DENIED")

        const tokens = await this.getTokens(userFound.id, userFound.email, userFound.role)
        await this.updateRtHash(userFound.id, tokens.refreshToken)

        // Only set cookie if response object is provided
        if (res) {
            res.cookie('refresh-token', tokens.refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 1000 * 60 * 60 * 24 * 30,
                sameSite: 'strict'
            });
        }

        return tokens
    }


    async logout(id: number, res?: Response) {
        console.log('Logging out user with ID:', id);
        try {
            const updateResult = await this.databaseService.user.updateMany({
                where: {
                    id: id,
                    hashedRt: {
                        not: null
                    }
                },
                data: {
                    hashedRt: null
                }
            });

            console.log('Logout update result:', updateResult);

            if (updateResult.count === 0) {
                console.log('No matching user found for logout or user already logged out');
            }
            if (res) {
                res.clearCookie('refresh-token')
            }

            return { message: 'Logout successful!' };
        } catch (error) {
            console.log('Error during logout:', error);
            throw error;
        }
    }


    async refreshTokens(id: number, rt: string, res?: Response) {
        const foundUser = await this.databaseService.user.findUnique({
            where: {
                id,
            }
        })

        if (!foundUser) throw new NotFoundException("user id is wrong!")
        if (!foundUser.hashedRt) throw new ForbiddenException("Access Denied")

        const matchingRt = await bcrypt.compare(rt, foundUser.hashedRt)

        if (!matchingRt) throw new ForbiddenException("Access Denied")

        const tokens = await this.getTokens(foundUser.id, foundUser.email, foundUser.role)
        await this.updateRtHash(foundUser.id, tokens.refreshToken)

        // Only set cookie if response object is provided
        if (res) {
            res.cookie('refresh-token', tokens.refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 1000 * 60 * 60 * 24 * 30,
                sameSite: 'strict'
            });
        }

        return tokens
    }


    ///utility functions :


    hashFunc(data: string) {
        return bcrypt.hash(data, 10)
    }

    async getTokens(id: number, email: string, role?: string) {
        // If role is not provided, fetch it from database
        if (!role) {
            const user = await this.databaseService.user.findUnique({
                where: { id },
                select: { role: true }
            });
            role = user?.role;
        }

        console.log('Generating tokens for user ID:', id, 'with role:', role);

        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: id,
                    email,
                    role
                },
                {
                    secret: "ACCESS_TOKEN_SECRET",
                    expiresIn: 60 * 15
                }
            ),
            this.jwtService.signAsync(
                {
                    sub: id,
                    email,
                    role
                },
                {
                    secret: "REFRESH_TOKEN_SECRET",
                    expiresIn: 60 * 60 * 24 * 30
                }
            )
        ])
        return {
            accessToken: at,
            refreshToken: rt,

        }
    }

    async updateRtHash(id: number, rt: string) {
        const hashedRt = await this.hashFunc(rt)
        await this.databaseService.user.update({
            where: {
                id: id
            },
            data: {
                hashedRt: hashedRt
            }
        })
    }

}
