import { getCache } from '@dite/utils';
import type { Loader } from 'esbuild';
import { statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { extname } from 'node:path';
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
  typeof require !== 'undefined' && typeof require.resolve !== 'undefined'
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
      target: 'es2019',
      format: 'cjs',
      logLevel: 'error',
    });
    cache.set(cacheKey, code);
    return code;
  } catch (e) {
    // @ts-expect-error
    throw new Error(`Parse file failed: [${filename}]`, { cause: e });
  }
}

function register(opts: { exts?: string[] } = {}) {
  const { exts = HOOK_EXTS } = opts;

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
}

function dynamicImport(filepath: string, opts: { clean?: boolean } = {}) {
  const { clean = false } = opts;
  let content;
  register();
  if (clean) {
    clearFiles();
    content = __require(filepath);
    for (const file of getFiles()) {
      delete __require.cache[file];
    }
  } else {
    content = __require(filepath);
  }
  restore();
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
