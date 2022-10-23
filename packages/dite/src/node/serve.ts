import { logger } from './logger';

export async function serve(root: string, userPort: number) {
  logger.info('serve', root, userPort);
}
