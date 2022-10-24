import assert from 'assert';
import consola from 'consola';
import { existsSync } from 'fs';
import { join } from 'path';
import 'zx/globals';
import { examplesDir } from '../internal/const';
import { getPkgs } from '../utils';

function setDepsVersion(opts: {
  deps: string[];
  pkg: Record<string, any>;
  version: string;
}) {
  const { deps, pkg, version } = opts;
  pkg.dependencies ||= {};
  deps.forEach((dep) => {
    if (pkg.dependencies?.[dep]) {
      pkg.dependencies[dep] = version;
    }
    if (pkg.devDependencies?.[dep]) {
      pkg.devDependencies[dep] = version;
    }
  });
  return pkg;
}

async function main() {
  const pkgs = getPkgs();
  consola.info(`pkgs: ${pkgs.join(', ')}`);

  // check git status
  consola.info('check git status');
  const isGitClean = (await $`git status --porcelain`).stdout.trim().length;
  assert(!isGitClean, 'git status is not clean');

  // check git remote update
  consola.info('check git remote update');
  await $`git fetch`;
  const gitStatus = (await $`git status --short --branch`).stdout.trim();
  assert(!gitStatus.includes('behind'), `git status is behind remote`);

  // check npm registry
  consola.info('check npm registry');
  const registry = (await $`npm config get registry`).stdout.trim();
  assert(
    registry === 'https://registry.npmjs.org/',
    'npm registry is not https://registry.npmjs.org/',
  );

  // check package changed
  consola.info('check package changed');
  const changed = (await $`lerna changed --loglevel error`).stdout.trim();
  assert(changed, `no package is changed`);

  // check npm ownership
  consola.info('check npm ownership');
  const whoami = (await $`npm whoami`).stdout.trim();
  await Promise.all(
    ['dite', '@dite/core'].map(async (pkg) => {
      const owners = (await $`npm owner ls ${pkg}`).stdout
        .trim()
        .split('\n')
        .map((line) => {
          return line.split(' ')[0];
        });
      assert(owners.includes(whoami), `${pkg} is not owned by ${whoami}`);
    }),
  );

  $.verbose = false;
  const branch = await $`git rev-parse --abbrev-ref HEAD`;
  console.log('pnpm i');
  await $`pnpm i`;
  // await clean();
  $.verbose = true;

  console.log('pnpm build');
  await $`pnpm build`;

  await $`lerna version --exact --no-commit-hooks --no-git-tag-version --no-push --loglevel error`;
  const version = require('../../lerna.json').version;

  console.info(`version: ${version}`);
  let tag = 'latest';
  if (
    version.includes('-alpha.') ||
    version.includes('-beta.') ||
    version.includes('-rc.')
  ) {
    tag = 'next';
  } else if (version.includes('-canary.')) {
    tag = 'canary';
  } else if (!/^\d+\.\d+(?:\.\d+)?$/.test(version)) {
    console.warn(`version ${version} is not valid`);
    return;
  }

  const examples = fs.readdirSync(examplesDir).filter((dir) => {
    return (
      !dir.startsWith('.') && existsSync(join(examplesDir, dir, 'package.json'))
    );
  });
  examples.forEach((example) => {
    const pkg = require(join(examplesDir, example, 'package.json'));
    // change deps version
    setDepsVersion({
      pkg,
      version,
      deps: [
        '@dite/nest',
        '@dite/node',
        '@dite/runtime',
        '@dite/vue',
        '@dite/react',
        'create-dite',
        'dite',
      ],
    });
    delete pkg.version;
    fs.writeFileSync(
      join(examplesDir, example, 'package.json'),
      `${JSON.stringify(pkg, null, 2)}\n`,
    );
  });

  await $`pnpm i`;
  await $`git commit --all --message "chore(release): ${version}"`;

  // git tag
  if (tag !== 'canary') {
    await $`git tag v${version}`;
  }

  // git push
  await $`git push origin ${branch} --tags`;

  const innersPkgs: string[] = ['@dite/codemod'];
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
