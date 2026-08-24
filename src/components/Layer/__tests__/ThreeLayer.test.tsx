/**
 * ThreeLayer 的不变式测试。
 *
 * 这个组件是手写的（不走 createLayerComponent 工厂），最容易回归的一条是
 * 「改一个非构造期 prop 把用户的 three.js 场景整个销毁重建」——症状是场景里的
 * 物体无声消失，tsc 和其它用例都接不住，所以这里把它钉死：
 * ctorKey 只含 alpha / antialias / 是否接了 onRender，其余全走 setter。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRef } from 'react';
import { ThreeLayer } from '../ThreeLayer';
import type { ThreeLayerRef } from '../ThreeLayer';
import { renderInMapContext } from '../../../__tests__/renderWithMap';
import { makeFakeDriver } from '../../../__tests__/fakeDriver';
import { installFakeSDK, uninstallFakeSDK } from '../../../__tests__/fakeSDK';

/** SDK ThreeLayer 实例替身：组件通过 layerHandle.raw 拿到它并直接调 setXxx */
function makeRaw() {
  return {
    scene: { tag: 'scene' },
    camera: { tag: 'camera' },
    renderer: { render: vi.fn() },
    // toWorld 走的是 map.toFormatCoords，不是坏掉的 convertLngLat
    map: { toFormatCoords: vi.fn(() => [[123, 456]]) },
    add: vi.fn(),
    remove: vi.fn(),
    triggerRepaint: vi.fn(),
    triggerStop: vi.fn(),
    refreshMap: vi.fn(),
    pick: vi.fn(() => ['mesh']),
    setVisible: vi.fn(),
    setMinZoom: vi.fn(),
    setMaxZoom: vi.fn(),
    setZIndex: vi.fn(),
    setOpacity: vi.fn(),
    setRefCenter: vi.fn(),
  };
}

/** fakeDriver 的 Proxy 兜底只会返回 undefined，createThreeLayer 必须显式 stub */
function setup() {
  const driver = makeFakeDriver({ loaded: true });
  const created: Array<{ opts: Record<string, any>; raw: ReturnType<typeof makeRaw> }> = [];
  driver.createThreeLayer = vi.fn((opts: Record<string, any>) => {
    const raw = makeRaw();
    created.push({ opts, raw });
    return { __brand: 'layer', type: 'threeLayer', raw, id: created.length };
  });
  return { driver, created };
}

const last = <T,>(arr: T[]): T => arr[arr.length - 1];

beforeEach(() => {
  (globalThis as any).THREE = { tag: 'three' };
  installFakeSDK();
});

afterEach(() => {
  delete (globalThis as any).THREE;
  uninstallFakeSDK();
  vi.restoreAllMocks();
});

// 注意：这条必须留在文件最前面。warnedMissingThree 是模块级一次性开关，
// 后面任何用例先把它烧掉，这里就断言不到那一条 warn 了。
describe('window.THREE 缺失', () => {
  it('跳过创建并只警告一次', () => {
    delete (globalThis as any).THREE;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { driver, created } = setup();

    const { rerender } = renderInMapContext(<ThreeLayer />, { driver });
    // 换 ctorKey 让创建 effect 再跑一次，验证警告不会重复刷屏
    rerender(<ThreeLayer alpha />);

    expect(created).toHaveLength(0);
    expect(driver.createThreeLayer).not.toHaveBeenCalled();
    const hits = warn.mock.calls.filter((c) => String(c[0]).includes('需要宿主工程自行引入 three.js'));
    expect(hits).toHaveLength(1);
  });
});

