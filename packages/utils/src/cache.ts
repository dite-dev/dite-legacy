// import fsCache from 'file-system-cache';

const CACHE_PATH = 'node_modules/.cache/dite';

// const Cache = _rDefault<typeof fsCache>(fsCache);

// const caches: Record<string, ReturnType<typeof Cache>> = {};

/**
 * get file-system cache for specific namespace
 */
// export function getCache(ns: string): typeof caches['0'] {
export function getCache(ns: string) {
  // if (process.env.DITE_CACHE === 'none') {
  return { set() {}, get() {}, setSync() {}, getSync() {} } as any;
  // }

  // return (caches[ns] ??= Cache({ basePath: join(CACHE_PATH, ns) }));
}
