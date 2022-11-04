import { join } from 'node:path';
import rimraf from 'rimraf';
import { eachPkg, getPkgs } from '../utils';

export async function clean() {
  const pkgs = getPkgs();
  eachPkg(pkgs, ({ dir }) => {
    rimraf.sync(join(dir, 'dist'));
    rimraf.sync(join(dir, '.turbo'));
  });
  rimraf.sync(join(process.cwd(), '.turbo'));
}

function main() {
  return clean();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
