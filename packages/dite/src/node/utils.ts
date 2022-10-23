import { createRequire } from 'module';
import resolveFrom from 'resolve-from';

const require = createRequire(import.meta.url);

export function localRequire(moduleName: string) {
  const p = resolveFrom.silent(process.cwd(), moduleName);
  return p && require(p);
}
