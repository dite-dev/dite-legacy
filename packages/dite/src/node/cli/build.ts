import { resolveConfig, ServerMode } from '@dite/core';
import * as compiler from '../compiler';

export async function build(diteRoot: string) {
  const config = await resolveConfig({
    root: diteRoot,
    mode: ServerMode.Production,
  });
  await compiler.build(config, { mode: ServerMode.Production });
}
