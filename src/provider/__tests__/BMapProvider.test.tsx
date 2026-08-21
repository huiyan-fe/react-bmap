import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';

// ── mock loader 与 createDriver：隔离 provider 的编排逻辑 ──
// loadJSAPI 用可控 deferred，手动决定 resolve/reject 时机，测 generation race。
const loadCalls: Array<{ components: any; opts: any; resolve: (v: any) => void; reject: (e: any) => void }> = [];
vi.mock('../../loader', () => ({
  loadJSAPI: vi.fn((components: any, opts: any) => {
    return new Promise((resolve, reject) => {
      loadCalls.push({ components, opts, resolve, reject });
    });
  }),
}));

const createDriverMock = vi.fn((version: string, rawSDK: unknown) => ({
  version, rawSDK, __fake: true,
}));
vi.mock('../../drivers/createDriver', () => ({
  createDriver: (v: string, raw: unknown, o: unknown) => createDriverMock(v, raw, o),
}));

import { BMapProvider } from '../BMapProvider';
import { useBMapContext } from '../../context/BMapContext';

function Probe() {
  const { status, version, driver } = useBMapContext();
  return <div data-testid="probe">{`${status}|${version}|${driver ? 'has-driver' : 'no-driver'}`}</div>;
}

function lastLoad() {
  return loadCalls[loadCalls.length - 1];
}

beforeEach(() => {
  loadCalls.length = 0;
  createDriverMock.mockClear();
});
afterEach(() => {
  vi.clearAllMocks();
});

describe('BMapProvider 编排', () => {
  it('loading 阶段渲染 fallback，不渲染 children', () => {
    render(
      <BMapProvider ak="test-ak" fallback={<span>loading...</span>}>
        <Probe />
      </BMapProvider>,
    );
    expect(screen.getByText('loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('probe')).toBeNull();
  });

  it('加载成功后进入 ready 并把 driver 注入 context', async () => {
    render(
      <BMapProvider ak="test-ak" version="4.0">
        <Probe />
      </BMapProvider>,
    );
    expect(loadCalls.length).toBe(1);
    await act(async () => {
      lastLoad().resolve({ rawSDK: { sdk: true }, version: '4.0' });
    });
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveTextContent('ready|4.0|has-driver');
    });
    expect(createDriverMock).toHaveBeenCalledWith('4.0', { sdk: true }, expect.anything());
  });

  it('加载失败进入 error，渲染 errorFallback 并调用 onError', async () => {
    const onError = vi.fn();
    render(
      <BMapProvider ak="bad-ak" onError={onError} errorFallback={<span>load-failed</span>}>
        <Probe />
      </BMapProvider>,
    );
    const err = new Error('boom');
    await act(async () => {
      lastLoad().reject(err);
    });
    await waitFor(() => {
      expect(screen.getByText('load-failed')).toBeInTheDocument();
    });
    expect(onError).toHaveBeenCalledWith(err);
    expect(screen.queryByTestId('probe')).toBeNull();
  });

  it('generation race：过期 promise 的迟到结果被丢弃', async () => {
    const { rerender } = render(
      <BMapProvider ak="ak-1" version="4.0">
        <Probe />
      </BMapProvider>,
    );
    const first = lastLoad();
    // 改变 ak 触发 effect 重跑 → generation++，旧 promise 作废
    rerender(
      <BMapProvider ak="ak-2" version="4.0">
        <Probe />
      </BMapProvider>,
    );
    expect(loadCalls.length).toBe(2);
    const second = lastLoad();
    // 旧的先 resolve：应被 generation 拦住，不进入 ready
    await act(async () => {
      first.resolve({ rawSDK: { which: 'old' }, version: '4.0' });
    });
    expect(screen.queryByTestId('probe')).toBeNull();
    // 新的 resolve：正常进入 ready
    await act(async () => {
      second.resolve({ rawSDK: { which: 'new' }, version: '4.0' });
    });
    await waitFor(() => {
      expect(screen.getByTestId('probe')).toHaveTextContent('ready');
    });
    expect(createDriverMock).toHaveBeenCalledTimes(1);
    expect(createDriverMock).toHaveBeenCalledWith('4.0', { which: 'new' }, expect.anything());
  });

  it('globalConfig 按值比较：内联同值对象不触发 driver 重建', async () => {
    const { rerender } = render(
      <BMapProvider ak="ak" globalConfig={{ a: 1 }}>
        <Probe />
      </BMapProvider>,
    );
    expect(loadCalls.length).toBe(1);
    await act(async () => {
      lastLoad().resolve({ rawSDK: {}, version: '4.0' });
    });
    await waitFor(() => screen.getByTestId('probe'));
    // 传入新的、但值相同的内联对象：globalConfigKey 不变 → effect 不重跑
    rerender(
      <BMapProvider ak="ak" globalConfig={{ a: 1 }}>
        <Probe />
      </BMapProvider>,
    );
    expect(loadCalls.length).toBe(1);
    // 值真正变化 → 重跑
    rerender(
      <BMapProvider ak="ak" globalConfig={{ a: 2 }}>
        <Probe />
      </BMapProvider>,
    );
    expect(loadCalls.length).toBe(2);
  });

  it('SSR 守卫存在：effect 内 window===undefined 直接 return（此处仅确认 jsdom 下正常加载）', () => {
    // jsdom 有 window，正常走加载路径；SSR 分支靠 typeof window 守卫，无 window 时不发起加载。
    render(
      <BMapProvider ak="ak">
        <Probe />
      </BMapProvider>,
    );
    expect(loadCalls.length).toBe(1);
  });
});
