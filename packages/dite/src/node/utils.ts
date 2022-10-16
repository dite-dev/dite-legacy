import resolveFrom from 'resolve-from';

export function localRequire(moduleName: string) {
  const p = resolveFrom.silent(process.cwd(), moduleName);
  return p && require(p);
}
