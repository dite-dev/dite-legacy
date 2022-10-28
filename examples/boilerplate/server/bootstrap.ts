import { hook } from '@dite/node';
import { logger } from '@dite/utils';
import { NestFactory } from '@nestjs/core';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import type { DiteConfig } from 'dite';
import fs from 'node:fs';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { AppModule } from './app.module';

const adapter = hook(
  async ({ addMiddleware, addRequestHandler, config, vite }) => {
    logger.debug('dite adapter start');
    addMiddleware(vite.middlewares);
    logger.debug('dite adapter vite.middlewares');
    const htmlTemplate = fs.readFileSync(
      path.resolve(config.root, 'app/index.html'),
      'utf-8',
    );
    addRequestHandler('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        next();
        return;
      }

      try {
        const template = await vite.transformIndexHtml(url, htmlTemplate);
        const { render } = await vite.ssrLoadModule('/app/entry-server.ts');
        const appHtml = await render(url);
        const html = template.replace('<!--ssr-outlet-->', appHtml);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        // vite.ssrFixStacktrace(e);
        console.error(e);
        next();
      }
    });
  },
);
export default adapter;

export async function createServer(opts: { config: DiteConfig }) {
  const { config } = opts;
  logger.debug('createServer');
  const [app, vite] = await Promise.all([
    NestFactory.create(AppModule),
    createViteServer({
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
    }),
  ]);
  logger.debug('create nest app');
  const storage: {
    middlewares: ((args: any) => void)[];
    requestHandlers: Map<string, any>;
  } = {
    middlewares: [],
    requestHandlers: new Map(),
  };
  const diteServer = {
    addMiddleware(middleware: (args: any) => void) {
      storage.middlewares.push(middleware);
    },
    addRequestHandler(path: string, requestHandler: any) {
      storage.requestHandlers.set(path, requestHandler);
    },
    config,
    vite,
  };
  await adapter(diteServer);
  logger.debug('finish dite adapter');
  storage.middlewares.forEach((middleware) => {
    app.use(middleware);
  });
  for (const [path, requestHandler] of storage.requestHandlers.entries()) {
    app.use(path, requestHandler);
  }
  logger.debug('finish middlewares');
  await app.listen(config.port);
  logger.debug('finish listen');
  return app;
}
