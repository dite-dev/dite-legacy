import { init, parse } from 'es-module-lexer';
import {
  Loader as EsbuildLoader,
  transform as transformInternal,
} from 'esbuild';
import path from 'path';
import { LoaderContext } from 'webpack';
import { IEsbuildLoaderOpts } from './types';

async function esbuildTranspiler(
  this: LoaderContext<IEsbuildLoaderOpts>,
  source: string,
): Promise<void> {
  const done = this.async();

  const options: IEsbuildLoaderOpts = this.getOptions();
  const { handler = [], implementation, ...otherOptions } = options;
  const transform = implementation?.transform || transformInternal;

  const filePath = this.resourcePath;
  const ext = path.extname(filePath).slice(1) as EsbuildLoader;
  console.log('ext', ext);

  const transformOptions = {
    ...otherOptions,
    target: options.target ?? 'es2015',
    loader: ext ?? 'js',
    sourcemap: this.sourceMap,
    sourcefile: filePath,
  };

  try {
    const res = await transform(source, transformOptions);
    const { map } = res;
    let { code } = res;

    if (handler.length) {
      await init;
      handler.forEach((handle) => {
        const [imports, exports] = parse(code);
        code = handle({ code, imports, exports, filePath });
      });
    }

    done(null, code, map && JSON.parse(map));
  } catch (error: unknown) {
    done(error as Error);
  }
}

export default esbuildTranspiler;

export const esbuildLoader = __filename;
