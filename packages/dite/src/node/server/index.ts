import { DiteConfig, readConfig } from '@dite/core';
import { Worker } from 'worker_threads';

export interface DiteServer {
  config: DiteConfig;
  /**
   * Start the server.
   */
  listen(port?: number, isRestart?: boolean): Promise<DiteServer>;
  /**
   * Stop the server.
   */
  close(): Promise<void>;
  /**
   * Print server urls
   */
  printUrls(): void;
  /**
   * Restart the server.
   *
   * @param forceOptimize - force the optimizer to re-bundle, same as --force cli flag
   */
  restart(forceOptimize?: boolean): Promise<void>;
}

export async function createServer(diteRoot: string) {
  const config = await readConfig(diteRoot);

  let serverWorker: Worker | undefined;

  const makeWorker = () => {
    const worker = new Worker(config.serverBuildPath, {
      env: {
        ...process.env,
        PORT: String(config.port),
      },
    });
    worker.on('exit', () => {
      console.log('worker exit');
    });
    return worker;
  };

  const server: DiteServer = {
    config,
    listen: async (port = 3000, isRestart = false) => {
      if (!isRestart) {
        serverWorker = makeWorker();
      }
      return Promise.resolve(server);
    },
    printUrls: () => {
      console.log('111');
    },
    close: async () => {
      await serverWorker?.terminate();
    },
    restart: async () => {
      if (serverWorker) {
        serverWorker.removeAllListeners('exit');
        serverWorker.on('exit', () => {
          serverWorker = makeWorker();
          serverWorker.on('exit', () => (serverWorker = undefined));
        });
        serverWorker.stdin && serverWorker.stdin.destroy();
        await serverWorker.terminate();
      }
    },
  };

  return server;
}
