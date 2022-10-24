import { cac } from 'cac';
import dotenv from 'dotenv';
import exitHook from 'exit-hook';
// @ts-expect-error
import { version } from '../../package.json';
import * as commands from './cli/commands';

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
        const closeWatcher = await commands.watch(root);
        let resolve: () => void;
        exitHook(() => {
          closeWatcher();
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
        await commands.build(root);
      });

    cli
      .command('start [root]', 'serve for production')
      .option('--port <port>', 'port to use for serve')
      .action(async (root: string, { port }: { port: number }) => {
        await commands.start(root, { port });
      });

    cli.parse(this.argv);
  }
}

export default Service;
