import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {PrismaModule} from "../prisma/prisma.module";
import {AnalyticsController} from "./analytics.controller";
import {ReceiptService} from "../receipt/receipt.service";
import {ReceiptModule} from "../receipt/receipt.module";

@Module({
  imports: [PrismaModule, ReceiptModule],
  providers: [AnalyticsService, ReceiptService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService, ReceiptService],
})
export class AnalyticsModule {}
