import { describe, expect, it } from 'vitest';
import type { DiteUserConfig } from '../../../src/node/core/config';
import {
  defineConfig,
  generateConfig,
  loadConfigFromFile,
  readConfig,
  resolveConfig,
  resolveUserConfig,
} from '../../../src/node/core/config';
import { ServerMode } from '../../../src/node/core/config/server-mode';
import { TEST_FIXTURES_ROOT } from '../../utils/constants';

import path from 'node:path';

describe('src/config', () => {
  const config = {
    port: 3001,
  };

  const configPath = path.resolve(TEST_FIXTURES_ROOT, 'config');

  describe('defineConfig', () => {
    it('should return define config', () => {
      expect(defineConfig(config)).toEqual(config);
    });
  });

  describe('loadConfigFromFile', () => {
    it('should return config', async () => {
      const config = await loadConfigFromFile(configPath);
      expect(config).toBeDefined();
      expect(config?.path).toEqual(path.join(configPath, '.diterc.ts'));
      expect(config?.config).toMatchObject({
        port: 3001,
      });
    });

    it('should return null if no config file found', async () => {
      const config = await loadConfigFromFile(process.cwd());
      expect(config).toBeNull();
    });
  });

  describe('resolveUserConfig', () => {
    it('resolveUserConfig should be success', async () => {
      const userConfig = await resolveUserConfig({
        root: configPath,
        mode: ServerMode.Development,
      });
      expect(userConfig).toBeDefined();
      expect(userConfig?.config).toMatchObject(config);
    });
  });

  describe('resolveConfig', () => {
    it('should be success', async () => {
      const config = await resolveConfig({
        root: configPath,
        mode: ServerMode.Development,
      });
      expect(config).toBeDefined();
      expect(config.port).toEqual(3001);
      expect(config).toMatchObject({
        root: configPath,
        serverBuildPath: path.join(configPath, '.dite/server/index.js'),
        port: 3001,
        buildPath: '.dite',
      });
    });
  });

  describe('generateConfig', () => {
    it('should be success', async () => {
      const userConfig: DiteUserConfig = {
        serverBuildPath: path.join(process.cwd(), 'dist/server'),
      };
      const root = process.cwd();
      expect(
        generateConfig(
          { config: userConfig, path: root, dependencies: [] },
          { root, mode: ServerMode.Production },
        ),
      ).toMatchObject({
        port: 3001,
        serverBuildPath: userConfig.serverBuildPath,
      });
    });
  });

  describe('readConfig', () => {
    let config;
    it('should be success', async () => {
      config = await resolveConfig({
        root: configPath,
        mode: ServerMode.Development,
      });

      expect(config).toMatchObject({
        root: configPath,
        serverBuildPath: path.join(configPath, '.dite/server/index.js'),
        port: 3001,
        buildPath: '.dite',
      });

      process.env.DITE_ROOT = configPath;

      config = readConfig();

      expect(config).toMatchObject({
        root: configPath,
        serverBuildPath: path.join(configPath, '.dite/server/index.js'),
        port: 3001,
        buildPath: '.dite',
      });
    });

    it('should throw error if invalid server mode', async () => {
      await expect(
        resolveConfig({
          root: configPath,
          mode: 'invalid' as any,
        }),
      ).rejects.toThrowError();
    });
  });
});
