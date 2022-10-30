import { defineConfig } from '../../tsup-base.config';

export default defineConfig([
  {
    entry: {
      index: 'src/node/index.ts',
      cli: 'src/cli/cli.ts',
      dev: 'src/cli/dev.ts',
    },
    minifyIdentifiers: false,
    bundle: true,
    platform: 'node',
    dts: true,
    sourcemap: true,
    splitting: true,
    treeshake: true,
    keepNames: true,
    outDir: 'dist',
    shims: true,
    format: ['cjs', 'esm'],
    external: ['vite'],
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
    outDir: 'dist/client',
    format: ['cjs', 'esm'],
    shims: true,
  },
]);
