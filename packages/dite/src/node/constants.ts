import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const __require = createRequire(import.meta.url);

export const pkgRoot = dirname(__require.resolve('dite/package.json'));
export const templateDir = join(pkgRoot, 'templates');

export const configFiles = [
  '.diterc.ts',
  '.diterc.js',
  'dite.config.ts',
  'dite.config.js',
];

export const PATHS = {
  TEMPLATE_DIR: templateDir,
};
