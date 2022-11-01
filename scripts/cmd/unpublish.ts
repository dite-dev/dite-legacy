import 'zx/globals';
// @ts-expect-error
import { version as latestVersion } from '../../lerna.json';

const excludesVersions = [
  '0.0.1-security',
  '0.1.26',
  '0.1.28',
  '0.1.29',
  latestVersion,
];

const deprecates: string[] = [];

async function unpublish(pkgName: string) {
  $.verbose = false;
  const versions: string[] = eval(
    (await $`npm view ${pkgName} versions`).stdout,
  ).filter(
    (v: string) =>
      !excludesVersions.includes(v) && !deprecates.includes(`${pkgName}@${v}`),
  );
  $.verbose = true;

  for (const version of versions) {
    console.log(
      `will execute: npm unpublish ${chalk.blue(pkgName)}@${chalk.cyan(
        version,
      )} --force`,
    );
    const pkgVersion = `${pkgName}@${version}`;
    deprecates.push(pkgVersion);
    await $`npm unpublish ${pkgVersion} --force`;
    await sleep(2000);
  }
}

async function unpublishs(...pkgNames: string[]) {
  $.verbose = false;
  const versions = (
    await Promise.all(
      pkgNames.map(async (pkgName) => {
        const v: string[] = eval(
          (await $`npm view ${pkgName} versions`).stdout,
        );
        return v
          .filter(
            (v: string) =>
              !excludesVersions.includes(v) &&
              !deprecates.includes(`${pkgName}@${v}`),
          )
          .map((version: string) => `${pkgName}@${version}`);
      }),
    )
  ).flat();
  $.verbose = true;

  console.log(versions);
  // for (const version of versions) {
  //   console.log(
  //     `will execute: npm unpublish ${chalk.blue(pkgName)}@${chalk.cyan(
  //       version,
  //     )} --force`,
  //   );
  //   const pkgVersion = `${pkgName}@${version}`;
  //   deprecates.add(pkgVersion);
  //   await $`npm unpublish ${pkgVersion} --force`;
  //   await sleep(2000);
  // }
  $.verbose = false;
  await Promise.all(
    versions.map(async (version) => {
      try {
        await $`npm unpublish ${version}`;
        console.log(version);
      } catch (error) {
        deprecates.push(version);
      }
    }),
  );
  $.verbose = true;
  console.log(deprecates);
}

async function unpublishAll() {
  try {
    // await unpublish('dite');
    // await unpublish('@dite/nest');
    // await unpublish('@dite/react');
    // await unpublish('dite');
    await unpublishs(
      'dite',
      '@dite/nest',
      '@dite/node',
      '@dite/utils',
      '@dite/core',
      '@dite/react',
      '@dite/vue',
    );
  } catch (error) {
    await sleep(5000);
    unpublishAll();
  }
}

(async () => {
  await unpublishAll();
})();
