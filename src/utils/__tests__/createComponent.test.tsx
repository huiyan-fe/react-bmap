import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import {
  createOverlayComponent,
  createControlComponent,
  createLayerComponent,
} from '../createComponent';
import { renderInMapContext } from '../../__tests__/renderWithMap';
import { makeFakeDriver } from '../../__tests__/fakeDriver';

// createComponent.tsx 是所有 Overlay/Control/Layer 组件的共享工厂。
// 直接测工厂本身 = 一次性覆盖所有工厂产物的挂载/更新/卸载/事件/重建逻辑，
// 具体组件只是喂不同的 config，无需逐个重复测。

describe('createOverlayComponent 工厂', () => {
  interface MarkerLikeProps {
    position?: { lng: number; lat: number };
    title?: string;
    offset?: unknown;
    visible?: boolean;
    onClick?: (point: unknown, raw: unknown) => void;
    children?: React.ReactNode;
  }

  const makeMarker = (extra: Partial<Parameters<typeof createOverlayComponent>[0]> = {}) =>
    createOverlayComponent<MarkerLikeProps>({
      factory: (driver, props) => driver.createMarker(props.position, props),
      positionProp: 'position',
      optionProps: ['title'],
      events: [{ sdk: 'click', prop: 'onClick' }],
      displayName: 'Marker',
      ...(extra as any),
    });

  it('挂载：调 factory 创建实例并 addOverlay(map, handle)', () => {
    const Marker = makeMarker();
    const driver = makeFakeDriver({ loaded: true });
    renderInMapContext(<Marker position={{ lng: 1, lat: 2 }} />, { driver });
    expect(driver.createMarker).toHaveBeenCalledTimes(1);
    expect(driver.addOverlay).toHaveBeenCalledTimes(1);
    const handle = driver.createMarker.mock.results[0].value;
    expect(driver.addOverlay).toHaveBeenCalledWith(expect.anything(), handle);
  });

  it('挂载：剥离 undefined/null props，只把显式设值的字段传给 factory', () => {
    const Marker = makeMarker();
    const driver = makeFakeDriver({ loaded: true });
    renderInMapContext(
      <Marker position={{ lng: 1, lat: 2 }} title={undefined} offset={null} />,
      { driver },
    );
    const factoryProps = driver.createMarker.mock.calls[0][1];
    expect(factoryProps).not.toHaveProperty('title');
    expect(factoryProps).not.toHaveProperty('offset');
    expect(factoryProps).toHaveProperty('position');
  });

  it('position 变化：调 setOverlayPosition', () => {
    const Marker = makeMarker();
    const driver = makeFakeDriver({ loaded: true });
    const { rerender } = renderInMapContext(<Marker position={{ lng: 1, lat: 2 }} />, { driver });
    driver.setOverlayPosition.mockClear();
    act(() => rerender(<Marker position={{ lng: 3, lat: 4 }} />));
    expect(driver.setOverlayPosition).toHaveBeenCalledWith(expect.anything(), { lng: 3, lat: 4 });
  });

  it('position 值未变（新对象同值）：不重复调 setOverlayPosition', () => {
    const Marker = makeMarker();
    const driver = makeFakeDriver({ loaded: true });
    const { rerender } = renderInMapContext(<Marker position={{ lng: 1, lat: 2 }} />, { driver });
    driver.setOverlayPosition.mockClear();
    act(() => rerender(<Marker position={{ lng: 1, lat: 2 }} />));
    expect(driver.setOverlayPosition).not.toHaveBeenCalled();
  });

  it('option prop 变化：调 setOverlayOptions', () => {
    const Marker = makeMarker();
    const driver = makeFakeDriver({ loaded: true });
    const { rerender } = renderInMapContext(<Marker position={{ lng: 1, lat: 2 }} title="a" />, { driver });
    driver.setOverlayOptions.mockClear();
    act(() => rerender(<Marker position={{ lng: 1, lat: 2 }} title="b" />));
    expect(driver.setOverlayOptions).toHaveBeenCalledWith(expect.anything(), { title: 'b' });
  });

  it('visible=false 调 hideOverlay，true 调 showOverlay', () => {
    const Marker = makeMarker();
    const driver = makeFakeDriver({ loaded: true });
    const { rerender } = renderInMapContext(<Marker position={{ lng: 1, lat: 2 }} visible={false} />, { driver });
    expect(driver.hideOverlay).toHaveBeenCalled();
    driver.showOverlay.mockClear();
    act(() => rerender(<Marker position={{ lng: 1, lat: 2 }} visible={true} />));
    expect(driver.showOverlay).toHaveBeenCalled();
  });

  it('事件：SDK 事件触发时回调收到 point + raw', () => {
    const Marker = makeMarker();
    const driver = makeFakeDriver({ loaded: true });
    const onClick = vi.fn();
    renderInMapContext(<Marker position={{ lng: 1, lat: 2 }} onClick={onClick} />, { driver });
    act(() => driver.__emit('click', { point: { lng: 5, lat: 6 }, foo: 1 }));
    expect(onClick).toHaveBeenCalledWith({ lng: 5, lat: 6 }, { point: { lng: 5, lat: 6 }, foo: 1 });
  });

  it('ctorOnlyProps 变化：重建实例（removeOverlay 旧 + 再 create + addOverlay 新）', () => {
    const Marker = makeMarker({ ctorOnlyProps: ['title'] });
    const driver = makeFakeDriver({ loaded: true });
    const { rerender } = renderInMapContext(<Marker position={{ lng: 1, lat: 2 }} title="a" />, { driver });
    expect(driver.createMarker).toHaveBeenCalledTimes(1);
    act(() => rerender(<Marker position={{ lng: 1, lat: 2 }} title="b" />));
    expect(driver.createMarker).toHaveBeenCalledTimes(2);
    expect(driver.removeOverlay).toHaveBeenCalledTimes(1);
    expect(driver.addOverlay).toHaveBeenCalledTimes(2);
  });

  it('skipMount：创建实例但不 addOverlay（值对象语义）', () => {
    const Symbol = makeMarker({ skipMount: true });
    const driver = makeFakeDriver({ loaded: true });
    renderInMapContext(<Symbol position={{ lng: 1, lat: 2 }} />, { driver });
    expect(driver.createMarker).toHaveBeenCalledTimes(1);
    expect(driver.addOverlay).not.toHaveBeenCalled();
  });

  it('卸载：调 removeOverlay 清理', () => {
    const Marker = makeMarker();
    const driver = makeFakeDriver({ loaded: true });
    const { unmount } = renderInMapContext(<Marker position={{ lng: 1, lat: 2 }} />, { driver });
    driver.removeOverlay.mockClear();
    act(() => unmount());
    expect(driver.removeOverlay).toHaveBeenCalledTimes(1);
  });

  it('supportsChildren=true 时渲染 children，false 时不渲染', () => {
    const WithKids = makeMarker({ supportsChildren: true });
    const driver = makeFakeDriver({ loaded: true });
    const { getByTestId, queryByTestId } = renderInMapContext(
      <WithKids position={{ lng: 1, lat: 2 }}><span data-testid="kid" /></WithKids>,
      { driver },
    );
    expect(getByTestId('kid')).toBeTruthy();

    const NoKids = makeMarker({ supportsChildren: false });
    const { container } = renderInMapContext(
      <NoKids position={{ lng: 1, lat: 2 }}><span data-testid="kid2" /></NoKids>,
      { driver: makeFakeDriver({ loaded: true }) },
    );
    void queryByTestId;
    expect(container.querySelector('[data-testid="kid2"]')).toBeNull();
  });
});

