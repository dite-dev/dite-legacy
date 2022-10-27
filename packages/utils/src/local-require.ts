import { createRequire } from 'node:module';
import resolveFrom from 'resolve-from';

export const __require = (() => {
  if (typeof require !== 'undefined') {
    return require;
  }
  return createRequire(import.meta.url);
})();

export function localRequire(moduleName: string) {
  const p = resolveFrom.silent(process.cwd(), moduleName);
  return p && __require(p);
}
