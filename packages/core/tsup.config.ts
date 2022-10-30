import { defineConfig } from '../../tsup-base.config';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      route: 'src/route.ts',
      config: 'src/config.ts',
    },
    minifyIdentifiers: false,
    bundle: true,
    dts: true,
    sourcemap: true,
    splitting: true,
    outDir: 'dist',
    clean: true,
    shims: true,
    format: ['cjs', 'esm'],
    external: ['esbuild'],
  },
]);
