import chalk from 'chalk';
import exitHook from 'exit-hook';
import lodash from 'lodash';
import Mustache from 'mustache';
import resolveFrom from 'resolve-from';
import { getCache } from './cache';
import { localRequire, __require } from './local-require';
import { logger } from './logger';

export {
  chalk,
  lodash,
  resolveFrom,
  exitHook,
  __require,
  logger,
  localRequire,
  getCache,
  Mustache,
};
