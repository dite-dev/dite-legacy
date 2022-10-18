import { resolveConfig } from '@dite/core';
import { cac } from 'cac';
import spawn from 'cross-spawn';
import dotenv from 'dotenv';
import exitHook from 'exit-hook';
import ora from 'ora';
import { join } from 'path';
import { treeKillSync as killProcessSync } from '../shared/lib/tree-kill';
import * as compiler from './compiler';

export async function run(argv: string[] = process.argv) {
  dotenv.config();

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

      let childProcessRef: any;

      const createServer = () => {
        const app = spawn.spawn('node', [config.serverBuildPath], {
          env: process.env,
          stdio: 'inherit',
          shell: true,
        });
        return app;
      };
      const closeWatcher = await compiler.watch(config, {
        mode: 'development',
        async onInitialBuild() {
          spinner.stop();
          childProcessRef = createServer();
        },
        onRebuildStart: () => {
          spinner.start();
        },
        async onRebuildFinish() {
          spinner.stop();
          childProcessRef.removeAllListeners('exit');
          childProcessRef.on('exit', () => {
            childProcessRef = createServer();
            childProcessRef.on('exit', () => (childProcessRef = undefined));
          });
          childProcessRef.stdin && childProcessRef.stdin.pause();
          killProcessSync(childProcessRef.pid);
        },
      });
      let resolve: () => void;
      exitHook(() => {
        childProcessRef?.pid && killProcessSync(childProcessRef.pid);
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
      spinner.stop();
      const childProcessRef = spawn.spawn('node', [config.serverBuildPath], {
        env: {
          ...process.env,
          PORT: String(config.port),
        },
        stdio: 'inherit',
        shell: true,
      });
      exitHook(() => {
        childProcessRef?.pid && killProcessSync(childProcessRef.pid);
      });
    });

  cli.parse(argv);
}
