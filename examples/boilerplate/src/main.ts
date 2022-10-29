import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);

  return app;
}

// if (!process.env.HMR) bootstrap();
