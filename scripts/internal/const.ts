import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(new URL(import.meta.url)));

export const packagesDir = join(__dirname, '../../packages');

const ROOT = join(__dirname, '../../');

export const PATHS = {
  ROOT,
  PACKAGES: join(ROOT, './packages'),
  EXAMPLES: join(ROOT, './examples'),
  LERNA_CONFIG: join(ROOT, './lerna.json'),
};
