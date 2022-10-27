import { existsSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { isValidServerMode, ServerMode } from './config/server-mode';
import type { DiteConfig, DiteUserConfig } from './config/types';
import { configFiles } from './constants';
import { bundleRequire } from './utils/bundle-require';

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

export async function loadConfigFromFile<T = Partial<DiteConfig>>(
  cwd: string,
): Promise<{
  path: string;
  config: T;
  dependencies: string[];
} | null> {
  const filepath = configFiles
    .map((configFile) => join(cwd, configFile))
    .find((p) => existsSync(p));
  if (filepath) {
    const config = await bundleRequire({ filepath });
    return {
      path: filepath,
      config: (config.mod.dite || config.mod.default || config.mod) as T,
      dependencies: config.dependencies,
    };
  }
  return null;
}

export async function resolveUserConfig(opts: ResolveConfigOptions) {
  const { root } = opts;
  return await loadConfigFromFile(root);
}

export function readConfig() {
  return (global as any).__dite_config as DiteConfig;
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

export async function resolveConfig(opts: ResolveConfigOptions) {
  const { mode, root } = opts;
  let diteRoot = root;
  if (!diteRoot) {
    diteRoot = process.env.DITE_ROOT || process.cwd!();
    process.env.DITE_ROOT = diteRoot;
  }

  if (!isValidServerMode(mode)) {
    throw new Error(`Invalid server mode "${mode}"`);
  }

  const userConfig = await resolveUserConfig({
    root: diteRoot,
    mode,
  });
  const config = generateConfig(userConfig, { root: diteRoot, mode });

  (global as any).__dite_config = config;

  return config;
}

export { ServerMode, DiteConfig, DiteUserConfig, isValidServerMode };
