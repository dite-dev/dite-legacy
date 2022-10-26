import { createServer } from 'vite';
import { resolveAppPath } from './utils/resolve-path';

import { fileURLToPath } from 'url';
import type { ViteDevServer } from 'vite';

let viteDevServer: ViteDevServer;

/**
 * get vite server
 * @param opts options
 * @param opts.force create vite server forcibly
 * @returns instance of vite server
 */
export async function getViteServer({ force } = { force: false }) {
  if (!viteDevServer || force) {
    viteDevServer = await createServer({
      publicDir: resolveAppPath('public'),
      appType: 'custom',
      server: {
        middlewareMode: true,
      },
      resolve: {
        alias: {
          // @ts-ignore
          '@': fileURLToPath(new URL('app', import.meta.url)),
        },
      },
      ssr: {
        external: ['reflect-metadata'],
      },
    });
  }

  return viteDevServer;
}
