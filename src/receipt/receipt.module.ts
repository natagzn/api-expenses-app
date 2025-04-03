import { Module } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { ReceiptController } from './receipt.controller';
import {PrismaModule} from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [ReceiptService],
  controllers: [ReceiptController],
  exports: [ReceiptService],
})
export class ReceiptModule {}
