import {
  IsNotEmpty,
  IsInt,
  IsString,
  IsOptional,
  ValidateNested,
  IsArray,
  IsDate,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateGoodsDTO } from '../../goods/dto/create-goods.dto';

export class CreateReceiptDTO {
  @IsOptional()
  @IsString()
  img?: string;

  @IsInt()
  @IsNotEmpty()
  shopId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;

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

  @IsNumber()
  sum: number;

  @IsDate()
  @Type(() => Date)
  dateOfPurchase: Date;
}
