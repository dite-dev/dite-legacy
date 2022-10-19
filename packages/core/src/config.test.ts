import { describe, expect, test, it } from 'vitest'
import { defineConfig, resolveUserConfig, resolveConfig, loadConfigFromFile, DiteConfig } from './config'
import path from 'path'

describe('config', () => {
  const config = {
    port: 3001,
  }

  const configPath = path.join(__dirname, '../test/fixtures/config')

  test('defineConfig', () => {
    expect(defineConfig(config)).toEqual(config)
  })

  test('load file', async () => {
    const config = await loadConfigFromFile(configPath)
    expect(config).toBeDefined()
    expect(config?.path).toEqual(path.join(configPath, '.diterc.ts'))
    expect(config?.config).toMatchObject({
      port: 3001,
    })

    const config2 = await loadConfigFromFile(__dirname)
    expect(config2).toBeNull()
  })

  test('load user config', async () => {
    const userConfig = await resolveUserConfig({
      root: configPath,
      command: 'serve',
      mode: 'development',
    })
    expect(userConfig).toBeDefined()
    expect(userConfig?.config.port).toEqual(3001)
    expect(userConfig?.config).toMatchObject(config)

    const userConfig2 = await resolveConfig({
      root: configPath,
      command: 'serve',
      mode: 'development',
    })
    expect(userConfig2).toBeDefined()
    expect(userConfig2.port).toEqual(3001)
    expect(userConfig2).toMatchObject({
      root: configPath,
      serverBuildPath: path.join(configPath, '.dite/server/index.js'),
      port: 3001,
      buildPath: '.dite'
    })
  })

  test('load config', async () => {
    const config = await resolveConfig({
      root: configPath,
      command: 'serve',
      mode: 'development',
    })
    expect(config).toBeDefined()
    expect(config.port).toEqual(3001)
    expect(config).toMatchObject({
      root: configPath,
      serverBuildPath: path.join(configPath, '.dite/server/index.js'),
      port: 3001,
      buildPath: '.dite'
    })
  })
})
