import { describe, it, expect, afterEach, vi } from 'vitest';
import { debugWarn, devWarn } from '../debugWarn';

const g = globalThis as unknown as { process?: { env?: Record<string, string | undefined> } };

afterEach(() => {
  vi.restoreAllMocks();
  // 恢复 NODE_ENV，避免污染其它用例
  if (g.process?.env) delete g.process.env.NODE_ENV;
});

describe('devWarn', () => {
  it('非 production 打印带前缀日志', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    devWarn('hello');
    expect(warn).toHaveBeenCalledWith('[react-bmap] hello');
  });

  it('带 cause 时附加原始错误', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const err = new Error('boom');
    devWarn('ctx', err);
    expect(warn).toHaveBeenCalledWith('[react-bmap] ctx', err);
  });

  it('production 下静默', () => {
    (g.process ??= {} as never).env = { ...(g.process!.env ?? {}), NODE_ENV: 'production' };
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    devWarn('should not print');
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('debugWarn', () => {
  it('带 cause 时追加「调用失败：」并传原始错误', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const err = new Error('x');
    debugWarn('Layer.setData', err);
    expect(warn).toHaveBeenCalledWith('[react-bmap] Layer.setData 调用失败：', err);
  });

  it('无 cause 时只追加「调用失败」', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    debugWarn('Map.setCenter');
    expect(warn).toHaveBeenCalledWith('[react-bmap] Map.setCenter 调用失败');
  });
});
