import chalk from 'chalk';
import exitHook from 'exit-hook';
import lodash from 'lodash';
import Mustache from 'mustache';
import { getCache } from './cache';
import { localRequire, __require } from './local-require';
import { logger } from './logger';

export {
  chalk,
  lodash,
  exitHook,
  __require,
  logger,
  localRequire,
  getCache,
  Mustache,
};
