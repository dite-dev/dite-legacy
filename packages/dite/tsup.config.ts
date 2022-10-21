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
      cli: 'src/node/cli.ts',
      dev: 'src/node/dev.ts',
      index: 'src/node/index.ts',
    },
    minifyIdentifiers: false,
    skipNodeModulesBundle: isDev,
    bundle: true,
    dts: true,
    sourcemap: true,
    splitting: true,
    minify: isProd,
    outDir: 'dist/node',
    clean: true,
    shims: true,
    format: ['cjs', 'esm'],
    external: [
      // 'esbuild',
      '@swc/core',
      ...Object.keys(pkg.dependencies),
      // ...(isProd ? [] : Object.keys(pkg.devDependencies)),
    ],
    banner,
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
    clean: true,
    shims: true,
    banner,
  },
]);
