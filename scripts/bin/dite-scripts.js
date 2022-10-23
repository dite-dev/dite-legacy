#!/usr/bin/env node

const { join } = require('node:path')
const { existsSync } = require('node:fs')
const { sync } = require('cross-spawn')
const chalk = require('chalk')
const assert = require('assert')

const argv = process.argv.slice(2)
const name = argv[0]
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
