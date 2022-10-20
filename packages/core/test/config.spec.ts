import { describe, expect, it } from 'vitest';
import type { DiteUserConfig } from '../src/config';
import {
  defineConfig,
  generateConfig,
  loadConfigFromFile,
  readConfig,
  resolveConfig,
  resolveUserConfig,
} from '../src/config';
import { ServerMode } from '../src/config/server-mode';

import path from 'path';

describe('src/config', () => {
  const config = {
    port: 3001,
  };

  const configPath = path.join(__dirname, './fixtures/config');

  describe('defineConfig', () => {
    it('should return the config', () => {
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
      const config2 = await loadConfigFromFile(__dirname);
      expect(config2).toBeNull();
    });
  });

  describe('resolveUserConfig', () => {
    it('should be success', async () => {
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
      config = await readConfig(configPath);

      expect(config).toMatchObject({
        root: configPath,
        serverBuildPath: path.join(configPath, '.dite/server/index.js'),
        port: 3001,
        buildPath: '.dite',
      });

      process.env.DITE_ROOT = configPath;

      config = await readConfig();

      expect(config).toMatchObject({
        root: configPath,
        serverBuildPath: path.join(configPath, '.dite/server/index.js'),
        port: 3001,
        buildPath: '.dite',
      });
    });

    it('should throw error if invalid server mode', async () => {
      await expect(
        readConfig(configPath, 'invalid' as any),
      ).rejects.toThrowError();
    });
  });
});
