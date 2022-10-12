import { bundleRequire } from 'bundle-require';
import { existsSync } from 'fs';
import { join } from 'path';

import { configFiles } from '../../shared/constants';

export interface IConfig {
  port: number;
  serverBuildPath: string;
  buildPath: string;
  root: string;
  // dir: string
  // version: string
}

export function defineConfig(options: Partial<IConfig>): Partial<IConfig> {
  const config: Partial<IConfig> = {
    port: 3001,
    // dir: '.',
    // version: '',
    ...options,
  };
  return config as IConfig;
}

// function getUserConfig(configFiles: string[]) {
//   let config = {};
//   const files: string[] = [];
//
//   for (const configFile of configFiles) {
//     if (fse.existsSync(configFile)) {
//       register.register({
//         implementor: esbuild,
//       });
//       register.clearFiles();
//       config = lodash.merge(config, require(configFile).default);
//       for (const file of register.getFiles()) {
//         delete require.cache[file];
//       }
//       // includes the config File
//       files.push(...register.getFiles());
//       register.restore();
//     } else {
//       files.push(configFile);
//     }
//   }
//   return {
//     config: config as IConfig,
//     files,
//   };
// }
//
// export function loadConfig(): Promise<IConfig> {
//   const { config } = getUserConfig(
//     getAbsFiles({
//       files: configFiles,
//       cwd: process.cwd(),
//     }),
//   );
//   return Promise.resolve(config);
// }

export async function resolveConfig(opts: {
  root: string;
  command: 'serve' | 'build';
  mode: 'development' | 'production';
}) {
  const userConfig = await resolveUserConfig(opts);
  if (!userConfig) return null;
  const { config } = userConfig;
  config.buildPath = '.dite';
  config.serverBuildPath = join(
    opts.root,
    config.serverBuildPath ?? join(config.buildPath, 'server/index.js'),
  );
  config.root = opts.root;
  return config as IConfig;
}

async function loadConfigFromFile<T = Partial<IConfig>>(
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
  const result = await loadConfigFromFile(root);
  return result;
}
