import { describe, expect, it } from 'vitest';
import { treeKillSync } from '../../../src/shared/lib/tree-kill';

describe('shared/lib/tree-kill.spec.ts', () => {
  // let proc: cp.ChildProcess;

  describe('treeKillSync', () => {
    // it('should be success', () => {
    //
    // })
    it('should use tree-kill to kill process', () => {
      expect(treeKillSync).toBeDefined();
      // expect(treeKillSync).toHaveBeenNthCalledWith(Number(proc?.pid), 'SIGTERM')
    });
  });
});
