import { Module } from '@nestjs/common';
import { GoodsService } from './goods.service';
import { GoodsController } from './goods.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [GoodsService],
  controllers: [GoodsController],
  exports: [GoodsService],
})
export class GoodsModule {}
