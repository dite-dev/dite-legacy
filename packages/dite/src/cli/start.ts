import { resolveConfig } from '@dite/core/config';
import { exitHook, logger } from '@dite/utils';
import { createServer } from '../node/server';

export async function start(diteRoot: string, opts: { port?: number }) {
  logger.debug('dite start', { diteRoot, opts });
  const config = resolveConfig({
    root: diteRoot,
    mode: 'production',
  });
  logger.debug('dite start config', { config });
  const server = await createServer(config);
  await server.listen(opts.port);
  exitHook(() => {
    server.close();
  });
}
