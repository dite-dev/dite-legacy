import * as compiler from '../compiler';
import { resolveConfig } from '../core/config';
import { ServerMode } from '../core/config/server-mode';

export async function build(diteRoot: string) {
  const config = await resolveConfig({
    root: diteRoot,
    mode: ServerMode.Production,
  });
  await compiler.build(config, { mode: ServerMode.Production });
}
