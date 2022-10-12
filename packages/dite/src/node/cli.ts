import { cac } from 'cac';
import fs from 'fs-extra';
import ora from 'ora';
import { join } from 'path';
import { build } from './compiler';
import { resolveConfig } from './config';

const { readJSONSync } = fs;

export async function run(argv: string[] = process.argv) {
  const pkg = readJSONSync('./../../package.json');
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
      const serverBuilder = await build(config, { mode: 'development' });
      const { createServer: createNodeApp } = await import(
        `${config.serverBuildPath}?t=${Date.now()}`
      );
      spinner.stop();
      const server = await createNodeApp({ config: config });
      console.log('server', server);
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
      const server = await build(config, { mode: 'production' });
      spinner.stop();
      console.log('server', server);
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
    });

  cli.parse(argv);
}
