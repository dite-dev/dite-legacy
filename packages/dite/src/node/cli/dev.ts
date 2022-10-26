import { exitHook } from '@dite/utils';
import { DiteConfig } from '../core/config';
import { watch } from './watch';

export async function createDevServer(config: DiteConfig) {
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
