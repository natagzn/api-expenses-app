import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDTO {
  @ApiProperty({ example: 1, description: 'Унікальний ID користувача' })
  id: number;

  @ApiProperty({
    example: 'example@email.com',
    description: 'Електронна адреса',
  })
  email: string;

  @ApiProperty({ example: 'Іван', description: "Ім'я користувача" })
  firstName: string;

  @ApiProperty({ example: 'Петров', description: 'Прізвище користувача' })
  lastName: string;

  @ApiProperty({
    example: '2024-04-17T12:34:56Z',
    description: 'Дата створення',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-04-17T12:34:56Z',
    description: 'Дата оновлення',
  })
  updatedAt: Date;
}
