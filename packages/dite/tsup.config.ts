import { defineConfig } from '../../tsup-base.config';

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
    treeshake: true,
    keepNames: true,
    outDir: 'dist/node',
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
    skipNodeModulesBundle: true,
    outDir: 'dist/client',
    format: ['cjs', 'esm'],
    shims: true,
  },
]);
