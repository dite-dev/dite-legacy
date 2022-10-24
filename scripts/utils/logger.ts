import colors from 'chalk';
import { Consola } from 'consola';

export const prefixes = {
  wait: colors.cyan('wait') + '  -',
  error: colors.red('error') + ' -',
  fatal: colors.red('fatal') + ' -',
  warn: colors.yellow('warn') + '  -',
  ready: colors.green('ready') + ' -',
  info: colors.cyan('info') + ' -',
  event: colors.magenta('event') + ' -',
};

const consolaLogger = new Consola({});

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

export function fatal(...message: any[]) {
  consolaLogger.error(prefixes.fatal, ...message);
}

export const logger = {
  wait,
  error,
  warn,
  ready,
  info,
  event,
  fatal,
};
