import {IsEmail, IsNotEmpty, IsString, MinLength} from 'class-validator';


export class UpdateUserDTO {
    @IsNotEmpty()
    @IsString()
    name?: string;

    @IsEmail()
    email?: string;
}
