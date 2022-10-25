import { defineConfig } from 'tsup';

const prod = process.env.NODE_ENV === 'production';

export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
  },
  minifyIdentifiers: false,
  bundle: true,
  dts: true,
  sourcemap: true,
  splitting: true,
  skipNodeModulesBundle: true,
  minify: prod,
  silent: prod,
  outDir: 'dist',
  clean: true,
  shims: true,
  format: 'esm',
});
