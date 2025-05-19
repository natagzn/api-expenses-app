import { ApiProperty } from '@nestjs/swagger';
import { GoodsResponceDTO } from '../../goods/dto/responce-goods.dto';

export class ReceiptResponseDTO {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2024-04-15T12:00:00.000Z' })
  date: string;

  @ApiProperty({ example: 1 })
  shopId: number;

  @ApiProperty({ type: () => [GoodsResponceDTO] })
  goods: GoodsResponceDTO[];
}
