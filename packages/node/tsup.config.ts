import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/node/index.ts',
  },
  minifyIdentifiers: false,
  bundle: true,
  dts: true,
  sourcemap: true,
  splitting: true,
  minify: process.env.NODE_ENV === 'production',
  skipNodeModulesBundle: true,
  outDir: 'dist/node',
  clean: true,
  format: 'cjs',
  platform: 'node',
  shims: true,
});
