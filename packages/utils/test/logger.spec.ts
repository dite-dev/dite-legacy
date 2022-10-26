import { describe, expect, it, vi } from 'vitest';
import { logger } from '../src/logger';

describe('node/logger', () => {
  it('should log', () => {
    const infoSpy = vi.spyOn(logger, 'info');
    logger.info('hello');
    expect(infoSpy).toHaveBeenCalledWith('hello');

    const waitSpy = vi.spyOn(logger, 'wait');
    logger.wait('hello');
    expect(waitSpy).toHaveBeenCalled();

    const errorSpy = vi.spyOn(logger, 'error');
    logger.error('hello');
    expect(errorSpy).toHaveBeenCalled();

    const warnSpy = vi.spyOn(logger, 'warn');
    logger.warn('hello');
    expect(warnSpy).toHaveBeenCalled();

    const fatalSpy = vi.spyOn(logger, 'fatal');
    logger.fatal('hello');
    expect(fatalSpy).toHaveBeenCalled();

    const eventSpy = vi.spyOn(logger, 'event');
    logger.event('hello');
    expect(eventSpy).toHaveBeenCalled();
  });
});
