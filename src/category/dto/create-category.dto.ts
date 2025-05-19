import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDTO {
  @ApiProperty({
    description: 'Category name',
    example: 'food',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
