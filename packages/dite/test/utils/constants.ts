import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export const TEST_FIXTURES_ROOT = join(
  dirname(fileURLToPath(import.meta.url)),
  '../fixtures',
);