describe('挂载与销毁', () => {
  it('带上构造参数创建并加进地图', () => {
    const { driver, created } = setup();
    renderInMapContext(
      <ThreeLayer antialias visible minZoom={5} maxZoom={18} zIndex={7} />,
      { driver },
    );

    expect(driver.createThreeLayer).toHaveBeenCalledTimes(1);
    expect(driver.addLayer).toHaveBeenCalledTimes(1);
    const { opts } = last(created);
    expect(opts).toMatchObject({ antialias: true, visible: true, minZoom: 5, maxZoom: 18, zIndex: 7 });
    // 没传 onRender 就不能挂 wrapper：SDK 里这是 if/else，挂了默认渲染就没了
    expect(opts.onRender).toBeUndefined();
  });

  it('卸载时移除图层并清空句柄上的实例', () => {
    const { driver } = setup();
    const ref = createRef<ThreeLayerRef>();
    const { unmount } = renderInMapContext(<ThreeLayer ref={ref} />, { driver });

    // React 会在 unmount 时把 ref.current 置空，所以先把句柄本身抓在手里
    const handle = ref.current!;
    expect(handle.raw).not.toBeNull();

    unmount();
    expect(driver.removeLayer).toHaveBeenCalledTimes(1);
    expect(handle.raw).toBeNull();
  });
});

describe('ctorKey：什么会重建、什么只走 setter', () => {
  it('visible / minZoom / maxZoom / zIndex 变化只调 setter，不重建', () => {
    const { driver, created } = setup();
    const { rerender } = renderInMapContext(
      <ThreeLayer visible minZoom={4} maxZoom={20} zIndex={1} />,
      { driver },
    );
    const { raw } = last(created);

    rerender(<ThreeLayer visible={false} minZoom={6} maxZoom={17} zIndex={9} />);

    // setter effect 在挂载时也会带初值跑一遍，所以看「最后一次」
    expect(raw.setVisible).toHaveBeenLastCalledWith(false);
    expect(raw.setMinZoom).toHaveBeenLastCalledWith(6);
    expect(raw.setMaxZoom).toHaveBeenLastCalledWith(17);
    expect(raw.setZIndex).toHaveBeenLastCalledWith(9);
    expect(driver.createThreeLayer).toHaveBeenCalledTimes(1);
    expect(driver.removeLayer).not.toHaveBeenCalled();
  });

  it('换回调不重建，且 wrapper 调的是最新那个', () => {
    const { driver, created } = setup();
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderInMapContext(<ThreeLayer onInit={first} />, { driver });
    const { opts, raw } = last(created);

    rerender(<ThreeLayer onInit={second} />);
    expect(driver.createThreeLayer).toHaveBeenCalledTimes(1);

    // SDK 是 hook.bind(this)(renderer, scene, camera)
    opts.onInit.call(raw, raw.renderer, raw.scene, raw.camera);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    // 第 4 个参数是命令式句柄，箭头函数拿不到 this 时靠它
    expect(second.mock.calls[0][3].scene).toBe(raw.scene);
  });

  it('alpha 变化必须重建（它在 onAdd 时被烧进 WebGLRenderer）', () => {
    const { driver } = setup();
    const { rerender } = renderInMapContext(<ThreeLayer alpha={false} />, { driver });
    rerender(<ThreeLayer alpha />);

    expect(driver.createThreeLayer).toHaveBeenCalledTimes(2);
    expect(driver.removeLayer).toHaveBeenCalledTimes(1);
  });
});

describe('onRender', () => {
  it('从无到有会重建，wrapper 把渲染完全交给用户', () => {
    const { driver, created } = setup();
    const { rerender } = renderInMapContext(<ThreeLayer />, { driver });
    expect(last(created).opts.onRender).toBeUndefined();

    const onRender = vi.fn();
    rerender(<ThreeLayer onRender={onRender} />);
    expect(driver.createThreeLayer).toHaveBeenCalledTimes(2);

    const { opts, raw } = last(created);
    opts.onRender.call(raw, raw.renderer, raw.scene, raw.camera);
    expect(onRender).toHaveBeenCalledTimes(1);
    expect(raw.renderer.render).not.toHaveBeenCalled();
  });

  it('运行期把 onRender 撤掉时兜底走默认渲染', () => {
    const { driver, created } = setup();
    const onRender = vi.fn();
    const { rerender } = renderInMapContext(<ThreeLayer onRender={onRender} />, { driver });
    const { opts, raw } = last(created);

    // 重建后的新图层不带 onRender，但旧 wrapper 可能还被 SDK 的 animate 持有
    rerender(<ThreeLayer />);
    opts.onRender.call(raw, raw.renderer, raw.scene, raw.camera);
    expect(onRender).not.toHaveBeenCalled();
    expect(raw.renderer.render).toHaveBeenCalledWith(raw.scene, raw.camera);
  });
});

