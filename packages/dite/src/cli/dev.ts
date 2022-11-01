import type { WatchOptions } from 'chokidar';
import { DiteConfig, exitHook, logger, resolveConfig } from '../core';
import { watch } from './watch';

export async function createDevServer(config: DiteConfig) {
  // logger.debug('dite createDevServer', { config: JSON.stringify(config) });
  // const closeWatcher = await watch(config);
  // logger.debug('dite createDevServer closeWatcher');
  // let resolve: () => void;
  // exitHook(() => {
  //   closeWatcher();
  //   resolve();
  // });
  // return new Promise<void>((r) => {
  //   resolve = r;
  // }).then(async () => {
  //   await closeWatcher();
  // });
}

export function resolveChokidarOptions(opts?: WatchOptions) {
  const { ignored = [], ...otherOptions } = opts ?? {};
  const resolvedChokidarOptions: WatchOptions = {
    ignored: [
      '**/.git/**',
      '**/node_modules/**',
      '**/test-results/**',
      ...(Array.isArray(ignored) ? ignored : [ignored]),
    ],
    ignoreInitial: true,
    ignorePermissionErrors: true,
    ...otherOptions,
  };

  return resolvedChokidarOptions;
}

async function rebuildServer() {}

export async function dev(root: string) {
  const config = resolveConfig({
    root,
    mode: 'development',
  });
  const closeWatcher = await watch(config);
  logger.debug('dite createDevServer closeWatcher');
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
}
