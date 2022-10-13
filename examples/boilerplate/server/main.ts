import { NestFactory } from '@nestjs/core';
import { DiteConfig } from 'dite';
import { AppModule } from './app.module';

async function createServer(opts: { config: DiteConfig }) {
  const { config } = opts;
  const app = await NestFactory.create(AppModule);
  await app.listen(config.port);
  return app;
}

export { createServer };
