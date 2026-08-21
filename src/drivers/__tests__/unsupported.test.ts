import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  UnsupportedCapabilityError,
  reportUnsupported,
  isMissingMember,
  reportCallFailure,
  unsupportedValue,
  tryOp,
} from '../unsupported';

afterEach(() => vi.restoreAllMocks());

describe('UnsupportedCapabilityError', () => {
  it('携带 capability/version，name 正确', () => {
    const e = new UnsupportedCapabilityError('Map.flyTo', '3.0');
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe('UnsupportedCapabilityError');
    expect(e.capability).toBe('Map.flyTo');
    expect(e.version).toBe('3.0');
    expect(e.message).toContain('Map.flyTo');
  });
});

describe('reportUnsupported', () => {
  it("throw 策略抛 UnsupportedCapabilityError", () => {
    expect(() => reportUnsupported('Map.flyTo', '3.0', 'throw')).toThrow(
      UnsupportedCapabilityError,
    );
  });

  it("warn 策略打印 (noop) 并正常返回", () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(reportUnsupported('Map.flyTo', '3.0', 'warn')).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      '[react-bmap] Map.flyTo not supported in JSAPI 3.0 (noop)',
    );
  });

  it("ignore 策略静默返回，不打印", () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(reportUnsupported('Map.flyTo', '3.0', 'ignore')).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('isMissingMember', () => {
  it('引擎的 "is not a function/constructor" TypeError → true', () => {
    expect(isMissingMember(new TypeError('x.foo is not a function'))).toBe(true);
    expect(isMissingMember(new TypeError('X is not a constructor'))).toBe(true);
  });

  it('其它 TypeError / 普通 Error / 非 Error → false', () => {
    expect(isMissingMember(new TypeError('cannot read x of undefined'))).toBe(false);
    expect(isMissingMember(new Error('is not a function'))).toBe(false);
    expect(isMissingMember('is not a function')).toBe(false);
  });
});

describe('reportCallFailure', () => {
  it('成员不存在 → 分流到 reportUnsupported（throw 模式抛错）', () => {
    expect(() =>
      reportCallFailure('Map.flyTo', '3.0', 'throw', new TypeError('foo is not a function')),
    ).toThrow(UnsupportedCapabilityError);
  });

  it('成员存在但执行报错 → debugWarn，不抛', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const runtimeErr = new Error('SDK internal null');
    expect(() =>
      reportCallFailure('Map.setCenter', '4.0', 'throw', runtimeErr),
    ).not.toThrow();
    expect(warn).toHaveBeenCalled();
  });
});

describe('unsupportedValue', () => {
  it('warn 模式：报告后返回兜底值', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(unsupportedValue('Map.getHeading', '3.0', 'warn', NaN)).toBeNaN();
    expect(unsupportedValue('Map.getTilt', '3.0', 'ignore', 0)).toBe(0);
  });

  it('throw 模式：不返回而是抛错', () => {
    expect(() => unsupportedValue('Map.getHeading', '3.0', 'throw', NaN)).toThrow(
      UnsupportedCapabilityError,
    );
  });
});

describe('tryOp', () => {
  it('成功 → { ok:true, value }', () => {
    expect(tryOp(() => 42)).toEqual({ ok: true, value: 42 });
  });

  it('捕获 UnsupportedCapabilityError → { ok:false, reason:"unsupported", capability }', () => {
    const r = tryOp(() => {
      throw new UnsupportedCapabilityError('Map.flyTo', '3.0');
    });
    expect(r).toEqual({ ok: false, reason: 'unsupported', capability: 'Map.flyTo' });
  });

  it('其它错误照常抛出（不吞）', () => {
    expect(() =>
      tryOp(() => {
        throw new Error('boom');
      }),
    ).toThrow('boom');
  });
});
