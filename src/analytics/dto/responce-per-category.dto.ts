import { ApiProperty } from '@nestjs/swagger';

export class CategoryAmountDTO {
    @ApiProperty({ example: 'Other' })
    category: string;

    @ApiProperty({ example: 2 })
    totalAmount: number;
}


