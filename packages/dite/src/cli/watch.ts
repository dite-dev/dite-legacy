import { DiteConfig, ServerMode } from '@dite/core/config';
import { logger } from '@dite/utils';
import * as compiler from '../node/compiler';
import { createServer } from '../node/server';

export async function watch(config: DiteConfig) {
  logger.debug('dite watch');
  const server = await createServer(config);
  logger.debug('dite watch server');

  const closeWatcher = await compiler.watch(config, {
    mode: ServerMode.Development,
    async onInitialBuild() {
      logger.debug('dite watch onInitialBuild');
      // await server.listen(config.port);
      logger.debug('dite watch onInitialBuild server.listen');
    },
    onRebuildStart: () => {
      logger.start('dite is rebuilding...');
      // spinner.start();
    },
    async onRebuildFinish() {
      // spinner.stop();
      // spinner.succeed('Server rebuild success!');
      // await server.restart();
    },
  });
  return () => {
    server.close();
    closeWatcher();
  };
}
