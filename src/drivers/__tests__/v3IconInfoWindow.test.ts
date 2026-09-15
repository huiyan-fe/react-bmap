import { describe, it, expect } from 'vitest';
import { createDriver } from '../createDriver';
import type { MapHandle } from '../../types';

describe('v3Driver.enableIconInfoWindow/disableIconInfoWindow 转发到 enableMapClick/disableMapClick', () => {
  it('enableIconInfoWindow 调用 raw.enableMapClick（3.0 没有自动弹窗能力，只能让图标可点击）', () => {
    const calls: string[] = [];
    const rawMap = {
      enableMapClick: () => calls.push('enableMapClick'),
      disableMapClick: () => calls.push('disableMapClick'),
    };
    const map = { raw: rawMap } as unknown as MapHandle;
    const d = createDriver('3.0', {}, { unsupportedBehavior: 'ignore' });

    d.enableIconInfoWindow(map);
    expect(calls).toEqual(['enableMapClick']);
  });

  it('disableIconInfoWindow 调用 raw.disableMapClick', () => {
    const calls: string[] = [];
    const rawMap = {
      enableMapClick: () => calls.push('enableMapClick'),
      disableMapClick: () => calls.push('disableMapClick'),
    };
    const map = { raw: rawMap } as unknown as MapHandle;
    const d = createDriver('3.0', {}, { unsupportedBehavior: 'ignore' });

    d.disableIconInfoWindow(map);
    expect(calls).toEqual(['disableMapClick']);
  });
});
