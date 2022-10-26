import { defineConfig } from 'tsup';

const isDev = process.env.NODE_ENV !== 'production';
const isProd = !isDev;

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
    platform: 'node',
    dts: true,
    sourcemap: true,
    splitting: false,
    minify: isProd,
    treeshake: true,
    keepNames: true,
    outDir: 'dist/node',
    clean: isProd,
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
    clean: isProd,
    shims: true,
    // banner,
  },
]);
