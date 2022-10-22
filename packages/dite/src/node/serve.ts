import { logger } from '../shared/logger';

export async function serve(root: string, userPort: number) {
  logger.info('serve', root, userPort);
}
