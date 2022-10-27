import esbuild from 'esbuild';
import { createRequire } from 'node:module';
import { extname } from 'node:path';
import { addHook } from 'pirates';

const COMPILE_EXTS = ['.ts', '.tsx', '.js', '.jsx'];
const HOOK_EXTS = [...COMPILE_EXTS, '.mjs'];

let registered = false;
let files: string[] = [];
let revert: () => void = () => {};

const __require =
  typeof require === 'function' ? require : createRequire(import.meta.url);

function transform(opts: { code: string; filename: string; implementor: any }) {
  const { code, filename, implementor } = opts;
  files.push(filename);
  const ext = extname(filename);
  try {
    return implementor.transformSync(code, {
      sourcefile: filename,
      loader: ext.slice(1),
      target: 'es2019',
      format: 'cjs',
      logLevel: 'error',
    }).code;
  } catch (e) {
    // @ts-ignore
    throw new Error(`Parse file failed: [${filename}]`, { cause: e });
  }
}

function register(opts: { implementor?: any; exts?: string[] } = {}) {
  const { implementor = esbuild, exts = HOOK_EXTS } = opts;
  files = [];
  if (!registered) {
    revert = addHook(
      (code, filename) => transform({ code, filename, implementor }),
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
