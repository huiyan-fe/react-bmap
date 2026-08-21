import { vi } from 'vitest';

// ── 假 driver ──────────────────────────────────────────────
// 组件从 useMapContext() 拿 { map, driver }，不直接碰 SDK。
// 这里造一个替身：显式 stub 常用方法，其余用 Proxy 兜底自动返回 vi.fn()，
// 避免"漏 stub 一个方法就抛错"。事件用 listeners map + __emit 手动触发。

export interface FakeDriver {
  // eslint 无关：测试替身，用宽松类型
  [key: string]: any;
  __emit: (type: string, e?: unknown) => void;
  __listeners: Record<string, Array<(e?: unknown) => void>>;
}

export interface MakeFakeDriverOptions {
  loaded?: boolean;
  version?: string;
  capabilities?: Iterable<string>;
}

export function makeFakeDriver(options: MakeFakeDriverOptions = {}): FakeDriver {
  const { loaded = false, version = '4.0', capabilities = [] } = options;
  const listeners: Record<string, Array<(e?: unknown) => void>> = {};

  let handleSeq = 0;
  const makeHandle = (type: string) => ({ __brand: type, type, raw: { type }, id: ++handleSeq });

  const base: Record<string, unknown> = {
    version,
    capabilities: new Set<string>(capabilities),
    isLoaded: vi.fn(() => loaded),

    // ── Map 生命周期 ──
    createMap: vi.fn(() => makeHandle('map')),
    destroyMap: vi.fn(),
    centerAndZoom: vi.fn(),
    getCenter: vi.fn(() => ({ lng: 0, lat: 0 })),
    getZoom: vi.fn(() => 11),
    getHeading: vi.fn(() => 0),
    getTilt: vi.fn(() => 0),
    getBounds: vi.fn(() => ({ sw: { lng: 0, lat: 0 }, ne: { lng: 1, lat: 1 } })),
    getSize: vi.fn(() => ({ width: 800, height: 600 })),
    setCenter: vi.fn(),
    setZoom: vi.fn(),
    setHeading: vi.fn(),
    setTilt: vi.fn(),
    setMinZoom: vi.fn(),
    setMaxZoom: vi.fn(),
    setMapType: vi.fn(),
    setDefaultCursor: vi.fn(),
    setDraggingCursor: vi.fn(),
    setTheme: vi.fn(),
    setMapStyle: vi.fn(),
    setMapStyleV2: vi.fn(),

    // ── Overlay 生命周期 ──
    createMarker: vi.fn(() => makeHandle('marker')),
    createMarker3D: vi.fn(() => makeHandle('marker3d')),
    createPolyline: vi.fn(() => makeHandle('polyline')),
    createIcon: vi.fn(() => makeHandle('icon')),
    createSymbol: vi.fn(() => makeHandle('symbol')),
    addOverlay: vi.fn(),
    removeOverlay: vi.fn(),
    addHotspot: vi.fn(),
    removeHotspot: vi.fn(),
    setOverlayOptions: vi.fn(),
    snapshotOverlayOptions: vi.fn(() => ({})),
    restoreOverlayOptions: vi.fn(),
    showOverlay: vi.fn(),
    hideOverlay: vi.fn(),
    setOverlayPosition: vi.fn(),
    setOverlayPath: vi.fn(),

    // ── 控件 / 图层 ──
    createNavigationControl: vi.fn(() => makeHandle('control')),
    createControl: vi.fn(() => makeHandle('control')),
    addControl: vi.fn(),
    removeControl: vi.fn(),
    hideControl: vi.fn(),
    showControl: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),

    // ── 事件 ──
    addEventListener: vi.fn(
      (_target: unknown, type: string, cb: (e?: unknown) => void) => {
        (listeners[type] ??= []).push(cb);
        return () => {
          const arr = listeners[type];
          if (!arr) return;
          const i = arr.indexOf(cb);
          if (i >= 0) arr.splice(i, 1);
        };
      },
    ),
    removeEventListener: vi.fn(),

    // ── 测试辅助 ──
    __listeners: listeners,
    __emit: (type: string, e?: unknown) => {
      (listeners[type] ?? []).slice().forEach((cb) => cb(e));
    },
  };

  // Proxy 兜底：未显式 stub 的 driver 方法自动懒创建 vi.fn()，读到就缓存
  return new Proxy(base, {
    get(t, k: string) {
      if (k in t) return t[k];
      const fn = vi.fn();
      t[k] = fn;
      return fn;
    },
  }) as unknown as FakeDriver;
}
