import { __require } from '@dite/utils';
import { dirname, join } from 'node:path';

export const pkgRoot = dirname(__require.resolve('dite/package.json'));
export const templateDir = join(pkgRoot, 'templates');

export const PATHS = {
  ROOT: pkgRoot,
  TEMPLATE_DIR: templateDir,
};
