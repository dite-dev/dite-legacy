import exitHook from 'exit-hook';
import { createServer } from '../server';

export async function start(diteRoot: string, opts: { port?: number }) {
  const server = await createServer(diteRoot);
  await server.listen(opts.port);
  exitHook(() => {
    server.close();
  });
}
