import { resolveConfig, ServerMode } from '@dite/core/config';
import { logger } from '@dite/utils';
// import * as compiler from '../node/compiler';

export async function build(diteRoot: string) {
  logger.debug('111');
  const config = resolveConfig({
    root: diteRoot,
    mode: ServerMode.Production,
  });
  console.log(config);
  logger.debug('222');
  // await compiler.build(config, { mode: ServerMode.Production });
}
