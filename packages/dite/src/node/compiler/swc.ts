/**
 * Use SWC to emit decorator metadata
 */
import { DiteConfig } from '@dite/core/config';
import { localRequire, logger } from '@dite/utils';
import { JscConfig } from '@swc/core';
import { Plugin } from 'esbuild';
import path from 'path';

export const swcPlugin = (config: DiteConfig): Plugin => {
  return {
    name: 'swc',

    setup(build) {
      const swc: typeof import('@swc/core') = localRequire('@swc/core');

      if (!swc) {
        logger.error(
          `You have emitDecoratorMetadata enabled but @swc/core was not installed, skipping swc plugin`,
        );
        return;
      }

      // Force esbuild to keep class names as well
      build.initialOptions.keepNames = true;

      build.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
        const isTs = /\.tsx?$/.test(args.path);

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

        const result = await swc.transformFile(args.path, {
          jsc,
          sourceMaps: true,
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
