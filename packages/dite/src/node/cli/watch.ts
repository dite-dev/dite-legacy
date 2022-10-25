import ora from 'ora';
import * as compiler from '../compiler';
import { readConfig } from '../core/config';
import { ServerMode } from '../core/config/server-mode';
import { createServer } from '../server';
import { logger } from '../shared/logger';

export async function watch(diteRoot: string) {
  const config = await readConfig(diteRoot);
  const server = await createServer(config);
  const spinner = ora('dite');

  const closeWatcher = await compiler.watch(config, {
    mode: ServerMode.Development,
    async onInitialBuild() {
      await server.listen(config.port);
    },
    onRebuildStart: () => {
      logger.start('dite is rebuilding...');
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
