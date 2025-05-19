import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { GoodsModule } from './goods/goods.module';
import { ReceiptModule } from './receipt/receipt.module';
import { ShopModule } from './shop/shop.module';
import { ConfigModule } from '@nestjs/config';
import { AnalyticsController } from './analytics/analytics.controller';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UserModule,
    PrismaModule,
    AuthModule,
    CategoryModule,
    GoodsModule,
    ReceiptModule,
    ShopModule,
    AnalyticsModule,
  ],
  controllers: [AppController, AnalyticsController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
