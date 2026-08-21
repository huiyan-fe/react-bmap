import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLatest } from '../useLatest';

describe('useLatest', () => {
  it('ref 始终指向最新值（避免事件订阅拿到旧闭包）', () => {
    const { result, rerender } = renderHook(({ v }) => useLatest(v), {
      initialProps: { v: 1 },
    });
    expect(result.current.current).toBe(1);

    rerender({ v: 2 });
    expect(result.current.current).toBe(2);

    // 跨 rerender 保持同一 ref 对象
    const ref1 = result.current;
    rerender({ v: 3 });
    expect(result.current).toBe(ref1);
    expect(result.current.current).toBe(3);
  });
});
