import { NestFactory } from '@nestjs/core';
import { IConfig } from 'dite';
import { AppModule } from './app.module';

async function createServer(opts: { config: IConfig }) {
  const { config } = opts;
  const app = await NestFactory.create(AppModule);
  console.log('11');
  await app.listen(config.port);
}

export { createServer };
