import { getCache, logger } from '@dite/utils';
import type { Loader } from 'esbuild';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, extname, resolve } from 'node:path';
import { addHook } from 'pirates';

const COMPILE_EXTS = ['.ts', '.tsx', '.js', '.jsx'];
const HOOK_EXTS = [...COMPILE_EXTS, '.mjs'];

let registered = false;
let files: string[] = [];
let revert: () => void = () => {};

/**
 * cache for transform
 */
const cache = getCache('bundless-loader');

const __require =
  typeof require === 'function' && typeof require.resolve === 'function'
    ? require
    : createRequire(import.meta.url);

function transform(opts: {
  code: string;
  filename: string;
  implementor: typeof import('esbuild');
}) {
  const { code: source, filename, implementor } = opts;
  files.push(filename);
  try {
    const ext = extname(filename);
    const cacheKey = [filename, statSync(filename).mtimeMs].join(':');
    const cached = cache.getSync(cacheKey);
    if (cached) return cached;

    const { code } = implementor.transformSync(source, {
      sourcefile: filename,
      loader: ext.slice(1) as Loader,
      target: 'es2020',
      format: 'cjs',
      logLevel: 'error',
    });
    cache.setSync(cacheKey, code);
    return code;
  } catch (e) {
    // @ts-expect-error
    throw new Error(`Parse file failed: [${filename}]`, { cause: e });
  }
}

function register(opts: { exts?: string[] } = {}) {
  const { exts = HOOK_EXTS } = opts;
  logger.debug('register loader');
  const esbuild = __require(__require.resolve('esbuild'));

  files = [];
  if (!registered) {
    revert = addHook(
      (code, filename) => transform({ code, filename, implementor: esbuild }),
      {
        exts,
        ignoreNodeModules: true,
      },
    );
    registered = true;
  }
  logger.debug('register loader done');
}

function dynamicRequire(filename: string) {
  files.push(filename);
  const ext = extname(filename);
  const cacheKey = [basename(filename), statSync(filename).mtimeMs].join('-');
  const cacheFile = resolve(`./.cache/${cacheKey}.js`);
  mkdirSync(dirname(cacheFile), { recursive: true });
  if (existsSync(cacheFile)) {
    return __require(cacheFile);
  }
  const esbuild = __require(__require.resolve('esbuild'));

  const source = readFileSync(filename, 'utf-8');
  const { code } = esbuild.transformSync(source, {
    sourcefile: filename,
    loader: ext.slice(1) as Loader,
    target: 'es2020',
    format: 'cjs',
    logLevel: 'error',
  });
  console.log('code', code);

  writeFileSync(cacheFile, code, 'utf-8');
  __require(cacheFile);
  return code;
}

function dynamicImport(filepath: string, opts: { clean?: boolean } = {}) {
  const { clean = false } = opts;
  let content;
  // register();
  if (clean) {
    clearFiles();
    content = dynamicRequire(filepath);
    for (const file of getFiles()) {
      delete __require.cache[file];
    }
  } else {
    content = dynamicRequire(filepath);
  }
  // restore();
  return content;
}

function getFiles() {
  return files;
}

function clearFiles() {
  files = [];
}

function restore() {
  revert();
  registered = false;
}

export default dynamicImport;
