import {IsInt, IsNotEmpty, IsNumber, IsString} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";


export class GoodsResponceDTO {
    @ApiProperty({ example: 1, description: 'ID товару' })
    id: number;

    @ApiProperty({ example: 'Apple', description: 'Name goods' })
    @IsString()
    name: string;

    @ApiProperty({ example: 1.99, description: 'Price' })
    @IsNumber()
    price: number;


    @ApiProperty({ example: 1, description: 'Category ID' })
    @IsInt()
    @IsNotEmpty()
    categoryId: number | null;
}
