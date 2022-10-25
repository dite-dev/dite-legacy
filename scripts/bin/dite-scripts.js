#!/usr/bin/env node

import { dirname, join } from 'node:path'
import { existsSync } from 'node:fs'
import { sync } from 'cross-spawn'
import chalk from 'chalk'
import assert from 'assert'
import { fileURLToPath } from 'node:url'

const argv = process.argv.slice(2)
const name = argv[0]

const __dirname = dirname(fileURLToPath(import.meta.url))
const scriptsPath = join(__dirname, `../cmd/${name}.ts`)

assert(
  existsSync(scriptsPath) && !name.startsWith('.'),
  `Executed script '${chalk.red(name)}' does not exist`
)

console.log(chalk.cyan(`dite-scripts: ${name}\n`))

const spawn = sync(
  'tsx',
  [scriptsPath, ...argv.slice(1)],
  {
    env: process.env,
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
  }
)
if (spawn.status !== 0) {
  console.log(chalk.red(`dite-scripts: ${name} execute fail`))
  process.exit(1)
}