describe('命令式句柄', () => {
  it('转发实例上的场景对象与方法', () => {
    const { driver, created } = setup();
    const ref = createRef<ThreeLayerRef>();
    renderInMapContext(<ThreeLayer ref={ref} />, { driver });
    const { raw } = last(created);
    const handle = ref.current!;

    expect(handle.scene).toBe(raw.scene);
    expect(handle.camera).toBe(raw.camera);
    expect(handle.renderer).toBe(raw.renderer);

    const mesh = { tag: 'mesh' };
    handle.add(mesh);
    handle.remove(mesh);
    handle.triggerRepaint();
    handle.triggerStop();
    handle.refreshMap();
    expect(raw.add).toHaveBeenCalledWith(mesh);
    expect(raw.remove).toHaveBeenCalledWith(mesh);
    expect(raw.triggerRepaint).toHaveBeenCalledTimes(1);
    expect(raw.triggerStop).toHaveBeenCalledTimes(1);
    expect(raw.refreshMap).toHaveBeenCalledTimes(1);
    expect(handle.pick(1, 2)).toEqual(['mesh']);
  });

  it('toWorld 走 map.toFormatCoords，出错时返回 null', () => {
    const { driver, created } = setup();
    const ref = createRef<ThreeLayerRef>();
    renderInMapContext(<ThreeLayer ref={ref} />, { driver });
    const { raw } = last(created);
    const handle = ref.current!;

    expect(handle.toWorld({ lng: 116, lat: 39 })).toEqual([123, 456]);
    expect(raw.map.toFormatCoords).toHaveBeenCalledWith([[116, 39]]);

    raw.map.toFormatCoords.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    // 异常走 debugWarn，这里只是别让它污染测试输出
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(handle.toWorld({ lng: 116, lat: 39 })).toBeNull();
  });
});

describe('opacity（对本图层无效）', () => {
  it('照样喂给 SDK，但整个挂载周期只警告一次', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { driver, created } = setup();
    const { rerender } = renderInMapContext(<ThreeLayer opacity={1} />, { driver });
    const { raw } = last(created);

    rerender(<ThreeLayer opacity={0.6} />);
    rerender(<ThreeLayer opacity={0.2} />);

    expect(raw.setOpacity).toHaveBeenLastCalledWith(0.2);
    expect(driver.createThreeLayer).toHaveBeenCalledTimes(1);
    const hits = warn.mock.calls.filter((c) => String(c[0]).includes('opacity 对本图层无效'));
    expect(hits).toHaveLength(1);
  });

  it('不传 opacity 时不警告、不调 setOpacity', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { driver, created } = setup();
    renderInMapContext(<ThreeLayer zIndex={2} />, { driver });

    expect(last(created).raw.setOpacity).not.toHaveBeenCalled();
    expect(warn.mock.calls.filter((c) => String(c[0]).includes('opacity 对本图层无效'))).toHaveLength(0);
  });
});

describe('referCenter', () => {
  it('转成真的 SDK Point 再喂给 setRefCenter，且不重建', () => {
    const { driver, created } = setup();
    const { rerender } = renderInMapContext(
      <ThreeLayer referCenter={{ lng: 116, lat: 39 }} />,
      { driver },
    );
    const { raw } = last(created);

    rerender(<ThreeLayer referCenter={{ lng: 117, lat: 40 }} />);

    // SDK 的 setRefCenter 要求 instanceof Point，普通对象会被静默忽略
    expect(raw.setRefCenter).toHaveBeenLastCalledWith(
      expect.objectContaining({ lng: 117, lat: 40, __brand: 'point' }),
    );
    expect(driver.createThreeLayer).toHaveBeenCalledTimes(1);
  });
});
