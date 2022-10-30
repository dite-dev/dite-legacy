import chalk from 'chalk';
import exitHook from 'exit-hook';
import lodash from 'lodash';
import Mustache from 'mustache';
import resolveFrom from 'resolve-from';
import { getCache } from './cache';
import { localRequire } from './local-require';
import { logger } from './logger';

export {
  chalk,
  lodash,
  resolveFrom,
  exitHook,
  logger,
  localRequire,
  getCache,
  Mustache,
};
