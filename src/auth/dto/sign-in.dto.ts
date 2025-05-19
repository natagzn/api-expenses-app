import { ApiProperty } from '@nestjs/swagger';

export class SignInDTO {
  @ApiProperty({
    description: "User's email",
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  password: string;
}
