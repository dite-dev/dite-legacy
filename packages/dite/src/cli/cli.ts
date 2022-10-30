import { logger } from '@dite/utils';
import { cac } from 'cac';
// @ts-expect-error
import { version } from '../../package.json';
import { build } from './build';
import { dev } from './dev';
import { routes } from './routes';
import { start } from './start';

process.env.DEBUG = 'dite:*';

const cli = cac('dite').version(version).help();

export async function run() {
  logger.debug('dite Service');
  cli
    .command('dev [root]', 'start dev server')
    .allowUnknownOptions()
    .option('--config <path>', 'Use a custom config file')
    .action(dev);

  cli
    .command('build [root]', 'build for production')
    .allowUnknownOptions()
    .option('--config <path>', 'Use a custom config file')
    .action(build);

  cli
    .command('start [root]', 'serve for production')
    .allowUnknownOptions()
    .option('--port <port>', 'port to use for serve')
    .option('--watch', 'watch for file changes')
    .option('--config <path>', 'Use a custom config file')
    .option('--inspect', 'enable the Node.js inspector')
    .option('-h, --host <host>', 'dev server host', { default: '0.0.0.0' })
    .option('-p, --port <port>', 'dev server port', { default: 3001 })
    .action(start);

  cli
    .command('routes [root]', 'routes for dite')
    .option('--type <type>', 'type of routes', {
      default: 'json',
      type: ['json', 'jsx'],
    })
    .action(routes);

  // Listen to unknown commands
  cli.on('command:*', () => {
    console.error('Invalid command: %s', cli.args.join(' '));
    process.exit(1);
  });

  cli.parse(process.argv, { run: false });
  logger.debug('dite2 run');
  await cli.runMatchedCommand();
}
