import { readConfig, ServerMode } from '@dite/core';
import { spawn } from 'cross-spawn';
import exitHook from 'exit-hook';
import ora from 'ora';
import { treeKillSync as killProcessSync } from '../../shared/lib/tree-kill';
import * as compiler from '../compiler';

export async function watch(diteRoot: string) {
  const config = await readConfig(diteRoot);

  let childProcessRef: any;

  const spinner = ora('dite');

  const createServer = () => {
    return spawn('node', [config.serverBuildPath], {
      env: process.env,
      stdio: 'inherit',
      shell: true,
    });
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
  return () => {
    childProcessRef?.pid && killProcessSync(childProcessRef.pid);
    closeWatcher();
  };
}

export async function build(diteRoot: string) {
  const config = await readConfig(diteRoot);
  await compiler.build(config, { mode: ServerMode.Production });
}

export async function start(diteRoot: string, opts: { port?: number }) {
  const config = await readConfig(diteRoot);
  const childProcessRef = spawn('node', [config.serverBuildPath], {
    env: {
      ...process.env,
      PORT: String(opts.port),
    },
    stdio: 'inherit',
    shell: true,
  });
  exitHook(() => {
    childProcessRef?.pid && killProcessSync(childProcessRef.pid);
  });
}
