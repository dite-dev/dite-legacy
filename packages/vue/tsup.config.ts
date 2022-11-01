import { defineConfig } from '../../tsup.config.base';

export default defineConfig([
  {
    entry: {
      index: 'src/node/index.ts',
      render: 'src/render/index.ts',
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
    format: ['esm', 'cjs'],
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
    format: 'esm',
  },
]);
