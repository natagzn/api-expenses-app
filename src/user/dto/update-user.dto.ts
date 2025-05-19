import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDTO {
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsEmail()
  email?: string;
}
