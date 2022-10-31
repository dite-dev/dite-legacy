import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

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

export function localRequire(id: string): any {
  return __require(normalizePath(id));
}

export function _rDefault<T>(r: any) {
  return (r.default || r) as T;
}
