import { defineConfig } from '../../tsup-base.config';

export default defineConfig([
  {
    entry: {
      index: 'src/node/index.ts',
    },
    minifyIdentifiers: false,
    bundle: true,
    dts: true,
    sourcemap: true,
    splitting: true,
    skipNodeModulesBundle: true,
    outDir: 'dist',
    clean: true,
    shims: true,
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
    clean: true,
    shims: true,
    format: ['cjs', 'esm'],
  },
]);
