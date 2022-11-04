import { esbuildLoader } from '@dite-run/webpack/dist/esbuildLoader.cjs';
import path from 'path';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';
import { test } from 'vitest';
import webpack from 'webpack';
import { build } from './build';

test('build', async () => {
  const now = performance.now();
  const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../temp',
  );
  console.log(root);
  const entry = path.resolve(
    fileURLToPath(import.meta.url),
    '../../test/fixtures/server.ts',
  );

  const config: webpack.Configuration = {
    entry: {
      index: entry,
    },
    devtool: false,
    output: {
      filename: '[name].js',
      chunkFilename: 'chunk-[name].js',
      path: root,
      chunkFormat: 'module',
      libraryTarget: 'module',
      publicPath: '/',
    },
    experiments: {
      outputModule: true,
    },
    mode: 'none',
    cache: true,
    target: 'node',
    optimization: {
      // usedExports: true,
      splitChunks: {
        chunks: 'all',
        filename: 'chunk-[contenthash:8].js',
      },
      // minimize: true,
    },
    plugins: [],
    module: {
      rules: [
        {
          test: /\.(jsx|js|ts|tsx)$/,
          // exclude: /node_modules/,
          loader: esbuildLoader,
          options: {
            target: 'es2015',
            handler: [],
          },
        },
      ],
    },
    externals: ['express'],
  };
  await build(config);
  console.log(`build time: ${performance.now() - now}ms`);
});
