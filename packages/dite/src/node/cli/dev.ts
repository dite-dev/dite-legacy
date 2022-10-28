import { DiteConfig } from '@dite/core/config';
import { exitHook, logger } from '@dite/utils';
import { watch } from './watch';

export async function createDevServer(config: DiteConfig) {
  // logger.debug('dite createDevServer', { config: JSON.stringify(config) });
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