describe('createControlComponent 工厂', () => {
  interface CtrlProps { anchor?: number; offset?: unknown; visible?: boolean }
  const makeControl = () =>
    createControlComponent<CtrlProps>({
      factory: (driver) => driver.createNavigationControl(),
      optionProps: ['anchor'],
      displayName: 'NavigationControl',
    });

  it('挂载：addControl(map, handle)', () => {
    const Ctrl = makeControl();
    const driver = makeFakeDriver({ loaded: true });
    renderInMapContext(<Ctrl anchor={1} />, { driver });
    expect(driver.createNavigationControl).toHaveBeenCalledTimes(1);
    expect(driver.addControl).toHaveBeenCalledTimes(1);
  });

  it('option 更新跳过首次运行（构造已设置），后续变化才调 setControlOptions', () => {
    const Ctrl = makeControl();
    const driver = makeFakeDriver({ loaded: true });
    const { rerender } = renderInMapContext(<Ctrl anchor={1} />, { driver });
    // 首次挂载不调 setControlOptions（避免 setAnchor 重置默认 offset）
    expect(driver.setControlOptions).not.toHaveBeenCalled();
    act(() => rerender(<Ctrl anchor={2} />));
    expect(driver.setControlOptions).toHaveBeenCalledWith(expect.anything(), { anchor: 2 });
  });

  it('visible=false 调 hideControl', () => {
    const Ctrl = makeControl();
    const driver = makeFakeDriver({ loaded: true });
    renderInMapContext(<Ctrl anchor={1} visible={false} />, { driver });
    expect(driver.hideControl).toHaveBeenCalled();
  });

  it('卸载：removeControl', () => {
    const Ctrl = makeControl();
    const driver = makeFakeDriver({ loaded: true });
    const { unmount } = renderInMapContext(<Ctrl anchor={1} />, { driver });
    driver.removeControl.mockClear();
    act(() => unmount());
    expect(driver.removeControl).toHaveBeenCalledTimes(1);
  });
});

