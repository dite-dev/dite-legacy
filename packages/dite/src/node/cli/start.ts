import { resolveConfig, ServerMode } from '@dite/core/config';
import { exitHook, logger } from '@dite/utils';
import { createServer } from '../server';

export async function start(diteRoot: string, opts: { port?: number }) {
  logger.debug('dite start', { diteRoot, opts });
  const config = resolveConfig({
    root: diteRoot,
    mode: ServerMode.Production,
  });
  logger.debug('dite start config', { config });
  const server = await createServer(config);
  await server.listen(opts.port);
  exitHook(() => {
    server.close();
  });
}
