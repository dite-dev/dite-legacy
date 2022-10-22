import type { ChildProcess } from 'child_process';
import { fork } from 'child_process';
import { treeKillSync as killProcessSync } from '../../shared/lib/tree-kill';
import { logger } from '../../shared/logger';
import { DiteConfig, readConfig } from '../config';

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

export async function createServer(
  diteRoot: string,
  cb?: (server: DiteServer) => void,
): Promise<DiteServer>;
export async function createServer(
  config: DiteConfig,
  cb?: (server: DiteServer) => void,
): Promise<DiteServer>;
export async function createServer(
  opt: any,
  cb?: (server: DiteServer) => void,
) {
  const config = typeof opt === 'string' ? await readConfig(opt) : opt;

  let childRef: ChildProcess | undefined;
  // const spinner = ora('dite');

  const createChildProcess = ({ port }: { port?: number } = {}) => {
    const ref = fork(config.serverBuildPath, {
      env: {
        ...process.env,
        PORT: String(port ?? config.port),
      },
      stdio: 'inherit',
    });

    ref.on('message', (msg) => {
      if (msg === 'dite:ready') {
        // spinner.stop();
        logger.ready('Server is ready.');
      }
    });

    ref.on('error', () => {
      // spinner.stop();
    });
    return ref;
  };

  const server: DiteServer = {
    config,
    listen: async (port: number, isRestart = false) => {
      if (!isRestart) {
        childRef = createChildProcess({ port });
        childRef.on('exit', () => (childRef = undefined));
      }
      return Promise.resolve(server);
    },
    printUrls: () => {
      console.log('111');
    },
    close: async () => {
      childRef?.pid && killProcessSync(childRef.pid);
    },
    restart: async () => {
      if (childRef) {
        childRef.removeAllListeners('exit');
        childRef.on('exit', () => {
          childRef = createChildProcess();
          childRef.on('exit', () => (childRef = undefined));
        });
        childRef.stdin && childRef.stdin.destroy();
        childRef.pid && killProcessSync(childRef.pid);
      } else {
        childRef = createChildProcess();
        childRef.on('exit', () => (childRef = undefined));
      }
    },
  };

  cb?.(server);
  return server;
}
