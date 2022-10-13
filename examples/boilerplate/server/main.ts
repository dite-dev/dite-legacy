import { NestFactory } from '@nestjs/core';
import { IConfig } from 'dite';
import { AppModule } from './app.module';

async function createServer(opts: { config: IConfig }) {
  const { config } = opts;
  const app = await NestFactory.create(AppModule);
  await app.listen(config.port);
  return app;
}

export { createServer };
