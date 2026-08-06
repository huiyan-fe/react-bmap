import { useRef, useSyncExternalStore } from 'react';
import { useMapContext } from '../context/MapContext';
import type { Bounds, Point, Size } from '../types';

export interface MapSnapshot {
  center: Point | null;
  zoom: number | null;
  bounds: Bounds | null;
  size: Size | null;
  heading: number | null;
  tilt: number | null;
}

const NULL_SNAPSHOT: MapSnapshot = {
  center: null, zoom: null, bounds: null, size: null, heading: null, tilt: null,
};

/**
 * 订阅 Map 状态变化（DESIGN.md §6.1.1）。
 *
 * 关键：snapshot 必须用「值」比较而不是「引用」比较。
 * 每次 readSnapshot 都返回新对象，但只要 lng/lat/zoom 等值不变，就返回缓存的同一引用。
 *
 * 适配新 DESIGN.md §12：driver getter 不再返回 undefined。
 * 此处用 try/catch 包裹，driver 在 throw 模式下抛错时该字段降级为 null。
 * NaN 也视为 null（getter 不支持时 warn/ignore 模式返回 NaN）。
 */
export function useMapStatus(): MapSnapshot | null {
  const { map, driver } = useMapContext();
  const cachedRef = useRef<MapSnapshot | null>(null);
  const cachedKeyRef = useRef<string>('');

  return useSyncExternalStore(
    (callback) => {
      if (!map || !driver) return () => {};
      const events = ['moveend', 'zoomend', 'resize', 'headingchange', 'tiltchange', 'moving', 'tilesloaded'];
      const unsubs = events.map((evt) => driver.addEventListener(map, evt, callback));
      return () => unsubs.forEach((u) => u());
    },
    () => {
      if (!map || !driver) return null;
      const next = readSnapshot(map, driver);
      const key = snapshotKey(next);
      if (key === cachedKeyRef.current) return cachedRef.current;
      cachedKeyRef.current = key;
      cachedRef.current = next;
      return next;
    },
    () => null,
  );
}

/** 基于值的稳定 key（避免浮点抖动，保留 7 位小数；NaN 一致序列化为 'NaN'） */
function snapshotKey(s: MapSnapshot | null): string {
  if (!s) return '';
  const c = s.center;
  const b = s.bounds;
  const sz = s.size;
  const num = (n: number | null) => (n == null || Number.isNaN(n) ? 'null' : n.toFixed(3));
  return [
    c && !Number.isNaN(c.lng) ? `${c.lng.toFixed(7)},${c.lat.toFixed(7)}` : '',
    num(s.zoom),
    num(s.heading),
    num(s.tilt),
    b && !Number.isNaN(b.sw.lng) ? `${b.sw.lng.toFixed(5)},${b.sw.lat.toFixed(5)},${b.ne.lng.toFixed(5)},${b.ne.lat.toFixed(5)}` : '',
    sz ? `${sz.width.toFixed(0)}x${sz.height.toFixed(0)}` : '',
  ].join('|');
}

function readSnapshot(map: NonNullable<ReturnType<typeof useMapContext>['map']>, driver: NonNullable<ReturnType<typeof useMapContext>['driver']>): MapSnapshot {
  return {
    center: safePoint(() => driver.getCenter(map)),
    zoom: safeNum(() => driver.getZoom(map)),
    bounds: safeBounds(() => driver.getBounds(map)),
    size: safeSize(() => driver.getSize(map)),
    heading: safeNum(() => driver.getHeading(map)),
    tilt: safeNum(() => driver.getTilt(map)),
  };
}

function safePoint(fn: () => Point): Point | null {
  try {
    const p = fn();
    if (!p || Number.isNaN(p.lng) || Number.isNaN(p.lat)) return null;
    return p;
  } catch { return null; }
}

function safeNum(fn: () => number): number | null {
  try {
    const n = fn();
    return typeof n === 'number' && !Number.isNaN(n) ? n : null;
  } catch { return null; }
}

function safeBounds(fn: () => Bounds): Bounds | null {
  try {
    const b = fn();
    if (!b || Number.isNaN(b.sw.lng) || Number.isNaN(b.ne.lng)) return null;
    return b;
  } catch { return null; }
}

function safeSize(fn: () => Size): Size | null {
  try {
    const s = fn();
    if (!s) return null;
    return s;
  } catch { return null; }
}

// 抑制 unused
void NULL_SNAPSHOT;
