import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      cli: 'src/node/cli.ts',
      dev: 'src/node/dev.ts',
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
    shims: true,
    // noExternal: ['bundle-require'],
    format: ['cjs', 'esm'],
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
    minify: process.env.NODE_ENV === 'production',
    skipNodeModulesBundle: true,
    outDir: 'dist/client',
    clean: true,
    shims: true,
    format: ['cjs', 'esm'],
  },
]);
