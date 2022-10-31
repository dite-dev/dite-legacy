import { createRequire } from 'node:module';
import resolveFrom from 'resolve-from';

const __require =
  typeof require === 'function' && typeof require.resolve === 'function'
    ? require
    : createRequire(import.meta.url);

export function localRequire(moduleName: string) {
  const p = resolveFrom.silent(process.cwd(), moduleName);
  return p && __require(p);
}
