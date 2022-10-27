import fsCache from 'file-system-cache';
import { join } from 'node:path';
import { _rDefault } from './utils/load-default';

const CACHE_PATH = 'node_modules/.cache/dite';

const Cache = _rDefault<typeof fsCache>(fsCache);

const caches: Record<string, ReturnType<typeof Cache>> = {};

/**
 * get file-system cache for specific namespace
 */
export function getCache(ns: string): typeof caches['0'] {
  return (caches[ns] ??= Cache({ basePath: join(CACHE_PATH, ns) }));
}
