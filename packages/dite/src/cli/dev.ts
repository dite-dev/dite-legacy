import { DiteConfig, resolveConfig, ServerMode } from '@dite/core/config';
import { logger, Mustache } from '@dite/utils';
import swc from '@swc/core';
import type { FSWatcher, WatchOptions } from 'chokidar';
import chokidar from 'chokidar';
import spawn from 'cross-spawn';
import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { templateDir } from '../node/constants';
// import { exitHook, logger } from '@dite/utils';
// import { watch } from './watch';

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
    mode: ServerMode.Development,
  });
  const serverRoot = path.join(config.root, 'server');
  const outputDir = path.join(config.root, config.buildPath, 'dist/server');

  async function writeServerBuildResult(
    outputFiles: esbuild.OutputFile[] = [],
  ) {
    if (!outputFiles) return;

    for (const file of outputFiles) {
      fs.mkdirSync(path.dirname(file.path), { recursive: true });
      if (file.path.endsWith('.js')) {
        // if (mode === 'development') {
        //   delete __require.cache[file.path];
        // }
        // fix sourceMappingURL to be relative to current path instead of /build
        const filename = file.path.substring(
          file.path.lastIndexOf(path.sep) + 1,
        );
        const escapedFilename = filename.replace(/\./g, '\\.');
        const pattern = `(//# sourceMappingURL=)(.*)${escapedFilename}`;
        let contents = Buffer.from(file.contents).toString('utf-8');
        contents = contents.replace(new RegExp(pattern), `$1${filename}`);
        fs.writeFileSync(file.path, contents, 'utf-8');
      } else if (file.path.endsWith('.map')) {
        // remove route: prefix from source filenames so breakpoints work
        let contents = Buffer.from(file.contents).toString('utf-8');
        contents = contents.replace(/"route:/gm, '"');
        fs.writeFileSync(file.path, contents, 'utf-8');
      } else {
        fs.mkdirSync(path.dirname(file.path), { recursive: true });
        fs.writeFileSync(file.path, file.contents, 'utf-8');
      }
    }
  }

  async function swcTransformContent(
    source: string,
    { isTs }: { isTs?: boolean } = {},
  ) {
    return await swc.transform(source, {
      jsc: {
        parser: {
          syntax: isTs ? 'typescript' : 'ecmascript',
          decorators: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
        keepClassNames: true,
        target: 'es2020',
      },
      sourceMaps: false,
      // sourceMaps: config.mode === 'development',
      configFile: false,
      swcrc: false,
      module: {
        type: 'commonjs',
        strict: true,
      },
    });
  }

  async function swcTransformFile(file: string) {
    const filePath = path.join(serverRoot, file);
    const source = await fs.promises.readFile(filePath, 'utf-8');
    const isTs = /\.tsx?$/.test(file);
    const { code } = await swcTransformContent(source, { isTs });
    const output: esbuild.OutputFile = {
      path: path.join(
        outputDir,
        `${path.dirname(file)}/${path.basename(file)}.js`,
      ),
      contents: Buffer.from(code, 'utf-8'),
      text: '',
    };
    return output;
  }

  async function generateServerEntry() {
    const localeTpl = await fs.promises.readFile(
      path.join(templateDir, 'server/main.ts.mustache'),
      'utf-8',
    );
    const entryPath = path.join(
      config.root,
      config.buildPath,
      'dist/server.js',
    );
    await fs.promises.mkdir(path.dirname(entryPath), { recursive: true });
    const entryContent = Mustache.render(localeTpl, {
      config: JSON.stringify(config),
      serverPath: path.join(config.root, 'server/index.ts'),
    });
    const { code } = await swcTransformContent(entryContent, {
      isTs: true,
    });
    await fs.promises.writeFile(
      path.join(config.root, config.buildPath, 'server.cts'),
      entryContent,
    );
    await fs.promises.writeFile(entryPath, code, 'utf-8');
  }

  const now = Date.now();
  async function initialServerBuild() {
    // await Promise.all([
    //   glob('**/*.(jsx|tsx|js|ts)', {
    //     onlyFiles: true,
    //     cwd: serverRoot,
    //   }).then((files) =>
    //     Promise.all(files.map(swcTransformFile)).then((o) =>
    //       writeServerBuildResult(o),
    //     ),
    //   ),
    await generateServerEntry();
    // ]);
    spawn('node', [' -r @dite/core/swc-register ./bootstrap.ts'], {
      env: process.env,
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
      shell: true,
      cwd: path.join(config.root, 'server'),
    });
  }

  await initialServerBuild();
  console.log(`initialServerBuild done ${Date.now() - now}ms`);

  const resolvedWatchOptions = resolveChokidarOptions({
    disableGlobbing: true,
  });

  const watcher = chokidar.watch(
    path.resolve(path.join(config.root, 'server')),
    resolvedWatchOptions,
  ) as FSWatcher;

  watcher.on('change', async (file) => {
    logger.info(`File ${file} has been changed`);
  });

  watcher.on('add', (file) => {
    logger.info(`File ${file} has been added`);
    // handleFileAddUnlink(normalizePath(file), server)
  });

  watcher.on('unlink', (file) => {
    logger.info(`File ${file} has been removed`);
  });
  console.log('1111');

  return new Promise((resolve) => {});
}
