/**
 * Use SWC to emit decorator metadata
 */
import { DiteConfig } from '@dite/core/config';
import { logger } from '@dite/utils';
import type { JscConfig } from '@swc/wasm';
import swc from '@swc/wasm';
import type { Plugin } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

export const swcPlugin = (config: DiteConfig): Plugin => {
  return {
    name: 'dite-server-swc',
    async setup(build) {
      logger.debug('dite-server-swc setup');
      // const swc: typeof import('@swc/wasm') = localRequire('@swc/wasm');
      // logger.debug('dite-server-swc load swc done');

      if (!swc) {
        console.warn(
          build.initialOptions.format!,
          'You have emitDecoratorMetadata enabled but @swc/wasm was not installed, skipping swc plugin',
        );
        return;
      }

      // Force esbuild to keep class names as well
      build.initialOptions.keepNames = true;

      build.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
        const isTs = /\.tsx?$/.test(args.path);
        logger.debug(`dite-server-swc onLoad' ${args.path}`);

        const jsc: JscConfig = {
          parser: {
            syntax: isTs ? 'typescript' : 'ecmascript',
            decorators: true,
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
          keepClassNames: true,
          target: 'es2022',
        };

        const fileContent = fs.readFileSync(args.path, 'utf-8');

        const result = await swc.transform(fileContent, {
          jsc,
          sourceMaps: config.mode === 'development',
          configFile: false,
          swcrc: false,
        });

        let code = result.code;
        if (result.map) {
          const map: { sources: string[] } = JSON.parse(result.map);
          // Make sure sources are relative path
          map.sources = map.sources.map((source) => {
            return path.isAbsolute(source)
              ? path.relative(path.dirname(args.path), source)
              : source;
          });
          code += `//# sourceMappingURL=data:application/json;base64,${Buffer.from(
            JSON.stringify(map),
          ).toString('base64')}`;
        }
        return {
          contents: code,
        };
      });
    },
  };
};
