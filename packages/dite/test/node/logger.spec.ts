import { describe, expect, it, vi } from 'vitest';
import { logger } from '../../src/node/logger';

describe('node/logger', () => {
  it('should log', () => {
    const infoSpy = vi.spyOn(logger, 'info');
    logger.info('hello');
    expect(infoSpy).toHaveBeenCalledWith('hello');
    expect(infoSpy).toHaveBeenCalled();

    const waitSpy = vi.spyOn(logger, 'wait');
    logger.wait('hello');
    expect(waitSpy).toHaveBeenCalled();

    const debugSpy = vi.spyOn(logger, 'debug');
    logger.debug('hello');
    expect(debugSpy).toHaveBeenCalled();

    const errorSpy = vi.spyOn(logger, 'error');
    logger.error('hello');
    expect(errorSpy).toHaveBeenCalled();

    const warnSpy = vi.spyOn(logger, 'warn');
    logger.warn('hello');
    expect(warnSpy).toHaveBeenCalled();

    const fatalSpy = vi.spyOn(logger, 'fatal');
    logger.fatal('hello');
    expect(fatalSpy).toHaveBeenCalled();
  });
});
