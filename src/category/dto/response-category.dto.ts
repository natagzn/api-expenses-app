import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDTO {
  @ApiProperty({ example: 1, description: 'Unique category ID' })
  id: number;

  @ApiProperty({ example: 'Products', description: 'Category name' })
  name: string;
}
