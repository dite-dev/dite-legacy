import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
export { default as exitHook } from 'exit-hook';
export { default as lodash } from 'lodash';
export { default as Mustache } from 'mustache';

export const isWindows = os.platform() === 'win32';
const __require =
  typeof require === 'function' && typeof require.resolve === 'function'
    ? require
    : createRequire(import.meta.url);

export function slash(p: string): string {
  return p.replace(/\\/g, '/');
}

export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id);
}

export function localRequire<T>(id: string): T {
  return __require(normalizePath(id)) as T;
}

export function _rDefault<T>(r: any) {
  return (r.default || r) as T;
}
