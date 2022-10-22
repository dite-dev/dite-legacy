import { cac } from 'cac';
import exitHook from 'exit-hook';
import { VERSION } from '../node/constants';
import * as commands from './commands';

export async function run(argv: string[] = process.argv) {
  const cli = cac('dite').version(VERSION).help();

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

  cli.parse(argv);
}
