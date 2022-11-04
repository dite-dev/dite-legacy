import { defineConfig } from '../../tsup.config.base';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
    },
    minifyIdentifiers: false,
    bundle: true,
    dts: true,
    sourcemap: true,
    splitting: true,
    clean: true,
    platform: 'node',
    shims: true,
    format: ['cjs', 'esm'],
    external: ['vite', 'esbuild', 'es-module-lexer'],
  },
  {
    entry: {
      esbuildLoader: 'src/loader/esbuild.ts',
    },
    minifyIdentifiers: false,
    bundle: true,
    dts: true,
    sourcemap: true,
    splitting: true,
    skipNodeModulesBundle: true,
    clean: true,
    platform: 'node',
    shims: true,
    format: 'cjs',
    external: ['vite', 'esbuild', 'es-module-lexer'],
  },
]);
