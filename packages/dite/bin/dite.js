#!/usr/bin/env node
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { performance } from 'node:perf_hooks'

global.__dite_start_time = performance.now()

// patch console for debug
// ref: https://remysharp.com/2014/05/23/where-is-that-console-log
if (process.env.DEBUG_CONSOLE) {
  ['log', 'warn', 'error'].forEach((method) => {
    const old = console[method];
    console[method] = function () {
      let stack = new Error().stack.split(/\n/);
      // Chrome includes a single "Error" line, FF doesn't.
      if (stack[0].indexOf('Error') === 0) {
        stack = stack.slice(1);
      }
      const args = [].slice.apply(arguments).concat([stack[1].trim()]);
      return old.apply(console, args);
    };
  });
}

// Start Dite CLI
async function start() {
  const { Service } = await import('../dist/node/cli.js')
  const service = Service.create()
  await service.run()
  return start
}

(async () => {
  const pkgRoot = path.dirname(path.join(fileURLToPath(import.meta.url), '..'));
  process.env.DITE_PKG_ROOT = pkgRoot;

  await start()
})()
