import { createParamDecorator, ExecutionContext, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtPayload } from "../types/jwt-payload";

export const GetCurrentUser = createParamDecorator(
    (data: string | undefined, context: ExecutionContext): any => {
        const request = context.switchToHttp().getRequest();

        // First check if user is already attached by guards
        if (request.user) {
            if (!data) return request.user;
            return request.user[data];
        }

        // Try to extract token from Authorization header
        let token: string | undefined;
        const authHeader = request.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        // If no token in header, try to get from cookies (for refresh token scenarios)
        if (!token && request.cookies && request.cookies['access-token']) {
            token = request.cookies['access-token'];
        }

        if (!token) {
            throw new UnauthorizedException('No authentication token found');
        }

        try {
            // Decode JWT token manually (without signature verification)
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                throw new Error('Invalid token format');
            }

            const payload: JwtPayload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

            // Validate required fields
            if (!payload.sub || !payload.email) {
                throw new Error('Invalid token payload - missing required fields');
            }

            // Check if token is expired
            if (payload.exp && Date.now() >= payload.exp * 1000) {
                throw new UnauthorizedException('Token has expired');
            }

            // Create user object from token payload
            const user: JwtPayload = {
                sub: Number(payload.sub), // Ensure sub is a number
                email: payload.email,
                role: payload.role || 'TOURIST', // Default role if not present
                iat: payload.iat,
                exp: payload.exp
            };

            // Attach user to request for future use
            request.user = user;

            // Return the requested data or the entire user object
            if (!data) return user;

            // Handle nested property access (e.g., 'user.id')
            const keys = data.split('.');
            let result = user;
            for (const key of keys) {
                if (result && typeof result === 'object' && key in result) {
                    result = (result as any)[key];
                } else {
                    return undefined;
                }
            }

            return result;

        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            console.log('Error decoding token:', error.message || error);
            throw new UnauthorizedException('Invalid or malformed authentication token');
        }
    }
);