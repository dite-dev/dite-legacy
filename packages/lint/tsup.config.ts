import { defineConfig } from '../../tsup.config.base';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  minifyIdentifiers: false,
  bundle: true,
  dts: true,
  sourcemap: true,
  splitting: true,
  skipNodeModulesBundle: true,
  outDir: 'dist',
  format: ['cjs', 'esm'],
  shims: true,
});
