import type { SpawnSyncOptions } from 'child_process';
import spawn from 'cross-spawn';
import glob from 'fast-glob';
import fs from 'fs-extra';
import { isArray } from 'lodash-es';
import { dirname, join } from 'node:path';
import { packagesDir } from '../internal/const';

export function getPkgs(opts?: { base?: string }): string[] {
  const cwd = opts?.base || packagesDir;

  return glob
    .sync('**/package.json', {
      ignore: ['**/{node_modules,src,dist,compiled,templates,.turbo,test}/**'],
      cwd,
    })
    .map(dirname);
}

export function eachPkg(
  pkgs: string[],
  fn: (opts: {
    name: string;
    dir: string;
    pkgPath: string;
    pkgJson: Record<string, any>;
  }) => void,
  opts?: { base?: string },
) {
  const base = opts?.base || packagesDir;
  pkgs.forEach((pkg) => {
    fn({
      name: pkg,
      dir: join(base, pkg),
      pkgPath: join(base, pkg, 'package.json'),
      pkgJson: fs.readJSONSync(join(base, pkg, 'package.json')),
    });
  });
}

export function spawnSync(cmd: string, opts: SpawnSyncOptions) {
  const result = spawn.sync(cmd, {
    shell: true,
    stdio: 'inherit',
    ...opts,
  });
  if (result.status !== 0) {
    console.error(`Execute command error (${cmd})`);
    process.exit(1);
  }
  return result;
}

export function toArray(v: unknown) {
  if (isArray(v)) {
    return v;
  }
  return [v];
}
