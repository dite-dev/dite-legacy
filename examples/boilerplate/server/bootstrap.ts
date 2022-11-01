import { hook, NodeHookOptions } from '@dite/node';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import connect from 'connect';
import fs from 'fs';
import path from 'path';
import type { ViteDevServer } from 'vite';
import { createServer as createViteServer } from 'vite';
import { AppModule } from './app.module';

const useVite = true;
let vite: ViteDevServer;
let template: string;

export async function render(url: string) {
  const renderHtml = await vite.transformIndexHtml(url, template);
  const { render: viteRender } = await vite.ssrLoadModule(
    '/app/entry-server.ts',
  );
  const appHtml = await viteRender(url);
  const html = renderHtml.replace('<!--ssr-outlet-->', appHtml);
  return html;
}

const adapter = hook(async ({ addMiddleware }) => {
  console.debug('dite adapter start');
  if (useVite) {
    addMiddleware((req, res, next) => {
      vite.middlewares(req, res, next);
    });
    console.debug('dite adapter vite.middlewares');
  }
});
export default adapter;

export async function bootstrap(opts) {
  const { config } = opts;
  console.debug('createServer');
  const nestAdapter = new FastifyAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    nestAdapter,
  );
  vite = await createViteServer({
    appType: 'custom',
    publicDir: path.resolve(config.root, 'app', 'public'),
    plugins: [vue(), vueJsx()],
    configFile: false,
    server: {
      middlewareMode: true,
    },
    resolve: {
      alias: {
        '@': path.join(config.root, 'app'),
      },
    },
    ssr: {
      external: ['reflect-metadata'],
    },
  });
  const storage: {
    middlewares: any[];
    requestHandlers: Map<string, any>;
  } = {
    middlewares: [],
    requestHandlers: new Map(),
  };
  const diteServer: NodeHookOptions = {
    addMiddleware(middleware) {
      storage.middlewares.push(middleware);
    },
    addRequestHandler(route: string, requestHandler: any) {
      storage.requestHandlers.set(route, requestHandler);
    },
    config,
    vite,
  };

  template = fs.readFileSync(
    path.resolve(config.root, 'app/index.html'),
    'utf-8',
  );
  await adapter(diteServer);

  storage.middlewares.forEach((middleware) => {
    app.use(middleware);
  });
  const connectApp = connect();
  connectApp.use('/', async (req, res) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    res.end('not found');
  });
  connectApp.listen(3000, '0.0.0.0');
  // await app.listen(3000, '0.0.0.0');
  console.debug('finish listen');
  return app;
}
