import { logger } from '@dite/utils';
import * as compiler from '../compiler';
import { DiteConfig } from '../core/config';
import { ServerMode } from '../core/config/server-mode';
import { createServer } from '../server';

export async function watch(config: DiteConfig) {
  const server = await createServer(config);
  // const spinner = ora('dite');

  const closeWatcher = await compiler.watch(config, {
    mode: ServerMode.Development,
    async onInitialBuild() {
      await server.listen(config.port);
    },
    onRebuildStart: () => {
      logger.start('dite is rebuilding...');
      // spinner.start();
    },
    async onRebuildFinish() {
      // spinner.stop();
      // spinner.succeed('Server rebuild success!');
      await server.restart();
    },
  });
  return () => {
    server.close();
    closeWatcher();
  };
}
