import chokidar from 'chokidar';
import esbuild from 'esbuild';
import fs from 'fs-extra';
import { dirname, join, sep } from 'path';
import { DiteConfig } from '../config';

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
  console.log('config', config);
  try {
    const serverBuildPromise = createServerBuild(config, options);
    const browserBuildPromise = createBrowserBuild(config, options);

    return await Promise.all([serverBuildPromise, browserBuildPromise]);
  } catch (e) {
    console.log('e', e);
    return [undefined, undefined];
  }
}

interface BuildConfig {
  mode: 'development' | 'production';
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
    mode = 'development',
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
  console.log('mode', mode);
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

  const rebuildEverything = async () => {
    if (onRebuildStart) onRebuildStart();
    console.log('rebuild all', serverBuild?.rebuild);
    if (!serverBuild?.rebuild) {
      return;
    }
    console.log('all1');
    await Promise.all([
      serverBuild
        .rebuild()
        .then((build) => writeServerBuildResult(config, build.outputFiles!)),
    ]);
    console.log('all');
    if (onRebuildFinish) onRebuildFinish();
  };

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
      console.log('change', file);
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

export function createServerBuild(
  config: DiteConfig,
  options: Required<BuildOptions> & { incremental?: boolean },
) {
  return esbuild
    .build({
      absWorkingDir: config.root,
      entryPoints: { index: 'server/main.ts' },
      outfile: config.serverBuildPath,
      minifySyntax: true,
      jsx: 'automatic',
      write: false,
      format: 'cjs',
      minify: options.mode === 'production',
      platform: 'node',
      bundle: true,
      mainFields: ['browser', 'module', 'main'],
      // splitting: true,
      keepNames: true,
      incremental: options.incremental,
      treeShaking: true,
      external: [
        '@nestjs/microservices',
        'class-transformer',
        'cache-manager',
        'class-validator',
        '@nestjs/websockets',
        '@nestjs/core',
        '@nestjs/common',
      ],
    })
    .then(async (build) => {
      await writeServerBuildResult(config, build.outputFiles);
      return build;
    });
}

export function createBrowserBuild(
  config: DiteConfig,
  options: Required<BuildOptions> & { incremental?: boolean },
) {
  return esbuild.build({
    absWorkingDir: config.root,
    entryPoints: { index: 'app/root.tsx' },
    outdir: join(config.root, config.buildPath, 'browser'),
    minifySyntax: true,
    jsx: 'automatic',
    format: 'esm',
    minify: options.mode === 'production',
    platform: 'browser',
    bundle: true,
    metafile: true,
    incremental: options.incremental,
    entryNames: '[dir]/[name]-[hash]',
    chunkNames: '_shared/[name]-[hash]',
    assetNames: '_assets/[name]-[hash]',
    mainFields: ['browser', 'module', 'main'],
    splitting: true,
    jsxDev: options.mode !== 'production',
    keepNames: true,
    treeShaking: true,
  });
}

export async function build(
  config: DiteConfig,
  {
    mode = 'production',
    onWarning = defaultWarningHandler,
    onBuildFailure = defaultBuildFailureHandler,
  }: BuildOptions = {},
) {
  return esbuild
    .build({
      absWorkingDir: config.root,
      entryPoints: { index: 'server/main.ts' },
      outfile: config.serverBuildPath,
      minifySyntax: true,
      jsx: 'automatic',
      write: false,
      format: 'cjs',
      minify: mode === 'production',
      platform: 'node',
      bundle: true,
      mainFields: ['browser', 'module', 'main'],
      // splitting: true,
      keepNames: true,
      treeShaking: true,
      external: [
        '@nestjs/microservices',
        'class-transformer',
        'cache-manager',
        'class-validator',
        '@nestjs/websockets',
        '@nestjs/core',
        '@nestjs/common',
      ],
    })
    .then(async (build) => {
      await writeServerBuildResult(config, build.outputFiles);
      return build;
    });
}

export async function writeServerBuildResult(
  config: DiteConfig,
  outputFiles: esbuild.OutputFile[],
) {
  if (!outputFiles) return;
  await fs.ensureDir(dirname(config.serverBuildPath));
  for (const file of outputFiles) {
    await fs.ensureDir(dirname(file.path));
    if (file.path.endsWith('.js')) {
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
