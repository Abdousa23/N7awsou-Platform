export class Tokens{
    accessToken : string
    refreshToken : string
    user? : {
        id: number
        email: string
        role: string
        username?: string
    }
}