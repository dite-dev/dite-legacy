import { resolve } from 'path';

/**
 * resolve client file path
 * @param pathSegments relative path of file in client
 * @returns absolute path of file
 */
export const resolveAppPath = (...pathSegments: string[]) =>
  resolve(__dirname, '..', '..', 'app', ...pathSegments);

/**
 * resolve dist file path
 * @param pathSegments relative path of file in dist
 * @returns absolute path of file
 */
export const resolveDistPath = (...pathSegments: string[]) =>
  resolve(__dirname, '..', '..', 'dist', ...pathSegments);
