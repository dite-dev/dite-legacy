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
  minify: prod,
  skipNodeModulesBundle: true,
  silent: prod,
  outDir: 'dist',
  clean: true,
  shims: true,
  format: 'cjs',
});
