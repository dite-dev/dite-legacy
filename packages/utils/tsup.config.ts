import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
    },
    bundle: true,
    dts: true,
    sourcemap: true,
    splitting: true,
    minify: process.env.NODE_ENV === 'production',
    outDir: 'dist',
    clean: true,
    shims: true,
    platform: 'node',
    format: ['cjs', 'esm'],
  },
]);
