import { ApiProperty } from '@nestjs/swagger';
import { ReceiptResponseDTO } from '../../receipt/dto/responce-receipt.dto';

export class AnalyticsResponseDTO {
  @ApiProperty({ example: 85.87 })
  totalAmount: number;

  @ApiProperty({ type: [ReceiptResponseDTO] })
  receipts: {
    receipt: ReceiptResponseDTO;
  }[];
}
