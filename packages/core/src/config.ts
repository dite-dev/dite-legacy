import { existsSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { isValidServerMode, ServerMode } from './config/server-mode';
import type { DiteConfig, DiteUserConfig } from './config/types';
import { configFiles } from './constants';
import dynamicImport from './utils/register';

interface ResolveConfigOptions {
  root: string;
  mode: ServerMode;
}

export function defineConfig(config: DiteUserConfig): DiteUserConfig {
  return config;
}

export function loadConfigFromFile<T = Partial<DiteConfig>>(
  cwd: string,
): {
  path: string;
  config: T;
  dependencies: string[];
} | null {
  const filepath = configFiles
    .map((configFile) => join(cwd, configFile))
    .find((p) => existsSync(p));
  if (filepath) {
    const config = dynamicImport(filepath);
    return {
      path: filepath,
      config: (config.dite || config.default || config) as T,
      dependencies: [],
    };
  }
  return null;
}

export function resolveUserConfig(opts: ResolveConfigOptions) {
  const { root } = opts;
  return loadConfigFromFile(root);
}

export function readConfig() {
  const config = resolveConfig({
    root: process.env.DITE_ROOT || (process.cwd() as string),
    mode: ServerMode.Production,
  });
  return config;
}

export function generateConfig(
  userConfig: Awaited<ReturnType<typeof resolveUserConfig>>,
  opts: ResolveConfigOptions,
) {
  const config: DiteConfig = {
    root: process.cwd!(),
    serverBuildPath: '',
    port: 3001,
    mode: ServerMode.Production,
    buildPath: '.dite',
    server: {
      format: 'cjs',
      outDir: 'server',
      entry: 'server/index.ts',
      outputFile: 'server/index.js',
    },
    ...(userConfig?.config || {}),
  };
  config.serverBuildPath = isAbsolute(config.serverBuildPath)
    ? config.serverBuildPath
    : join(
        opts.root,
        config.serverBuildPath || join(config.buildPath, 'server/index.js'),
      );
  config.root = opts.root;
  return config as DiteConfig;
}

export function resolveConfig(opts: ResolveConfigOptions) {
  const { mode, root } = opts;
  let diteRoot = root;
  if (!diteRoot) {
    diteRoot = process.env.DITE_ROOT || process.cwd!();
    process.env.DITE_ROOT = diteRoot;
  }

  if (!isValidServerMode(mode)) {
    throw new Error(`Invalid server mode "${mode}"`);
  }

  const userConfig = resolveUserConfig({
    root: diteRoot,
    mode,
  });
  const config = generateConfig(userConfig, { root: diteRoot, mode });

  (global as any).__dite_config = config;

  return config;
}

export { ServerMode, DiteConfig, DiteUserConfig, isValidServerMode };
