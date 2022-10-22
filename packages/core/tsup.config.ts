import fs from 'fs-extra';
import { defineConfig, Format } from 'tsup';

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
      index: 'src/index.ts',
    },
    minifyIdentifiers: isProd,
    bundle: true,
    dts: true,
    sourcemap: true,
    splitting: true,
    minify: process.env.NODE_ENV === 'production',
    skipNodeModulesBundle: true,
    outDir: 'dist',
    clean: true,
    shims: true,
    format: ['cjs', 'esm'],
    banner,
  },
]);
