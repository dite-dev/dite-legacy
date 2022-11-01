import { defineConfig } from '../../tsup.config.base';

export default defineConfig([
  {
    entry: {
      index: 'src/node/index.ts',
      cli: 'src/cli/cli.ts',
      dev: 'src/cli/dev.ts',
    },
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
    external: ['esbuild', '@swc/core', 'typescript', 'vite', 'tsup'],
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
    external: ['esbuild', '@swc/core', 'typescript', 'vite', 'tsup'],
  },
]);
