import { describe, expect, it, vi } from 'vitest';
import { logger } from '../src/logger';

describe('node/logger', () => {
  it('should log', () => {
    const infoSpy = vi.spyOn(logger, 'info');
    logger.info('hello');
    expect(infoSpy).toHaveBeenCalledWith('hello');

    const errorSpy = vi.spyOn(logger, 'error');
    logger.error('hello');
    expect(errorSpy).toHaveBeenCalled();

    const warnSpy = vi.spyOn(logger, 'warn');
    logger.warn('hello');
    expect(warnSpy).toHaveBeenCalled();
  });
});
