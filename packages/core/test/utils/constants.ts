import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const TEST_FIXTURES_ROOT = join(
  dirname(fileURLToPath(import.meta.url)),
  '../fixtures',
);
