import { build } from './build';
import { start } from './start';
import { watch } from './watch';

export { start, build, watch };

export async function help() {
  console.log('help');
}
