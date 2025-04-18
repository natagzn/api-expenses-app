import { ApiProperty } from '@nestjs/swagger';

export class ShopResponseDTO {
    @ApiProperty({ example: 1, description: 'Shop ID' })
    id: number;

    @ApiProperty({ example: 'Action', description: 'Name' })
    name: string;

    @ApiProperty({
        example: 'Ebkeriege 5, 26389 Wilhelmshaven',
        description: 'Shop address',
    })
    location: string;
}
