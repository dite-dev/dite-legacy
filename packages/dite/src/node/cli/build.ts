import * as compiler from '../compiler';
import { readConfig } from '../core/config';
import { ServerMode } from '../core/config/server-mode';

export async function build(diteRoot: string) {
  const config = await readConfig(diteRoot);
  await compiler.build(config, { mode: ServerMode.Production });
}
