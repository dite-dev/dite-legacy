#!/usr/bin/env node

const cli = require('../dist/cli');

cli.run().catch(err => {
  console.error(err);
  process.exit(1);
})
