import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import connect from 'connect';
import type { RequestHandler } from 'express';
import fs from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { createServer as createDiteServer } from 'vite';

interface Interface {
  new (...input: any): any;
}

export interface NodeHookOptions {
  addMiddleware: (...input: (Interface | RequestHandler)[]) => void;
  addRequestHandler: any;
  config: any;
  vite: any;
}

export type NodeAttacher = (options: NodeHookOptions) => Promise<void> | void;

export function hook(opts: NodeAttacher): NodeAttacher {
  return opts;
}

interface Server {
  app: connect.Server;
  listen: (port: number) => Promise<void>;
}

export async function createServer() {
  let started = false;
  const vite = await createDiteServer({
    appType: 'custom',
    publicDir: path.resolve(process.cwd(), 'app', 'public'),
    plugins: [vue(), vueJsx()],
    configFile: false,
    server: {
      middlewareMode: true,
    },
    resolve: {
      alias: {
        '@': path.join(process.cwd(), 'app'),
      },
    },
    ssr: {
      external: ['reflect-metadata'],
    },
  });

  const app = connect();

  const matchedRoutes = ['/', '/about', '/category'];
  const listen = async (port: number) => {
    return new Promise<void>((resolve) => {
      app.listen(port, () => {
        started = true;
        resolve();
      });
    });
  };

  const serverProxy = createProxyMiddleware({
    target: 'http://0.0.0.0:3001',
    changeOrigin: true,
  });
  app.use(vite.middlewares);

  app.use(async (req, res, next) => {
    console.log('req.url', req.url);
    if (req.url && matchedRoutes.includes(req.url)) {
      const url = req.url;
      const template = fs.readFileSync(
        path.resolve(process.cwd(), 'app/index.html'),
        'utf-8',
      );
      const renderHtml: string = await vite.transformIndexHtml(url, template);
      const { render: viteRender } = await vite.ssrLoadModule(
        '/app/entry-server.ts',
      );
      const appHtml = await viteRender(url);
      const html = renderHtml.replace('<!--ssr-outlet-->', appHtml);
      res.setHeader('content-type', 'text/html').end(html);
      return html;
    }
    next();
  });
  app.use(serverProxy as any);

  const server: Server = {
    app,
    listen,
  };

  return server;
}
