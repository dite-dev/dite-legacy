#!/usr/bin/env node
process.title = 'dite-cli';
require('../dist/cli.js')
  .run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
