import { resolveConfig } from '@dite/core';

export async function build(diteRoot: string) {
  const config = await resolveConfig({
    root: diteRoot,
    command: 'build',
    mode: 'production',
  });
}

export async function dev(diteRoot: string) {
  const config = await resolveConfig({
    root: diteRoot,
    command: 'serve',
    mode: 'development',
  });
}

export async function watch(diteRoot: string) {
  const config = await resolveConfig({
    root: diteRoot,
    command: 'serve',
    mode: 'development',
  });

  // let childProcessRef: any;
  //
  // const createServer = () => {
  //   const app = spawn.spawn('node', [config.serverBuildPath], {
  //     env: process.env,
  //     stdio: 'inherit',
  //     shell: true,
  //   });
  //   return app;
  // };
  // const closeWatcher = await compiler.watch(config, {
  //   mode: 'development',
  //   async onInitialBuild() {
  //     spinner.stop();
  //     childProcessRef = createServer();
  //   },
  //   onRebuildStart: () => {
  //     spinner.start();
  //   },
  //   async onRebuildFinish() {
  //     spinner.stop();
  //     childProcessRef.removeAllListeners('exit');
  //     childProcessRef.on('exit', () => {
  //       childProcessRef = createServer();
  //       childProcessRef.on('exit', () => (childProcessRef = undefined));
  //     });
  //     childProcessRef.stdin && childProcessRef.stdin.pause();
  //     killProcessSync(childProcessRef.pid);
  //   },
  // });
}
