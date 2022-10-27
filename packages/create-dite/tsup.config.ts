import { defineConfig } from '../../tsup-base.config';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
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
  format: 'esm',
});
