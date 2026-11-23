/**
 * 可视化图层测试页共享工具：随机 GeoJSON 生成、外部库 CDN 加载、事件日志面板。
 * 对齐 vue-bmap/test/src/pages/layer/geoHelper.ts 的用途（React 版）。
 */
import React, { useCallback, useState } from 'react';

export const C = { lng: 116.404, lat: 39.915 };

export function randomPointsData(count: number, withWeight = true) {
  const features = Array.from({ length: count }, (_, i) => ({
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: [116.34 + Math.random() * 0.14, 39.88 + Math.random() * 0.09] },
    properties: withWeight
      ? { id: i, name: `点${i}`, count: 1 + Math.floor(Math.random() * 100) }
      : { id: i, name: `点${i}` },
  }));
  return { type: 'FeatureCollection' as const, features };
}

export function randomLinesData(count: number) {
  const features = Array.from({ length: count }, (_, i) => {
    const lng0 = 116.34 + Math.random() * 0.14;
    const lat0 = 39.88 + Math.random() * 0.09;
    const coordinates = Array.from({ length: 4 }, () => [
      lng0 + (Math.random() - 0.5) * 0.05,
      lat0 + (Math.random() - 0.5) * 0.04,
    ]);
    return { type: 'Feature' as const, geometry: { type: 'LineString' as const, coordinates }, properties: { id: i, name: `线${i}` } };
  });
  return { type: 'FeatureCollection' as const, features };
}

export function randomPolygonsData(count: number) {
  const features = Array.from({ length: count }, (_, i) => {
    const lng0 = 116.34 + Math.random() * 0.14;
    const lat0 = 39.88 + Math.random() * 0.09;
    const w = 0.015 + Math.random() * 0.025;
    const h = 0.012 + Math.random() * 0.02;
    const ring = [[lng0, lat0], [lng0 + w, lat0], [lng0 + w, lat0 + h], [lng0, lat0 + h], [lng0, lat0]];
    return { type: 'Feature' as const, geometry: { type: 'Polygon' as const, coordinates: [ring] }, properties: { id: i, name: `区域${i}` } };
  });
  return { type: 'FeatureCollection' as const, features };
}

export function randomBarData(count: number) {
  const features = Array.from({ length: count }, (_, i) => ({
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: [116.34 + Math.random() * 0.14, 39.88 + Math.random() * 0.09] },
    properties: { id: i, name: `柱${i}`, value: Math.floor(Math.random() * 1000) },
  }));
  return { type: 'FeatureCollection' as const, features };
}

export function trackData(count = 40) {
  const coordinates = Array.from({ length: count }, (_, i) => [
    C.lng + Math.sin(i / 6) * 0.02,
    C.lat + Math.cos(i / 8) * 0.015,
  ]);
  return {
    type: 'Feature' as const,
    geometry: { type: 'LineString' as const, coordinates },
    properties: { id: 1, name: '演示轨迹', time: coordinates.map((_, i) => i * 2) },
  };
}

// ─── 事件日志 ───
export interface EventLogState {
  log: string[];
  push: (msg: string) => void;
  clear: () => void;
}

export function useEventLog(limit = 20): EventLogState {
  const [log, setLog] = useState<string[]>([]);
  const push = useCallback((msg: string) => {
    setLog((prev) => [`${new Date().toLocaleTimeString()} ${msg}`, ...prev].slice(0, limit));
  }, [limit]);
  const clear = useCallback(() => setLog([]), []);
  return { log, push, clear };
}

export function LogPanel({ state, hint }: { state: EventLogState; hint?: string }) {
  return (
    <div style={{ position: 'absolute', right: 10, bottom: 10, zIndex: 10, width: 320, maxHeight: 160, overflow: 'auto', background: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 8, fontSize: 11, boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <b>事件日志</b>
        <button onClick={state.clear} style={{ fontSize: 11 }}>clear</button>
      </div>
      {state.log.length === 0
        ? <span className="muted small">{hint ?? '暂无事件'}</span>
        : state.log.map((l, i) => <div key={i} style={{ fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l}</div>)}
    </div>
  );
}

// ─── 外部库 CDN 加载 ───
const THREE_CDN = 'https://unpkg.com/three@0.137.5/build/three.min.js';

let threePromise: Promise<void> | null = null;
export function loadThree(): Promise<void> {
  if ((globalThis as any).THREE) return Promise.resolve();
  if (threePromise) return threePromise;
  threePromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = THREE_CDN;
    s.onload = () => resolve();
    s.onerror = () => { threePromise = null; reject(new Error(`three.js 加载失败：${THREE_CDN}`)); };
    document.head.appendChild(s);
  });
  return threePromise;
}

// SDK 支持的最高版本是 deck.gl 8.9.x（9.x 不能共享地图 GL 上下文）
const DECK_CDN = 'https://unpkg.com/deck.gl@8.9.36/dist.min.js';

let deckPromise: Promise<void> | null = null;
export function loadDeck(): Promise<void> {
  if ((globalThis as any).deck?.Deck) return Promise.resolve();
  if (deckPromise) return deckPromise;
  deckPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = DECK_CDN;
    s.onload = () => resolve();
    s.onerror = () => { deckPromise = null; reject(new Error(`deck.gl 加载失败：${DECK_CDN}`)); };
    document.head.appendChild(s);
  });
  return deckPromise;
}
