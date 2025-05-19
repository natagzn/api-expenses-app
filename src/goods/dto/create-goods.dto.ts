import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateGoodsDTO {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsInt()
  @IsNotEmpty()
  count: number;

  @IsInt()
  @IsNotEmpty()
  categoryId: number | null;
}
