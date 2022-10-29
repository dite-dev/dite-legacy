import { describe, expect, it, vi } from 'vitest';
import * as commands from '../../../src/cli/commands';

describe('node/cli/commands.ts', () => {
  // const rootPath = path.join(__dirname, '../../fixtures/demo-app');
  describe('watch', () => {
    it('should be success', async () => {
      // const CommandBuildSpy = vi.spyOn(commands, 'build');
      // await commands.build(rootPath);
      // expect(CommandBuildSpy).toHaveBeenCalled();
      const CommandHelpSpy = vi.spyOn(commands, 'help');
      await commands.help();
      expect(CommandHelpSpy).toHaveBeenCalled();
    });
  });
});
