import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import {ValidationPipe} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

const prisma = new PrismaClient().$extends(withAccelerate())

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true}));

  await app.listen(process.env.PORT ?? 3000);
  app.enableCors();

  //  const users = await prisma.user.findMany()
  //  console.log(users)
}
bootstrap()/*.then(async () => {
  await prisma.$disconnect()
})
    .catch(async (e) => {
      console.error(e)
      await prisma.$disconnect()
      process.exit(1)
    })*/;