describe('createLayerComponent 工厂', () => {
  interface LayerProps { name?: string; tileLoadFunction?: () => void }
  let layerSeq = 0;
  // 返回 { Layer, factory }：factory 是 spy，可断言重建次数。
  // （Proxy 兜底的 driver.createXxx 返回 undefined，图层工厂必须显式造 handle。）
  const makeLayer = (extra: Partial<Parameters<typeof createLayerComponent>[0]> = {}) => {
    const factory = vi.fn(() => ({ __brand: 'layer', type: 'tilelayer', raw: {}, id: ++layerSeq } as any));
    const Layer = createLayerComponent<LayerProps>({
      factory,
      displayName: 'TileLayer',
      ...(extra as any),
    });
    return { Layer, factory };
  };

  beforeEach(() => vi.useRealTimers());

  it('挂载：factory 创建 handle + addLayer(map, handle)', () => {
    const { Layer, factory } = makeLayer();
    const driver = makeFakeDriver({ loaded: true });
    renderInMapContext(<Layer name="a" />, { driver });
    expect(factory).toHaveBeenCalledTimes(1);
    expect(driver.addLayer).toHaveBeenCalledTimes(1);
  });

  it('layerKey 用值比较：内联函数 prop 不引起重建', () => {
    const { Layer, factory } = makeLayer();
    const driver = makeFakeDriver({ loaded: true });
    const { rerender } = renderInMapContext(<Layer name="a" tileLoadFunction={() => {}} />, { driver });
    expect(factory).toHaveBeenCalledTimes(1);
    // 换一个新的内联函数（引用变了但 stableStringify 折叠成 'fn'）
    act(() => rerender(<Layer name="a" tileLoadFunction={() => {}} />));
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('值属性变化：重建 layer（removeLayer 旧 + factory 新）', () => {
    const { Layer, factory } = makeLayer();
    const driver = makeFakeDriver({ loaded: true });
    const { rerender } = renderInMapContext(<Layer name="a" />, { driver });
    act(() => rerender(<Layer name="b" />));
    expect(factory).toHaveBeenCalledTimes(2);
    expect(driver.removeLayer).toHaveBeenCalledTimes(1);
  });

  it('deferMount：延后一拍 addLayer，卸载在挂载前可取消', () => {
    vi.useFakeTimers();
    const { Layer } = makeLayer({ deferMount: true });
    const driver = makeFakeDriver({ loaded: true });
    const { unmount } = renderInMapContext(<Layer name="a" />, { driver });
    // 尚未 flush 定时器 → 还没 add
    expect(driver.addLayer).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(0));
    expect(driver.addLayer).toHaveBeenCalledTimes(1);
    act(() => unmount());
    expect(driver.removeLayer).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('reuseHandle：props 不变时卸载再挂载复用同一实例', () => {
    const { Layer, factory } = makeLayer({ reuseHandle: true });
    const driver = makeFakeDriver({ loaded: true });
    const { unmount } = renderInMapContext(<Layer name="a" />, { driver });
    act(() => unmount());
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('卸载：removeLayer', () => {
    const { Layer } = makeLayer();
    const driver = makeFakeDriver({ loaded: true });
    const { unmount } = renderInMapContext(<Layer name="a" />, { driver });
    driver.removeLayer.mockClear();
    act(() => unmount());
    expect(driver.removeLayer).toHaveBeenCalledTimes(1);
  });
});
