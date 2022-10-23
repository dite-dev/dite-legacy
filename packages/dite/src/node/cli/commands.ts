import exitHook from 'exit-hook';
import ora from 'ora';
import { readConfig } from '../../core/config';
import { ServerMode } from '../../core/config/server-mode';
import * as compiler from '../compiler';
import { createServer } from '../server';

export async function watch(diteRoot: string) {
  const config = await readConfig(diteRoot);

  const server = await createServer(config);

  const spinner = ora('dite');

  const closeWatcher = await compiler.watch(config, {
    mode: 'development',
    async onInitialBuild() {
      await server.listen(config.port);
    },
    onRebuildStart: () => {
      spinner.start();
    },
    async onRebuildFinish() {
      spinner.stop();
      await server.restart();
    },
  });
  return () => {
    server.close();
    closeWatcher();
  };
}

export async function build(diteRoot: string) {
  const config = await readConfig(diteRoot);
  await compiler.build(config, { mode: ServerMode.Production });
}

export async function start(diteRoot: string, opts: { port?: number }) {
  const server = await createServer(diteRoot);
  await server.listen(opts.port);
  exitHook(() => {
    server.close();
  });
}

export async function help() {
  console.log('help');
}
