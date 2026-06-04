import { describe, it, expect, vi } from 'vitest';
import { runStep } from '../runStep.utils.js';

describe('runStep', () => {
  it('should call cb and spinner.succeed when condition is true', async () => {
    const cb = vi.fn();
    const spinner = { succeed: vi.fn(), info: vi.fn(), fail: vi.fn() };

    await runStep({
      spinner,
      sccMsg: 'done',
      condition: true,
      cb,
    });

    expect(cb).toHaveBeenCalledTimes(1);
    expect(spinner.succeed).toHaveBeenCalledTimes(1);
  });

  it('should call spinner.fail with errMsg when condition is false', async () => {
    const spinner = { succeed: vi.fn(), info: vi.fn(), fail: vi.fn() };

    await runStep({
      spinner,
      errMsg: 'error occurred',
      condition: false,
    });

    expect(spinner.fail).toHaveBeenCalledTimes(1);
  });

  it('should call spinner.info with fbMsg when condition is false', async () => {
    const spinner = { succeed: vi.fn(), info: vi.fn(), fail: vi.fn() };

    await runStep({
      spinner,
      fbMsg: 'fallback message',
      condition: false,
    });

    expect(spinner.info).toHaveBeenCalledTimes(1);
  });

  it('should not call cb when condition is false', async () => {
    const cb = vi.fn();
    const spinner = { succeed: vi.fn(), info: vi.fn(), fail: vi.fn() };

    await runStep({
      spinner,
      condition: false,
      cb,
    });

    expect(cb).not.toHaveBeenCalled();
  });

  it('should handle missing cb gracefully when condition is true', async () => {
    const spinner = { succeed: vi.fn(), info: vi.fn(), fail: vi.fn() };

    await runStep({
      spinner,
      sccMsg: 'ok',
      condition: true,
    });

    expect(spinner.succeed).toHaveBeenCalledTimes(1);
  });

  it('should handle async cb', async () => {
    let resolved = false;
    const cb = async () => {
      resolved = true;
    };
    const spinner = { succeed: vi.fn(), info: vi.fn(), fail: vi.fn() };

    await runStep({
      spinner,
      sccMsg: 'async done',
      condition: true,
      cb,
    });

    expect(resolved).toBe(true);
    expect(spinner.succeed).toHaveBeenCalledTimes(1);
  });

  it('should not call info or fail when messages are not provided', async () => {
    const spinner = { succeed: vi.fn(), info: vi.fn(), fail: vi.fn() };

    await runStep({
      spinner,
      condition: false,
    });

    expect(spinner.info).not.toHaveBeenCalled();
    expect(spinner.fail).not.toHaveBeenCalled();
  });
});
