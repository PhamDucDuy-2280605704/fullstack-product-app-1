import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Cho phép gọi từ domain khác
  await app.listen(3000);
}
bootstrap();