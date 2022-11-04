/**
 * Use SWC to emit decorator metadata
 */
import type { JscConfig } from '@swc/core';
import { Plugin } from 'esbuild';
import path from 'path';
import ts from 'typescript';
import { DiteConfig, localRequire, logger } from '../../core';

export const swcPlugin = (config: DiteConfig): Plugin => {
  return {
    name: 'swc',
    setup(build) {
      const readConfigFile = ts.readConfigFile(
        path.join(config.root, 'server', 'tsconfig.json'),
        ts.sys.readFile.bind(undefined),
      );
      if (readConfigFile.error) {
        process.exit(1);
      }
      const parsedCommandLine = ts.parseJsonConfigFileContent(
        readConfigFile.config,
        ts.sys,
        path.join(config.root, 'server'),
      );
      if (parsedCommandLine.errors.length) {
        process.exit(1);
      }
      const { options: compilerOptions } = parsedCommandLine;
      if (!compilerOptions.emitDecoratorMetadata) return;
      const swc = localRequire<typeof import('@swc/core')>('@swc/core');

      if (!swc) {
        logger.error(
          `You have emitDecoratorMetadata enabled but @swc/core was not installed, skipping swc plugin`,
        );
        return;
      }

      // Force esbuild to keep class names as well
      build.initialOptions.keepNames = true;

      build.onLoad({ filter: /\.[t]sx?$/ }, async (args) => {
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
          target: 'es2020',
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
