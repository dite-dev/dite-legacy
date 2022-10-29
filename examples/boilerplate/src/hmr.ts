import { INestApplication, Logger } from '@nestjs/common';
import path from 'path';

// @ts-ignore
const { sourceRoot } = require('../nest-cli.json');

const SRC_PATH = path.resolve(sourceRoot);
const MAIN_PATH = path.resolve(SRC_PATH, 'main.ts');

process.title = 'swc-nestjs';

class HMR {
  private app: INestApplication;
  private logger = new Logger('HMR');

  constructor() {
    console.log('SRC_PATH', SRC_PATH);
    // chokidar.watch(`${SRC_PATH}/**/*.ts`).on('change', (path) => {
    //   this.logger.log(`Detected changes in file: ${path}`);
    //   this.reload();
    // });

    // naive error handling - source maps should work
    process.on('unhandledRejection', (reason) => this.logger.error(reason));
  }

  async reload() {
    this.logger.log('Starting HMR cycle');

    await this.executeAndLogWithDuration('Finished HMR cycle', async () => {
      // delete all require caches for SRC_PATH
      // TODO: check how to handle node_modules
      // for (const key in require.cache)
      //   if (key.includes(SRC_PATH)) delete require.cache[key];

      // get fresh instance of main
      const { bootstrap } = await import(MAIN_PATH);

      // close server if running
      if (this.app)
        await this.executeAndLogWithDuration('Closed server', this.app.close);

      // reinitialize server
      await this.executeAndLogWithDuration(
        'Started Server',
        async () => (this.app = await bootstrap()),
      );
    });
  }

  async executeAndLogWithDuration(msg: string, cb: () => Promise<any>) {
    const start = performance.now();

    await cb();

    const duration = Number(performance.now() - start).toFixed(0);
    this.logger.log(`${msg} +${duration}ms`);
  }
}

const hmr = new HMR();
hmr.reload();
