import { join } from 'path';

const root = new URL('..', import.meta.url);

export const pkgRoot = join(root.pathname, '..');
export const templateDir = join(pkgRoot, 'templates');
