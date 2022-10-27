import { resolveConfig, ServerMode } from '@dite/core';
import { cac } from 'cac';
import dotenv from 'dotenv';
import { join } from 'path';
// @ts-expect-error
import { version } from '../../package.json';
import * as commands from './cli/commands';
import { defineConventionalRoutes } from './cli/routes';

export class Service {
  public readonly root: string = process.env.DITE_PKG_ROOT!;
  protected argv: string[];
  constructor({ argv }: { argv: string[] } = { argv: process.argv }) {
    dotenv.config();
    this.argv = argv;
  }

  public static create(): Service {
    return new Service();
  }

  async run() {
    const cli = cac('dite').version(version).help();

    cli
      .command('dev [root]', 'start dev server')
      .alias('dev')
      .action(async (root: string) => {
        const createServer = async () => {
          const { createDevServer }: typeof import('./cli/dev') = await import(
            `./dev.cjs?t=${Date.now()}`
          );
          const config = await resolveConfig({
            root,
            mode: ServerMode.Development,
          });
          await createDevServer(config);
        };
        await createServer();
      });

    cli
      .command('build [root]', 'build for production')
      .action(async (root: string) => {
        await commands.build(root);
      });

    cli
      .command('start [root]', 'serve for production')
      .option('--port <port>', 'port to use for serve')
      .action(async (root: string, { port }: { port: number }) => {
        await commands.start(root, { port });
      });

    cli
      .command('routes [root]', 'routes for dite')
      .action(async (root: string) => {
        const config = await resolveConfig({
          root,
          mode: ServerMode.Production,
        });
        const routes = defineConventionalRoutes(join(config.root, 'app'));
        console.log(routes);
      });

    cli.parse(this.argv);
  }
}
