import { esbuildLoader } from '@dite-run/webpack/dist/esbuildLoader.cjs';
import path from 'path';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';
import { test } from 'vitest';
import Config from 'webpack-5-chain';
import { build } from './build';

test('build', async () => {
  const now = performance.now();
  const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../temp',
  );
  console.log(root);

  const chainConfig = new Config();
  chainConfig.merge({
    entry: {
      index: path.resolve(
        fileURLToPath(import.meta.url),
        '../../test/fixtures/server.ts',
      ),
    },
    devtool: false,
    output: {
      filename: '[name].js',
      path: root,
      chunkFormat: 'module',
      chunkFilename: 'chunk-[name].js',
      libraryTarget: 'module',
      publicPath: '/',
    },
    experiments: {
      outputModule: true,
    },
    mode: 'development',
    cache: true,
    target: 'node',
    optimization: {
      usedExports: true,
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
          loader: esbuildLoader,
          options: {
            target: 'es2015',
            handler: [],
          },
        },
      ],
    },
    externals: ['express'],
  });
  console.log(path.resolve('node_modules/.cache/webpack'));
  chainConfig.cache({
    type: 'filesystem',
    cacheDirectory: path.resolve('node_modules/.cache/webpack'),
    // buildDependencies: {
    //   config: [fileURLToPath(import.meta.url)],
    // },
  });
  await build(chainConfig);
  console.log(`build time: ${performance.now() - now}ms`);
});
