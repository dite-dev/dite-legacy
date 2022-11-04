import { dirname, join } from 'node:path';

export const pkgRoot = dirname(require.resolve('@dite-run/dite/package.json'));
export const templateDir = join(pkgRoot, 'templates');

export const PATHS = {
  ROOT: pkgRoot,
  TEMPLATE_DIR: templateDir,
};
