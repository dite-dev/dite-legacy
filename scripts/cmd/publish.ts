import { createRequire } from 'module';
import 'zx/globals';
import { getPkgs } from '../utils';

const require = createRequire(import.meta.url);

function getVersion() {
  return require('../../lerna.json').version;
}

async function main() {
  const pkgs = getPkgs();

  const version = getVersion();
  let tag = 'latest';
  if (
    version.includes('-alpha.') ||
    version.includes('-beta.') ||
    version.includes('-rc.')
  ) {
    tag = 'next';
  }
  if (version.includes('-canary.')) tag = 'canary';
  const innersPkgs: string[] = [];
  const publishPkgs = pkgs.filter(
    // do not publish
    (pkg) => !innersPkgs.includes(pkg),
  );
  await Promise.all(
    publishPkgs.map((pkg) => $`cd packages/${pkg} && npm publish --tag ${tag}`),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
