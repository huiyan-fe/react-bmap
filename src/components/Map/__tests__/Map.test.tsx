import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { Map } from '../Map';
import { renderInBMapContext } from '../../../__tests__/renderWithMap';
import { makeFakeDriver } from '../../../__tests__/fakeDriver';

// rAF/timer 用假时钟：受控循环抑制靠 requestAnimationFrame 复位 internalUpdateRef，
// markReady 的 500ms fallback 也要能推进。
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('Map 编排', () => {
  it('createMap 后不立即暴露 children，tilesloaded 触发 markReady 才挂载子树并回调 onReady', () => {
    const driver = makeFakeDriver({ loaded: true });
    const onReady = vi.fn();
    renderInBMapContext(
      <Map defaultCenter={{ lng: 116, lat: 39 }} defaultZoom={12} onReady={onReady}>
        <div data-testid="child">child</div>
      </Map>,
      { driver },
    );
    expect(driver.createMap).toHaveBeenCalledTimes(1);
    expect(driver.centerAndZoom).toHaveBeenCalledTimes(1);
    // markReady 前子树未挂载
    expect(document.querySelector('[data-testid="child"]')).toBeNull();
    expect(onReady).not.toHaveBeenCalled();
    // 触发 GL 首帧就绪
    act(() => { driver.__emit('tilesloaded'); });
    expect(onReady).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[data-testid="child"]')).not.toBeNull();
  });

  it('tilesloaded 丢失时 500ms fallback 兜底 markReady', () => {
    const driver = makeFakeDriver({ loaded: true });
    const onReady = vi.fn();
    renderInBMapContext(
      <Map defaultCenter={{ lng: 116, lat: 39 }}>
        <div data-testid="child">child</div>
      </Map>,
      { driver },
    );
    expect(onReady).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(500); });
    // onReady 未传也没关系，主要验证子树最终挂载
    expect(document.querySelector('[data-testid="child"]')).not.toBeNull();
  });

  it('受控 center：内部 setCenter 触发的 moveend 不回调 onCenterChange（循环抑制）', () => {
    // getCenter 返回与受控 center 不同的值，迫使 setCenter 执行
    const driver = makeFakeDriver({ loaded: true });
    driver.getCenter = vi.fn(() => ({ lng: 0, lat: 0 }));
    const onCenterChange = vi.fn();
    renderInBMapContext(
      <Map center={{ lng: 116, lat: 39 }} zoom={12} onCenterChange={onCenterChange}>
        <div>c</div>
      </Map>,
      { driver },
    );
    act(() => { driver.__emit('tilesloaded'); });
    // 受控 effect 应调用 setCenter，并把 internalUpdateRef 置 true
    expect(driver.setCenter).toHaveBeenCalled();
    // 此时 moveend 到达（模拟 SDK 因 setCenter 触发）：internalUpdateRef=true → 不回调
    act(() => { driver.__emit('moveend'); });
    expect(onCenterChange).not.toHaveBeenCalled();
    // rAF 复位 internalUpdateRef 后，用户手动拖动产生的 moveend 才回调
    act(() => { vi.advanceTimersByTime(16); });
    act(() => { driver.__emit('moveend'); });
    expect(onCenterChange).toHaveBeenCalledTimes(1);
  });

  it('交互开关：enableScrollWheelZoom=true 调 enable，切 false 调 disable', () => {
    const driver = makeFakeDriver({ loaded: true });
    const { rerender } = renderInBMapContext(
      <Map defaultCenter={{ lng: 116, lat: 39 }} enableScrollWheelZoom>
        <div>c</div>
      </Map>,
      { driver },
    );
    act(() => { driver.__emit('tilesloaded'); });
    expect(driver.enableScrollWheelZoom).toHaveBeenCalled();
    expect(driver.disableScrollWheelZoom).not.toHaveBeenCalled();
    rerender(
      <Map defaultCenter={{ lng: 116, lat: 39 }} enableScrollWheelZoom={false}>
        <div>c</div>
      </Map>,
    );
    expect(driver.disableScrollWheelZoom).toHaveBeenCalled();
  });

  it('卸载时完整清理：destroyMap 被调用，事件退订', () => {
    const driver = makeFakeDriver({ loaded: true });
    const { unmount } = renderInBMapContext(
      <Map defaultCenter={{ lng: 116, lat: 39 }}>
        <div>c</div>
      </Map>,
      { driver },
    );
    act(() => { driver.__emit('tilesloaded'); });
    const listenersBefore = Object.values(driver.__listeners).reduce((n, arr) => n + arr.length, 0);
    expect(listenersBefore).toBeGreaterThan(0);
    act(() => { unmount(); });
    expect(driver.destroyMap).toHaveBeenCalledTimes(1);
    const listenersAfter = Object.values(driver.__listeners).reduce((n, arr) => n + arr.length, 0);
    expect(listenersAfter).toBe(0);
  });

  it('status=error 渲染 errorFallback', () => {
    const driver = makeFakeDriver({ loaded: true });
    renderInBMapContext(
      <Map errorFallback={<span>map-error</span>}>
        <div data-testid="child">c</div>
      </Map>,
      { driver, status: 'error' },
    );
    expect(document.body.textContent).toContain('map-error');
    expect(driver.createMap).not.toHaveBeenCalled();
  });
});
