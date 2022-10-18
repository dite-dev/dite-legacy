import colors from 'chalk';
import consola from 'consola';
import makeDebug from 'debug';

export const prefixes = {
  wait: colors.cyan('wait') + '  -',
  error: colors.red('error') + ' -',
  fatal: colors.red('fatal') + ' -',
  warn: colors.yellow('warn') + '  -',
  ready: colors.green('ready') + ' -',
  // info: colors.cyan('info') + ' -',
  info: 'info' + ' -',
  event: colors.magenta('event') + ' -',
  debug: colors.gray('debug') + ' -',
};
const debugLogger = makeDebug('dite');

export function wait(...message: any[]) {
  consola.log(prefixes.wait, ...message);
  // logger.wait(message[0]);
}

export function error(...message: any[]) {
  consola.error(prefixes.error, ...message);
  // logger.error(message[0]);
}

export function warn(...message: any[]) {
  consola.warn(prefixes.warn, ...message);
  // logger.warn(message[0]);
}

export function ready(...message: any[]) {
  consola.log(prefixes.ready, ...message);
  // logger.ready(message[0]);
}

export function info(...message: any[]) {
  consola.log(prefixes.info, ...message);
  // logger.info(message[0]);
}

export function event(...message: any[]) {
  consola.log(prefixes.event, ...message);
  // logger.event(message[0]);
}

export function debug(...message: any[]) {
  // if (process.env.DEBUG) {
  debugLogger(prefixes.debug, ...message);
  // }
  // logger.debug(message[0]);
}

export function fatal(...message: any[]) {
  consola.error(prefixes.fatal, ...message);
  // logger.fatal(message[0]);
}

export const logger = {
  wait,
  error,
  warn,
  ready,
  info,
  event,
  debug,
  fatal,
};
