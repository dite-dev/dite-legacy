import { NestFactory } from '@nestjs/core';
import type { DiteConfig } from 'dite';
import { AppModule } from './app.module';

export async function createServer(opts: { config: DiteConfig }) {
  const { config } = opts;
  const app = await NestFactory.create(AppModule);
  await app.listen(config.port);
  return app;
}
