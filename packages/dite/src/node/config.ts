import { bundleRequire } from 'bundle-require';
import { existsSync } from 'fs';
import { isAbsolute, join } from 'path';
import type { DiteConfig, DiteUserConfig } from '../shared/types';
import { isValidServerMode, ServerMode } from './config/server-mode';

import { configFiles } from '../shared/constants/config';

export type {
  DiteAdapter,
  DiteConfig,
  DiteIntegration,
  DiteUserConfig,
} from '../shared/types';

interface ResolveConfigOptions {
  root: string;
  mode: ServerMode;
}

const defaultConfig: DiteConfig = {
  root: process.cwd!(),
  serverBuildPath: '',
  port: 3001,
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
  console.log('filepath', filepath);
  if (filepath) {
    const config = await bundleRequire({ filepath, format: 'esm' });
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

export async function readConfig(
  diteRoot?: string,
  serverMode = ServerMode.Production,
) {
  if (!diteRoot) {
    diteRoot = process.env.DITE_ROOT || process.cwd!();
  }

  if (!isValidServerMode(serverMode)) {
    throw new Error(`Invalid server mode "${serverMode}"`);
  }

  return resolveConfig({ root: diteRoot, mode: serverMode });
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
  const userConfig = await resolveUserConfig(opts);
  return generateConfig(userConfig, opts);
}
