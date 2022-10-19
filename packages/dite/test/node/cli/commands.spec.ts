import path from 'path';
import { describe, expect, it } from 'vitest';
import * as commands from '../../../src/node/cli/commands';

describe('node/cli/commands.ts', () => {
  const rootPath = path.join(__dirname, '../../fixtures/demo-app');
  describe('watch', () => {
    it('should be success', async () => {
      const closeWatcher = await commands.watch(rootPath);
      expect(closeWatcher).toBeDefined();
    });
  });
});
