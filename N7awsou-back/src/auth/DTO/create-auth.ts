import { IsEmail , IsString , IsNotEmpty } from "class-validator"

export class createAUth{
    @IsString()
    @IsNotEmpty()
    username : string

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password : string;
}