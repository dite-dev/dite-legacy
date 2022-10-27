import esbuild from 'esbuild';
import { existsSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { isValidServerMode, ServerMode } from './config/server-mode';
import type { DiteConfig, DiteUserConfig } from './config/types';
import { configFiles } from './constants';
import * as register from './utils/register';

interface ResolveConfigOptions {
  root: string;
  mode: ServerMode;
}

const defaultConfig: DiteConfig = {
  root: process.cwd!(),
  serverBuildPath: '',
  port: 3001,
  mode: ServerMode.Production,
  buildPath: '.dite',
};

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
    register.register({
      implementor: esbuild,
    });
    register.clearFiles();
    const config = register.__require(filepath);
    for (const file of register.getFiles()) {
      delete require.cache[file];
    }
    register.restore();
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
  const now = Date.now();
  const config = resolveConfig({
    root: process.env.DITE_ROOT || (process.cwd() as string),
    mode: ServerMode.Production,
  });
  console.log(`[dite] config loaded in ${Date.now() - now}ms`);
  return config;
}

export function generateConfig(
  userConfig: Awaited<ReturnType<typeof resolveUserConfig>>,
  opts: ResolveConfigOptions,
) {
  const config: DiteConfig = Object.assign(
    {},
    defaultConfig,
    userConfig?.config ?? {},
  );
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
