import { resolveConfig, ServerMode } from '@dite/core';
import { exitHook } from '@dite/utils';
import { createServer } from '../server';

export async function start(diteRoot: string, opts: { port?: number }) {
  const config = await resolveConfig({
    root: diteRoot,
    mode: ServerMode.Production,
  });
  const server = await createServer(config);
  await server.listen(opts.port);
  exitHook(() => {
    server.close();
  });
}
