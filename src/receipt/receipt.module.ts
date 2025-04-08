import { Module } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { ReceiptController } from './receipt.controller';
import {PrismaModule} from "../prisma/prisma.module";
import {CategoryService} from "../category/category.service";
import {ShopService} from "../shop/shop.service";

@Module({
  imports: [PrismaModule],
  providers: [ReceiptService, CategoryService, ShopService],
  controllers: [ReceiptController],
  exports: [ReceiptService, CategoryService, ShopService],
})
export class ReceiptModule {}
