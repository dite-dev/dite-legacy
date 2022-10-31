import { defineConfig } from '../../tsup-base.config';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
    },
    minifyIdentifiers: true,
    bundle: true,
    dts: true,
    sourcemap: true,
    splitting: true,
    outDir: 'dist',
    clean: true,
    treeshake: true,
    shims: true,
    format: ['cjs', 'esm'],
    external: ['esbuild', 'source-map-support'],
  },
]);
