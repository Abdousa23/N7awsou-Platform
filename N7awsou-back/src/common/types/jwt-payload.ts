export interface JwtPayload {
    sub: number;    // User ID
    email: string;
    role: string;
    iat?: number;   // Issued at
    exp?: number;   // Expires at
}