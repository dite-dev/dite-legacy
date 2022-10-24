import fs from 'fs-extra';
import type { Format } from 'tsup';
import { defineConfig } from 'tsup';

const pkg = fs.readJSONSync('package.json');
const isDev = process.argv.slice(2).includes('--watch');
const isProd = !isDev;

const banner = ({ format }: { format: Format }) => ({
  js:
    format === 'esm'
      ? `import {createRequire as __createRequire} from 'module';var require = __createRequire(import` +
        `.meta.url);`
      : '',
});

export default defineConfig([
  {
    entry: {
      index: 'src/node/index.ts',
      cli: 'src/node/cli.ts',
      dev: 'src/node/cli/dev.ts',
    },
    minifyIdentifiers: false,
    skipNodeModulesBundle: true,
    bundle: true,
    dts: true,
    sourcemap: true,
    splitting: true,
    minify: isProd,
    treeshake: true,
    outDir: 'dist/node',
    clean: isProd,
    shims: true,
    format: ['esm'],
  },
  {
    entry: {
      client: 'src/client/index.ts',
    },
    minifyIdentifiers: false,
    bundle: true,
    dts: true,
    sourcemap: true,
    splitting: true,
    minify: isProd,
    skipNodeModulesBundle: true,
    outDir: 'dist/client',
    format: ['cjs', 'esm'],
    clean: isProd,
    shims: true,
    banner,
  },
]);
