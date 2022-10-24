import colors from 'chalk';
import consola from 'consola';
import makeDebug from 'debug';

export const prefixes = {
  start: colors.blue('start') + '  -',
  wait: colors.cyan('wait') + '  -',
  error: colors.red('error') + ' -',
  fatal: colors.red('fatal') + ' -',
  warn: colors.yellow('warn') + '  -',
  ready: colors.green('ready') + ' -',
  info: colors.cyan('info') + ' -',
  event: colors.magenta('event') + ' -',
  debug: colors.gray('debug') + ' -',
};

const debugLogger = makeDebug('dite');

const createConsola = () => {
  const logger = consola.create({});
  return logger;
};

const consolaLogger = createConsola();

export function wait(...message: any[]) {
  consolaLogger.log(prefixes.wait, ...message);
}

export function error(...message: any[]) {
  consolaLogger.error(prefixes.error, ...message);
}

export function warn(...message: any[]) {
  consolaLogger.warn(prefixes.warn, ...message);
}

export function ready(...message: any[]) {
  consolaLogger.log(prefixes.ready, ...message);
}

export function info(...message: any[]) {
  consolaLogger.log(prefixes.info, ...message);
}

export function event(...message: any[]) {
  consolaLogger.log(prefixes.event, ...message);
}

export function debug(...message: any[]) {
  debugLogger(prefixes.debug, ...message);
}

export function fatal(...message: any[]) {
  consolaLogger.error(prefixes.fatal, ...message);
}

export function start(...message: any[]) {
  consolaLogger.start(prefixes.start, ...message);
}

interface DiteLogger {
  wait: typeof wait;
  error: typeof error;
  warn: typeof warn;
  ready: typeof ready;
  info: typeof info;
  event: typeof event;
  debug: typeof debug;
  fatal: typeof fatal;
  start: typeof start;
}

const logger: DiteLogger = {
  wait,
  error,
  warn,
  ready,
  info,
  event,
  debug,
  fatal,
  start,
};

export { logger, logger as default };
