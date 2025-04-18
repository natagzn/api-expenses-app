import {ApiProperty} from "@nestjs/swagger";
import {ReceiptResponseDTO} from "./responce-receipt.dto";
import {GoodsResponceDTO} from "../../goods/dto/responce-goods.dto";
import {IsInt, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

export class ReceiptDTO {
    @ApiProperty({ example: 1, description: 'Receipt ID' })
    id: number;

    @ApiProperty({ example: 2, description: 'Shop ID' })
    shopId: number;

    @ApiProperty({ example: 3, description: 'User ID' })
    userId: number;

    @ApiProperty({ example: 'Anna', description: 'Seller name' })
    sellerName: string;

    @ApiProperty({ example: 'Petrova', description: 'Seller second name' })
    sellerSecondName?: string;

    @IsNumber()
    sum: number;

    @ApiProperty({ example: '2024-04-17T10:45:00.000Z', description: 'Date and time of purchase in ISO 8601' })
    dateOfPurchase: string;

}
export class ReceiptWithGoodsResponse {
    @ApiProperty({ type: () => ReceiptDTO, description: 'Receipt data' })
    receipt: ReceiptDTO;

    @ApiProperty({
        type: () => [GoodsResponceDTO],
        description: 'List of goods belonging to the selected category in this receipt',
    })
    goods: GoodsResponceDTO[];
}