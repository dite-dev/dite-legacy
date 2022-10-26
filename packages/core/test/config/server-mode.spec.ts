import { describe, expect, it } from 'vitest';
import { isValidServerMode, ServerMode } from '../../src/config/server-mode';

describe('core/config/server-mode', () => {
  describe('ServerMode', () => {
    it('should be success', () => {
      expect(ServerMode.Development).toEqual('development');
      expect(ServerMode.Production).toEqual('production');
      expect(ServerMode.Test).toEqual('test');
    });
  });

  describe('isValidServerMode', () => {
    it('should return true for valid mode', () => {
      expect(isValidServerMode('development')).toBe(true);
      expect(isValidServerMode('production')).toBe(true);
      expect(isValidServerMode('test')).toBe(true);
    });
  });
});
