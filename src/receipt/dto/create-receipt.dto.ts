import {IsNotEmpty, IsInt, IsString, IsOptional, ValidateNested, IsArray, IsDate} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateGoodsDTO} from "../../goods/dto/create-goods.dto";

export class CreateReceiptDTO {
    @IsOptional()
    @IsString()
    img?: string;

    @IsInt()
    @IsNotEmpty()
    userId: number;

    @IsInt()
    @IsNotEmpty()
    categoryId: number;

    @IsInt()
    @IsNotEmpty()
    shopId: number;

    @IsString()
    @IsNotEmpty()
    sellerName: string;

    @IsOptional()
    @IsString()
    sellerSecondName?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateGoodsDTO)
    goods: CreateGoodsDTO[];

    @IsDate()
    @Type(() => Date)
    dateOfPurchase: Date;
}
