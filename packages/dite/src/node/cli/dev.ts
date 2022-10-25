import exitHook from 'exit-hook';
import { logger } from '../shared/logger';
import { watch } from './watch';

export async function createDevServer(root: string) {
  // Write your code here
  logger.debug('createDevServer', root);

  const closeWatcher = await watch(root);
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
