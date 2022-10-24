import { createRequire } from 'node:module';
import { join } from 'node:path';

const __require = createRequire(import.meta.url);

export const pkgRoot = join(__require.resolve('dite/package.json'), '..');
export const templateDir = join(pkgRoot, 'templates');

export const configFiles = [
  '.diterc.ts',
  '.diterc.js',
  'dite.config.ts',
  'dite.config.js',
];
