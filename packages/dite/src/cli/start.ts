import { exitHook, logger, resolveConfig } from '../core';
import { createServer } from '../node/server';

export async function start(diteRoot: string, opts: { port?: number }) {
  logger.debug(`dite start diteRoot:${diteRoot}`);
  const config = resolveConfig({
    root: diteRoot,
    mode: 'production',
  });
  logger.debug('dite start config');
  const server = await createServer(config);
  await server.listen(opts.port);
  exitHook(() => {
    server.close();
  });
}
