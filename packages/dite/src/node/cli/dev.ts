import { DiteConfig, readConfig } from '@dite/core';
import { exitHook } from '@dite/utils';
import { watch } from './watch';

export async function createDevServer(config: DiteConfig) {
  const config2 = readConfig();
  console.log('config2', config2);
  const closeWatcher = await watch(config);
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
