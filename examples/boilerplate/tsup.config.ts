import { defineConfig } from 'tsup';

const banner = ({ format }: { format: Format }) => ({
  js:
    format === 'esm'
      ? 'import {createRequire as __createRequire} from "module";\
import { fileURLToPath, URL } from "url";\
import { dirname } from "path";\
var require = __createRequire(import' +
        '.meta.url);\
var __dir' +
        'name = dirname(fileURLToPath(import.meta.url));'
      : '',
});

export default defineConfig({
  entry: {
    server: '.dite/src/server.ts',
  },
  format: ['cjs', 'esm'],
  outDir: '.dite/dist',
  platform: 'node',
  //   banner,
  keepNames: true,
  splitting: false,
  shims: true,
});
