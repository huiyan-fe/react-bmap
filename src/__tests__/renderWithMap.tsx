import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { BMapContext } from '../context/BMapContext';
import type { BMapContextValue } from '../context/BMapContext';
import { MapContext } from '../context/MapContext';
import type { MapContextValue } from '../context/MapContext';
import { makeFakeDriver } from './fakeDriver';
import type { FakeDriver } from './fakeDriver';
import type { MapHandle } from '../types';

// 把子树包在「已 ready」的 BMapContext 里，driver 用 fake 替身。
// 用于 Map.tsx 一类直接消费 BMapContext 的组件测试。
export function renderInBMapContext(
  ui: ReactNode,
  opts: { driver?: FakeDriver; status?: BMapContextValue['status']; version?: string } = {},
) {
  const driver = opts.driver ?? makeFakeDriver({ loaded: true });
  const value: BMapContextValue = {
    status: opts.status ?? 'ready',
    driver: driver as unknown as BMapContextValue['driver'],
    version: (opts.version ?? '4.0') as BMapContextValue['version'],
    error: null,
  };
  const result = render(<BMapContext.Provider value={value}>{ui}</BMapContext.Provider>);
  // 重写 rerender：始终把新 ui 重新包进同一个 Provider，
  // 否则 RTL 的默认 rerender 会以裸 ui 为根，丢掉 BMapContext（driver 退回 null）。
  const rerender = (nextUi: ReactNode) =>
    result.rerender(<BMapContext.Provider value={value}>{nextUi}</BMapContext.Provider>);
  return { ...result, rerender, driver };
}

// 把子树包在「已挂载地图」的 MapContext 里，供 Overlay/Control/Layer 工厂组件测试。
// 这些组件从 useMapContext() 直接拿 { map, driver }，不经过 Map.tsx。
export function renderInMapContext(
  ui: ReactNode,
  opts: { driver?: FakeDriver; map?: MapHandle } = {},
) {
  const driver = opts.driver ?? makeFakeDriver({ loaded: true });
  const map = opts.map ?? ({ __brand: 'map', type: 'map', raw: {}, id: 1 } as unknown as MapHandle);
  const value: MapContextValue = {
    map,
    driver: driver as unknown as MapContextValue['driver'],
  };
  const result = render(<MapContext.Provider value={value}>{ui}</MapContext.Provider>);
  // 同 renderInBMapContext：rerender 必须重新包 Provider，否则裸 ui 会丢掉 MapContext。
  const rerender = (nextUi: ReactNode) =>
    result.rerender(<MapContext.Provider value={value}>{nextUi}</MapContext.Provider>);
  return { ...result, rerender, driver, map };
}
