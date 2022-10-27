import 'zx/globals';
// @ts-expect-error
import { version as latestVersion } from '../../lerna.json';

const excludesVersions = ['0.0.1-security', '0.1.26', latestVersion];

async function unpublish(pkgName: string) {
  $.verbose = false;
  const versions: string[] = eval(
    (await $`npm view ${pkgName} versions`).stdout,
  ).filter((v: string) => !excludesVersions.includes(v));
  $.verbose = true;

  for (const version of versions) {
    console.log(
      `will execute: npm unpublish ${chalk.blue(pkgName)}@${chalk.cyan(
        version,
      )} --force`,
    );
    await $`npm unpublish ${pkgName}@${version} --force`;
    await sleep(2000);
  }
}

async function unpublishAll() {
  try {
    await unpublish('@dite/utils');
    await unpublish('@dite/core');
    await unpublish('dite');
  } catch (error) {
    await sleep(5000);
    unpublishAll();
  }
}

(async () => {
  await unpublishAll();
})();
