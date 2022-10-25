import chokidar from 'chokidar';
import esbuild from 'esbuild';
import fs from 'fs-extra';
import { debounce } from 'lodash-es';
import { createRequire } from 'module';
import Mustache from 'mustache';
import { dirname, join, sep } from 'node:path';
import type { DiteConfig } from '../../shared/types';
import { templateDir } from '../constants';
import { ServerMode } from '../core/config/server-mode';
import { logger } from '../shared/logger';
import { swcPlugin } from './swc';

const __require = createRequire(import.meta.url);

function defaultWarningHandler(message: string, key: string) {
  console.log(message, key);
}

export type BuildError = Error | esbuild.BuildFailure;

function defaultBuildFailureHandler(failure: BuildError) {
  console.log(failure);
}

async function buildEverything(
  config: DiteConfig,
  options: Required<BuildOptions> & { incremental?: boolean },
): Promise<(esbuild.BuildResult | undefined)[]> {
  try {
    logger.debug('config', config);
    const serverBuildPromise = createServerBuild(config, options);
    const browserBuildPromise = createBrowserBuild(config, options);

    return await Promise.all([serverBuildPromise, browserBuildPromise]);
  } catch (e) {
    logger.error('e', e);
    return [undefined, undefined];
  }
}

interface BuildConfig {
  mode: ServerMode;
}

interface BuildOptions extends Partial<BuildConfig> {
  onWarning?(message: string, key: string): void;

  onBuildFailure?(failure: Error | esbuild.BuildFailure): void;
}

interface WatchOptions extends BuildOptions {
  onRebuildStart?(): void;
  onRebuildFinish?(): void;
  onFileCreated?(file: string): void;
  onFileChanged?(file: string): void;
  onFileDeleted?(file: string): void;
  onInitialBuild?(): void;
}

export async function watch(
  config: DiteConfig,
  {
    mode = ServerMode.Development,
    onFileChanged,
    onFileCreated,
    onFileDeleted,
    onInitialBuild,
    onRebuildFinish,
    onRebuildStart,
    onWarning = defaultWarningHandler,
    onBuildFailure = defaultBuildFailureHandler,
  }: WatchOptions = {},
) {
  const toWatch = [join(config.root, 'server')];
  const options = {
    mode,
    onWarning,
    onBuildFailure,
    incremental: true,
  };
  let [serverBuild, browserBuild] = await buildEverything(config, options);

  const initialBuildComplete = !!browserBuild && !!serverBuild;
  if (initialBuildComplete && onInitialBuild) {
    onInitialBuild();
  }

  function disposeBuilders() {
    browserBuild?.rebuild?.dispose();
    serverBuild?.rebuild?.dispose();
    browserBuild = undefined;
    serverBuild = undefined;
  }

  const rebuildEverything = debounce(async () => {
    if (onRebuildStart) onRebuildStart();
    if (!serverBuild?.rebuild) {
      disposeBuilders();
      return;
    }
    await Promise.all([
      serverBuild
        .rebuild()
        .then((build) =>
          writeServerBuildResult(config, { mode }, build.outputFiles!),
        ),
    ]);
    if (onRebuildFinish) onRebuildFinish();
  }, 500);

  const watcher = chokidar
    .watch(toWatch, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 100,
      },
    })
    .on('error', (error) => console.error(error))
    .on('change', async (file) => {
      if (onFileChanged) onFileChanged(file);
      await rebuildEverything();
    })
    .on('add', async (file) => {
      if (onFileCreated) onFileCreated(file);
      await rebuildEverything();
    })
    .on('unlink', async (file) => {
      if (onFileDeleted) onFileDeleted(file);
      await rebuildEverything();
    });

  return async () => {
    await watcher.close().catch(() => {});
    disposeBuilders();
  };
}

export async function createServerBuild(
  config: DiteConfig,
  { mode, incremental }: Required<BuildOptions> & { incremental?: boolean },
) {
  // auto externalize node_modules
  const pkg = fs.readJSONSync(join(config.root, 'package.json'));
  const localeTpl = fs.readFileSync(
    join(templateDir, 'server/main.ts.mustache'),
    'utf-8',
  );
  const entryPath = join(config.root, config.buildPath, 'src/server.ts');
  fs.ensureDirSync(dirname(entryPath));
  const entryContent = Mustache.render(localeTpl, {
    config: JSON.stringify(config),
    serverPath: join(config.root, 'server/index.ts'),
  });
  fs.writeFileSync(entryPath, entryContent);

  const build = await esbuild.build({
    absWorkingDir: join(config.root, 'server'),
    entryPoints: [entryPath],
    outfile: config.serverBuildPath,
    minifySyntax: true,
    jsx: 'automatic',
    sourceRoot: config.root,
    write: false,
    format: 'cjs',
    minify: mode === 'production',
    platform: 'node',
    bundle: true,
    mainFields: ['browser', 'module', 'main'],
    splitting: false,
    plugins: [swcPlugin()],
    keepNames: true,
    sourcemap: true,
    incremental,
    treeShaking: true,
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ],
  });
  await writeServerBuildResult(config, { mode }, build.outputFiles);
  return build;
}

export function createBrowserBuild(
  config: DiteConfig,
  { mode, incremental }: Required<BuildOptions> & { incremental?: boolean },
) {
  return esbuild.build({
    absWorkingDir: config.root,
    entryPoints: { index: 'src/root.tsx' },
    outdir: join(config.root, config.buildPath, 'browser'),
    minifySyntax: true,
    jsx: 'automatic',
    format: 'esm',
    minify: mode === 'production',
    platform: 'browser',
    bundle: true,
    metafile: true,
    incremental,
    entryNames: '[dir]/[name]-[hash]',
    chunkNames: '_shared/[name]-[hash]',
    assetNames: '_assets/[name]-[hash]',
    mainFields: ['browser', 'module', 'main'],
    splitting: true,
    jsxDev: mode !== 'production',
    keepNames: true,
    treeShaking: true,
  });
}

export async function build(
  config: DiteConfig,
  {
    mode = ServerMode.Production,
    onWarning = defaultWarningHandler,
    onBuildFailure = defaultBuildFailureHandler,
  }: BuildOptions = {},
) {
  const options = {
    mode,
    onWarning,
    onBuildFailure,
  };
  return buildEverything(config, options);
}

export async function writeServerBuildResult(
  config: DiteConfig,
  { mode }: BuildConfig,
  outputFiles: esbuild.OutputFile[] = [],
) {
  if (!outputFiles) return;

  await fs.ensureDir(dirname(config.serverBuildPath));
  for (const file of outputFiles) {
    await fs.ensureDir(dirname(file.path));
    if (file.path.endsWith('.js')) {
      if (mode === 'development') {
        delete __require.cache[file.path];
      }
      // fix sourceMappingURL to be relative to current path instead of /build
      const filename = file.path.substring(file.path.lastIndexOf(sep) + 1);
      const escapedFilename = filename.replace(/\./g, '\\.');
      const pattern = `(//# sourceMappingURL=)(.*)${escapedFilename}`;
      let contents = Buffer.from(file.contents).toString('utf-8');
      contents = contents.replace(new RegExp(pattern), `$1${filename}`);
      await fs.writeFile(file.path, contents);
    } else if (file.path.endsWith('.map')) {
      // remove route: prefix from source filenames so breakpoints work
      let contents = Buffer.from(file.contents).toString('utf-8');
      contents = contents.replace(/"route:/gm, '"');
      await fs.writeFile(file.path, contents);
    } else {
      await fs.ensureDir(dirname(file.path));
      await fs.writeFile(file.path, file.contents);
    }
  }
}
