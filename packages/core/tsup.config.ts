import fs from 'fs-extra';
import { defineConfig } from 'tsup';

const pkg = fs.readJSONSync('package.json');
const isDev = process.argv.slice(2).includes('--watch');
const isProd = !isDev;

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
    },
    minifyIdentifiers: false,
    bundle: true,
    dts: true,
    sourcemap: true,
    splitting: true,
    minify: process.env.NODE_ENV === 'production',
    skipNodeModulesBundle: isDev,
    outDir: 'dist',
    clean: true,
    shims: true,
    format: ['cjs', 'esm'],
  },
]);
