// import { fse, lodash, register } from '@dite/utils';
// import fse from 'fs-extra'
// import lodash from 'lodash'
// import esbuild from 'esbuild';
// import { configFiles } from '../../shared/constants';
// import { getAbsFiles } from './utils';

export interface DiteConfig {
  port: number;
  // dir: string
  // version: string
}

export function defineConfig(
  options: Partial<DiteConfig>,
): Partial<DiteConfig> {
  const config: DiteConfig = {
    port: 3001,
    // dir: '.',
    // version: '',
    ...options,
  };
  return config as DiteConfig;
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
//     config: config as DiteConfig,
//     files,
//   };
// }
//
// export function loadConfig(): Promise<DiteConfig> {
//   const { config } = getUserConfig(
//     getAbsFiles({
//       files: configFiles,
//       cwd: process.cwd(),
//     }),
//   );
//   return Promise.resolve(config);
// }
