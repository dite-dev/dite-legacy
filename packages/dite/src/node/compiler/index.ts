import chokidar from 'chokidar';
import esbuild from 'esbuild';
import fs from 'fs-extra';
import debounce from 'lodash.debounce';
import { dirname, join, sep } from 'path';
import { DiteConfig } from '../config';
import { swcPlugin } from './swc';

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

export function createServerBuild(
  config: DiteConfig,
  { mode, incremental }: Required<BuildOptions> & { incremental?: boolean },
) {
  // auto externalize node_modules
  const pkg = fs.readJSONSync(join(config.root, 'package.json'));
  const entryPath = join(config.root, config.buildPath, 'src/index.ts');
  fs.ensureDirSync(dirname(entryPath));
  fs.writeFileSync(
    entryPath,
    `
import { createServer } from '${join(config.root, 'server/index.ts')}';\

function getMemoryUsage() {
  const size = 1 << 20;
  const used = process.memoryUsage().heapUsed / size;
  const rss = process.memoryUsage().rss / size;
  return \`Memory Usage: \${Math.round(used * 100) / 100} MB (RSS: \${
    Math.round(rss * 100) / 100
  } MB)\`;
}

const config = ${JSON.stringify(config)};\
(async () => { \
 await createServer({ config }); \
 console.info(getMemoryUsage()); \
})(); \
`,
  );

  return esbuild
    .build({
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
    })
    .then(async (build) => {
      await writeServerBuildResult(config, { mode }, build.outputFiles);
      return build;
    });
}

export function createBrowserBuild(
  config: DiteConfig,
  { mode, incremental }: Required<BuildOptions> & { incremental?: boolean },
) {
  return esbuild.build({
    absWorkingDir: config.root,
    entryPoints: { index: 'app/root.tsx' },
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
    mode = 'production',
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
        delete require.cache[file.path];
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
