import { hook } from '@dite/node';
import { NestFactory } from '@nestjs/core';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import type { DiteConfig } from 'dite';
import fs from 'fs';
import path from 'path';
import type { ViteDevServer } from 'vite';
import { createServer as createViteServer } from 'vite';
import { AppModule } from './app.module';

const adapter = hook(async ({ addMiddleware, addRequestHandler, config }) => {
  const vite: ViteDevServer = await createViteServer({
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
  console.log('vite', config.root);
  addMiddleware(vite.middlewares);
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
});
export default adapter;

export async function createServer(opts: { config: DiteConfig }) {
  const { config } = opts;
  const app = await NestFactory.create(AppModule);

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
  };
  await adapter(diteServer);
  storage.middlewares.forEach((middleware) => {
    app.use(middleware);
  });
  for (const [path, requestHandler] of storage.requestHandlers.entries()) {
    app.use(path, requestHandler);
  }
  await app.listen(config.port);
  return app;
}
