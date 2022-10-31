import { defineConfig } from '../../tsup-base.config';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
    },
    bundle: true,
    dts: true,
    sourcemap: true,
    splitting: true,
    outDir: 'dist',
    clean: true,
    shims: true,
    platform: 'node',
    format: ['cjs', 'esm'],
    external: ['esbuild'],
  },
]);
