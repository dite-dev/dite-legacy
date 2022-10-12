import { cac } from 'cac';
import ora from 'ora';
import { resolve } from 'path';
import { logger } from '../shared/logger';
import { build } from './build';
import { resolveConfig } from './config';
import { serve } from './serve';

const timeout = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function run(argv: string[] = process.argv) {
  const pkg = require('./../../package.json');
  const cli = cac('dite').version(pkg.version).help();
  const spinner = ora('dite');

  spinner.start();
  cli
    .command('[root]', 'start dev server')
    .alias('dev')
    .action(async (root: string) => {
      root = resolve(root ?? process.cwd());
      const config = await resolveConfig({
        root,
        command: 'serve',
        mode: 'development',
      });
      const createServer = async () => {
        const { createDevServer } = await import(`./dev.js?t=${Date.now()}`);
        // const server = await createDevServer(root, async () => {
        //   await server.close();
        //   await createServer();
        // });
        // await server.listen();
        // server.printUrls();
        await timeout(1000);
        logger.info('createServer', createDevServer);
        console.log('config', config);
      };
      await createServer();
    });

  cli
    .command('build [root]', 'build for production')
    .action(async (root: string) => {
      root = resolve(root ?? process.cwd());
      logger.debug('build', root);
      await build(root);
    });

  cli
    .command('start [root]', 'serve for production')
    .option('--port <port>', 'port to use for serve')
    .action(async (root: string, { port }: { port: number }) => {
      root = resolve(root ?? process.cwd());
      logger.debug('start', root);
      await serve(root, port);
    });

  cli.parse(argv, { run: false });
  await cli.runMatchedCommand();
  spinner.stop();
}
