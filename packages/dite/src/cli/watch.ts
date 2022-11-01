import { createServer as createMiddleware } from '@dite/node';
import ora from 'ora';
import { DiteConfig, logger } from '../core';
import * as compiler from '../node/compiler';
import { createServer } from '../node/server';

export async function watch(config: DiteConfig) {
  logger.debug('dite watch');
  const server = await createServer(config);
  const middleware = await createMiddleware();
  logger.debug('dite watch server');
  const spinner = ora('dite');

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
