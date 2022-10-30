import { DiteConfig, resolveConfig } from '@dite/core/config';
import { exitHook, logger } from '@dite/utils';
import type { WatchOptions } from 'chokidar';
import { watch } from './watch';

export async function createDevServer(config: DiteConfig) {
  // logger.debug('dite createDevServer', { config: JSON.stringify(config) });
  // const closeWatcher = await watch(config);
  // logger.debug('dite createDevServer closeWatcher');
  // let resolve: () => void;
  // exitHook(() => {
  //   closeWatcher();
  //   resolve();
  // });
  // return new Promise<void>((r) => {
  //   resolve = r;
  // }).then(async () => {
  //   await closeWatcher();
  // });
}

export function resolveChokidarOptions(opts?: WatchOptions) {
  const { ignored = [], ...otherOptions } = opts ?? {};
  const resolvedChokidarOptions: WatchOptions = {
    ignored: [
      '**/.git/**',
      '**/node_modules/**',
      '**/test-results/**',
      ...(Array.isArray(ignored) ? ignored : [ignored]),
    ],
    ignoreInitial: true,
    ignorePermissionErrors: true,
    ...otherOptions,
  };

  return resolvedChokidarOptions;
}

async function rebuildServer() {}

export async function dev(root: string) {
  const config = resolveConfig({
    root,
    mode: 'development',
  });
  //   const serverRoot = path.join(config.root, 'server');
  //   const outputDir = path.join(config.root, config.buildPath, 'dist/server');

  //   async function generateServerEntry() {
  //     const localeTpl = await fs.promises.readFile(
  //       path.join(templateDir, 'server/main.ts.mustache'),
  //       'utf-8',
  //     );
  //     const entryPath = path.join(
  //       config.root,
  //       config.buildPath,
  //       'dist/server.js',
  //     );
  //     await fs.promises.mkdir(path.dirname(entryPath), { recursive: true });
  //     const entryContent = Mustache.render(localeTpl, {
  //       config: JSON.stringify(config),
  //       serverPath: path.join(config.root, 'server/index'),
  //     });
  //     await fs.promises.writeFile(
  //       path.join(config.root, config.buildPath, 'server.ts'),
  //       entryContent,
  //     );
  //     const pkg = require(path.join(config.root, 'package.json'));

  //     const build = await esbuild.build({
  //       entryPoints: [path.join(config.root, config.buildPath, 'server.ts')],
  //       outfile: config.serverBuildPath,
  //       minifySyntax: true,
  //       jsx: 'automatic',
  //       sourceRoot: config.root,
  //       write: true,
  //       format: 'cjs',
  //       minify: false,
  //       platform: 'node',
  //       target: 'es2020',
  //       bundle: true,
  //       mainFields: ['module', 'main'],
  //       splitting: false,
  //       plugins: [tscPlugin(config)],
  //       keepNames: true,
  //       sourcemap: true,
  //       incremental: true,
  //       treeShaking: true,
  //       external: [
  //         'source-map-support',
  //         ...Object.keys(pkg.dependencies || {}),
  //         ...Object.keys(pkg.devDependencies || {}),
  //       ].filter((dep) => !dep.startsWith('@dite/')),
  //     });
  //   }

  //   const now = Date.now();
  //   async function initialServerBuild() {
  //     // await Promise.all([
  //     //   glob('**/*.(jsx|tsx|js|ts)', {
  //     //     onlyFiles: true,
  //     //     cwd: serverRoot,
  //     //   }).then((files) =>
  //     //     Promise.all(files.map(swcTransformFile)).then((o) =>
  //     //       writeServerBuildResult(o),
  //     //     ),
  //     //   ),
  //     await generateServerEntry();
  //     // ]);
  //     // spawn('node', [' -r @dite/core/swc-register ./bootstrap.ts'], {
  //     //   env: process.env,
  //     //   stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
  //     //   shell: true,
  //     //   cwd: path.join(config.root, 'server'),
  //     // });
  //   }

  //   await initialServerBuild();
  //   console.log(`initialServerBuild done ${Date.now() - now}ms`);

  //   const resolvedWatchOptions = resolveChokidarOptions({
  //     disableGlobbing: true,
  //   });

  //   const watcher = chokidar.watch(
  //     path.resolve(path.join(config.root, 'server')),
  //     resolvedWatchOptions,
  //   ) as FSWatcher;

  //   watcher.on('change', async (file) => {
  //     logger.info(`File ${file} has been changed`);
  //   });

  //   watcher.on('add', (file) => {
  //     logger.info(`File ${file} has been added`);
  //     // handleFileAddUnlink(normalizePath(file), server)
  //   });

  //   watcher.on('unlink', (file) => {
  //     logger.info(`File ${file} has been removed`);
  //   });
  //   console.log('1111');

  //   return new Promise((resolve) => {});
  const closeWatcher = await watch(config);
  logger.debug('dite createDevServer closeWatcher');
  let resolve: () => void;
  exitHook(() => {
    closeWatcher();
    resolve();
  });
  return new Promise<void>((r) => {
    resolve = r;
  }).then(async () => {
    await closeWatcher();
  });
}
