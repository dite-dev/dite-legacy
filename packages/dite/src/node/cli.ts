import { cac } from 'cac';
import fs from 'fs-extra';
import ora from 'ora';
import { join, resolve } from 'path';
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
      root = resolve(root ?? process.cwd());
      const config = await resolveConfig({
        root,
        command: 'serve',
        mode: 'development',
      });
      if (!config) return;
      const serverBuilder = await build(config, { mode: 'development' });
      const { createServer: createNodeApp } = await import(
        `${serverBuilder.outputFiles[0].path}?t=${Date.now()}`
      );
      spinner.stop();
      const server = await createNodeApp({ config: config });
      // const createServer = async () => {
      //   const { createDevServer } = await import(`./dev.js?t=${Date.now()}`);
      //   // const server = await createDevServer(root, async () => {
      //   //   await server.close();
      //   //   await createServer();
      //   // });
      //   // await server.listen();
      //   // server.printUrls();
      //   await timeout(1000);
      //   logger.info('createServer', createDevServer);
      //   console.log('config', config);
      // };
      // await createServer();
    });

  cli
    .command('build [root]', 'build for production')
    .action(async (root: string) => {
      root = resolve(root ?? process.cwd());
      const config = await resolveConfig({
        root,
        command: 'serve',
        mode: 'production',
      });
      if (!config) return;
      await build(config, { mode: 'production' });
      spinner.stop();
      // const { createServer: createNodeApp } = await import(`${serverBuilder.outputFiles[0].path}?t=${Date.now()}`);
      // const server = await createNodeApp({ config: config.config })
      // console.log('server', server)
    });

  cli
    .command('start [root]', 'serve for production')
    .option('--port <port>', 'port to use for serve')
    .action(async (root: string, { port }: { port: number }) => {
      root = resolve(root ?? process.cwd());
      root = resolve(root ?? process.cwd());
      const config = await resolveConfig({
        root,
        command: 'serve',
        mode: 'production',
      });
      if (!config) return;
      const { createServer: createNodeApp } = await import(
        join(root, 'dist/server/index.js')
      );
      if (port) config.port = port;
      spinner.stop();
      const server = await createNodeApp({ config: config });
      console.log('server', server);
    });

  cli.parse(argv);
  await cli.runMatchedCommand();
}
