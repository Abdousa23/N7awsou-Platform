import { IsString , IsEmail , IsEnum , IsNotEmpty } from "class-validator"


export class createUserDto {
    @IsString()
    @IsNotEmpty()
    username : string;

    @IsEmail()
    email :string;

}