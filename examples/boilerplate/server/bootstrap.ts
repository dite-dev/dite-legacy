import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

export async function bootstrap(opts) {
  const { config } = opts;
  console.debug('createServer');
  const nestAdapter = new FastifyAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    nestAdapter,
  );
  await app.listen(3001, '0.0.0.0');
  console.debug('finish listen');
  return app;
}
