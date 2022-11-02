import { createServer as createMiddleware } from '@dite/node';
import Router from 'find-my-way';
import ora from 'ora';
import path from 'path';
import { defineConventionalRoutes, DiteConfig, logger } from '../core';
import * as compiler from '../node/compiler';
import { createServer } from '../node/server';

export async function watch(config: DiteConfig) {
  logger.debug('dite watch');
  const server = await createServer(config);
  const routes = defineConventionalRoutes(path.join(config.root, 'app'));
  const router = Router();
  Object.entries(routes).forEach(([id, route]) => {
    router.get(`/${route.path ?? ''}`, () => route);
  });
  const matchedRoutes = (url?: string) => {
    return !!router.find('GET', url ?? '/');
  };
  const middleware = await createMiddleware({ matchedRoutes, router });
  logger.debug('dite watch server');
  const spinner = ora('@dite-run/dite');

  const closeWatcher = await compiler.watch(config, {
    mode: 'development',
    async onInitialBuild() {
      logger.debug('dite watch onInitialBuild');
      await server.listen(config.port);
      await middleware.listen(3000);
      logger.debug('dite watch onInitialBuild server.listen');
    },
    onRebuildStart: () => {
      // logger.start('dite is rebuilding...');
      spinner.start();
    },
    async onRebuildFinish() {
      spinner.stop();
      spinner.succeed('Server rebuild success!');
      await server.restart();
    },
  });
  return () => {
    server.close();
    closeWatcher();
  };
}
