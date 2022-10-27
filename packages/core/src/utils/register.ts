import { createHash } from 'crypto';
import type { Loader } from 'esbuild';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'node:module';
import { extname } from 'node:path';
import { basename, dirname, join } from 'path';
import { addHook } from 'pirates';

const COMPILE_EXTS = ['.ts', '.tsx', '.js', '.jsx'];
const HOOK_EXTS = [...COMPILE_EXTS, '.mjs'];

let registered = false;
let files: string[] = [];
let revert: () => void = () => {};

const __require =
  typeof require === 'function' ? require : createRequire(import.meta.url);

const md5 = (content: string, len = 8) => {
  return createHash('md5').update(content).digest('hex').slice(0, len);
};

const cacheDir = join(process.cwd(), '.cache');
if (!existsSync(cacheDir)) mkdirSync(cacheDir);

function transform(opts: {
  code: string;
  filename: string;
  implementor: typeof import('esbuild');
}) {
  const { code: source, filename, implementor } = opts;
  files.push(filename);
  try {
    const ext = extname(filename);
    const sourceHash = md5(source, 16);
    const filebase = basename(dirname(filename)) + '-' + basename(filename);
    const cacheFile = join(cacheDir, filebase + '.' + sourceHash + '.js');
    if (existsSync(cacheFile)) readFileSync(cacheFile, 'utf-8');

    const { code } = implementor.transformSync(source, {
      sourcefile: filename,
      loader: ext.slice(1) as Loader,
      target: 'es2019',
      format: 'cjs',
      logLevel: 'error',
    });
    writeFileSync(cacheFile, code, 'utf-8');
    return code;
  } catch (e) {
    // @ts-ignore
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
