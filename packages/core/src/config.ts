import { bundleRequire } from 'bundle-require';
import { existsSync } from 'fs';
import { isAbsolute, join } from 'path';
import type { DiteConfig, DiteUserConfig } from './types';

import { configFiles } from './shared/constants';

export type {
  DiteAdapter,
  DiteConfig,
  DiteIntegration,
  DiteUserConfig,
} from './types';

const defaultConfig: DiteConfig = {
  root: process.cwd!(),
  serverBuildPath: '',
  port: 3001,
  buildPath: '.dite',
};

export function defineConfig(config: DiteUserConfig): DiteUserConfig {
  return config;
}

export async function resolveConfig(opts: {
  root: string;
  command: 'serve' | 'build';
  mode: 'development' | 'production';
}) {
  const userConfig = await resolveUserConfig(opts);
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

export async function resolveUserConfig(opts: {
  root: string;
  command: 'serve' | 'build';
  mode: 'development' | 'production';
}) {
  const { root } = opts;
  return await loadConfigFromFile(root);
}
