import { join } from 'node:path';

export const pkgRoot = join(__dirname, '../..');
export const templateDir = join(pkgRoot, 'templates');

export const configFiles = [
  '.diterc.ts',
  '.diterc.js',
  'dite.config.ts',
  'dite.config.js',
];
