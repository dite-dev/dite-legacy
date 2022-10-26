import { readConfig } from '@dite/core';
import { lodash } from '@dite/utils';
const routes: any = {};

export async function matchRoutes(path: string) {
  if (lodash.isEmpty(routes)) {
    console.log(path);
    const config = readConfig();
    console.log(config);
  }
  return true;
}
