import colors from 'chalk';
import consola from 'consola';

const prefixes = {
  start: colors.blue('start') + ' -',
  wait: colors.cyan('wait') + ' -',
  error: colors.red('error') + ' -',
  fatal: colors.red('fatal') + ' -',
  warn: colors.yellow('warn') + '  -',
  ready: colors.green('ready') + ' -',
  info: colors.cyan('info') + ' -',
  event: colors.magenta('event') + ' -',
  debug: colors.gray('debug') + ' -',
};

const createConsola = () => {
  const logger = consola.create({});
  return logger;
};

const consolaLogger = createConsola();

function wait(...message: any[]) {
  consolaLogger.log(prefixes.wait, ...message);
}

function error(...message: any[]) {
  consolaLogger.error(prefixes.error, ...message);
}

function warn(...message: any[]) {
  consolaLogger.warn(prefixes.warn, ...message);
}

function ready(...message: any[]) {
  consolaLogger.log(prefixes.ready, ...message);
}

function info(...message: any[]) {
  consolaLogger.log(prefixes.info, ...message);
}

function event(...message: any[]) {
  consolaLogger.log(prefixes.event, ...message);
}

function fatal(...message: any[]) {
  consolaLogger.error(prefixes.fatal, ...message);
}

function start(...message: any[]) {
  consolaLogger.log(prefixes.start, ...message);
}

export const logger = {
  wait,
  error,
  warn,
  ready,
  info,
  event,
  fatal,
  start,
};
