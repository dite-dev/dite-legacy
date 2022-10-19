import { describe, expect, test } from 'vitest'
import path from 'path'
import { defineConfig, resolveUserConfig } from '../src/config'

describe('config', () => {
  const configPath = path.join(__dirname, './fixtures/config')

  const config = {
    port: 3001,
  }
  test('load config', () => {
    expect(defineConfig(config)).toEqual(config)
  })

  test('load user config', async () => {
    const userConfig = await resolveUserConfig({
      root: configPath,
      command: 'serve',
      mode: 'development',
    })
    expect(userConfig).toBeDefined()
    expect(userConfig?.config).toMatchObject(config)
  })
})
