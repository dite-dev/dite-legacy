import { cac } from 'cac';
import exitHook from 'exit-hook';
import type { Server } from 'http';
import debounce from 'lodash.debounce';
import ora from 'ora';
import { join } from 'path';
import { printMemoryUsage } from '../shared/lib/print-memory-usage';
import * as compiler from './compiler';
import type { DiteConfig } from './config';
import { resolveConfig } from './config';

export async function run(argv: string[] = process.argv) {
  const pkg = require('./../../package.json');
  const cli = cac('dite').version(pkg.version).help();
  const spinner = ora('dite');

  spinner.start();
  cli
    .command('dev [root]', 'start dev server')
    .alias('dev')
    .action(async (root: string) => {
      root = join(root ?? process.cwd());
      const config = await resolveConfig({
        root,
        command: 'serve',
        mode: 'development',
      });
      if (!config) return;

      let server: Server | null = null;

      const createServer = debounce(async () => {
        const { createServer: createNodeApp } = await import(
          `${config.serverBuildPath}?t=${Date.now()}`
        );
        const app = await (
          createNodeApp as (options: { config: DiteConfig }) => Promise<any>
        )({ config }).catch((e) => console.error(e));
        printMemoryUsage();
        return app;
      }, 500);
      const closeWatcher = await compiler.watch(config, {
        mode: 'development',
        async onInitialBuild() {
          spinner.stop();
          server = await createServer();
        },
        onRebuildStart: () => {
          spinner.start();
        },
        async onRebuildFinish() {
          spinner.stop();
          server?.close();
          server = await createServer();
        },
      });
      let resolve: () => void;
      exitHook(() => {
        resolve();
      });
      return new Promise<void>((r) => {
        resolve = r;
      }).then(async () => {
        await closeWatcher();
      });
    });

  cli
    .command('build [root]', 'build for production')
    .action(async (root: string) => {
      root = join(root ?? process.cwd());
      const config = await resolveConfig({
        root,
        command: 'serve',
        mode: 'production',
      });
      if (!config) return;
      await compiler.build(config, { mode: 'production' });
      spinner.stop();
    });

  cli
    .command('start [root]', 'serve for production')
    .option('--port <port>', 'port to use for serve')
    .action(async (root: string, { port }: { port: number }) => {
      root = join(root ?? process.cwd());
      const config = await resolveConfig({
        root,
        command: 'serve',
        mode: 'production',
      });
      if (!config) return;
      if (port) config.port = port;
      const { createServer: createNodeApp } = await import(
        `${config.serverBuildPath}?t=${Date.now()}`
      );
      spinner.stop();
      const server = await createNodeApp({ config: config });
      console.log('server', server);
      exitHook(() => {
        server?.close();
      });
    });

  cli.parse(argv);
}
