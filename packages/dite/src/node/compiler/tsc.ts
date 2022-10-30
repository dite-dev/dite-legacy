/**
 * Use SWC to emit decorator metadata
 */
import { DiteConfig } from '@dite/core/config';
import { logger } from '@dite/utils';
import type { Plugin } from 'esbuild';
import fs from 'node:fs';
import tsNode from 'ts-node';

export const tscPlugin = (config: DiteConfig): Plugin => {
  return {
    name: 'dite-server-tsc',
    async setup(build) {
      logger.debug('dite-server-tsc setup');
      const service = tsNode.create({
        swc: false,
        compilerOptions: {
          module: 'commonjs',
          declaration: true,
          strict: true,
          removeComments: true,
          emitDecoratorMetadata: true,
          experimentalDecorators: true,
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          moduleResolution: 'node',
          target: 'es2020',
          sourceMap: true,
          outDir: './dist',
          baseUrl: '.',
          incremental: true,
          skipLibCheck: true,
          strictNullChecks: false,
          noImplicitAny: false,
          strictBindCallApply: false,
          jsx: 'preserve',
          forceConsistentCasingInFileNames: true,
        },
      });

      // Force esbuild to keep class names as well
      build.initialOptions.keepNames = true;

      build.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
        const isTs = /\.tsx?$/.test(args.path);
        logger.debug(`dite-server-swc onLoad' ${args.path}`);

        const source = fs.readFileSync(args.path, 'utf-8');
        const code = service.compile(source, args.path);
        return {
          contents: code,
        };
      });
    },
  };
};
