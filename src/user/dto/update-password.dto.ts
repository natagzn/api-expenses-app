import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDTO {
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  confirmNewPassword: string;
}
