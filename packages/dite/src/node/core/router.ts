import { isEmpty } from 'lodash-es';
import { readConfig } from './config';
const routes: any = {};

export async function matchRoutes(path: string) {
  if (isEmpty(routes)) {
    const config = readConfig();
    console.log(config);
  }
  return true;
}
