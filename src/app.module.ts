import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [ UserModule, PrismaModule, AuthModule, CategoryModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
