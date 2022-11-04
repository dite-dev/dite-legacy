import type { ExportSpecifier, ImportSpecifier } from 'es-module-lexer';
import type { TransformOptions } from 'esbuild';

export type Mode = 'development' | 'production';

export interface IEsbuildLoaderHandlerParams {
  code: string;
  filePath: string;
  imports: readonly ImportSpecifier[];
  exports: readonly ExportSpecifier[];
}

export interface IEsbuildLoaderOpts extends Partial<TransformOptions> {
  handler?: Array<(opts: IEsbuildLoaderHandlerParams) => string>;
  implementation?: typeof import('esbuild');
}
