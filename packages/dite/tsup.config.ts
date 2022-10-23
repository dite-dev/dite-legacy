import fs from 'fs-extra';
import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

const pkg = fs.readJSONSync('package.json');
const isDev = process.argv.slice(2).includes('--watch');
const isProd = !isDev;
const isWatch = process.argv.slice(2).includes('--watch');

const cliConfig: Options = {
  entry: {
    cli: 'src/cli/index.ts',
  },
  minifyIdentifiers: false,
  skipNodeModulesBundle: true,
  bundle: true,
  dts: true,
  sourcemap: true,
  splitting: true,
  minify: false,
  outDir: 'dist/node',
  clean: !isWatch,
  shims: true,
  format: ['esm'],
};

export default defineConfig([
  cliConfig,
  {
    entry: {
      dev: 'src/node/dev.ts',
      index: 'src/node/index.ts',
    },
    minifyIdentifiers: false,
    skipNodeModulesBundle: true,
    bundle: true,
    dts: true,
    sourcemap: true,
    splitting: true,
    minify: isProd,
    outDir: 'dist/node',
    clean: !isWatch,
    shims: true,
    format: ['cjs', 'esm'],
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
    clean: !isWatch,
    shims: true,
  },
]);
