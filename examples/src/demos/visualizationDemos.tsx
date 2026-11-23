/**
 * 数据可视化图层 / 外部库图层 / 电动车路线 demo（对齐 vue-bmap 1.0.6 的 layerDemos / serviceDemos）。
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  HeatmapLayer, ClusterLayer, PointLayer, PolylineLayer, PolygonLayer, TextLayer, BarLayer,
  FlyLineLayer, TrackLine, ThreejsLayer, DeckglLayer, WebGLCustomLayer,
  useEBikeRoute, useMapReady,
} from '@baidumap/react-bmap';
import type { TrackLineRef } from '@baidumap/react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const C = { lng: 116.404, lat: 39.915 };

// ─── 随机 GeoJSON 生成（与 vue 示例一致）───
function randomPointsData(count: number, withWeight: boolean) {
  const features = Array.from({ length: count }, (_, i) => ({
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: [116.34 + Math.random() * 0.14, 39.88 + Math.random() * 0.09] },
    properties: withWeight ? { id: i, name: `点${i}`, count: 1 + Math.floor(Math.random() * 100) } : { id: i, name: `点${i}` },
  }));
  return { type: 'FeatureCollection' as const, features };
}

function randomLinesData(count: number) {
  const features = Array.from({ length: count }, (_, i) => {
    const lng0 = 116.34 + Math.random() * 0.14;
    const lat0 = 39.88 + Math.random() * 0.09;
    const coordinates = Array.from({ length: 4 }, () => [lng0 + (Math.random() - 0.5) * 0.05, lat0 + (Math.random() - 0.5) * 0.04]);
    return { type: 'Feature' as const, geometry: { type: 'LineString' as const, coordinates }, properties: { id: i, name: `线${i}` } };
  });
  return { type: 'FeatureCollection' as const, features };
}

function randomPolygonsData(count: number) {
  const features = Array.from({ length: count }, (_, i) => {
    const lng0 = 116.34 + Math.random() * 0.14;
    const lat0 = 39.88 + Math.random() * 0.09;
    const w = 0.015 + Math.random() * 0.025;
    const h = 0.012 + Math.random() * 0.02;
    return {
      type: 'Feature' as const,
      geometry: { type: 'Polygon' as const, coordinates: [[[lng0, lat0], [lng0 + w, lat0], [lng0 + w, lat0 + h], [lng0, lat0 + h], [lng0, lat0]]] },
      properties: { id: i, name: `区域${i}` },
    };
  });
  return { type: 'FeatureCollection' as const, features };
}

function randomBarData(count: number) {
  const features = Array.from({ length: count }, (_, i) => ({
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: [116.34 + Math.random() * 0.14, 39.88 + Math.random() * 0.09] },
    properties: { id: i, name: `柱${i}`, value: Math.floor(Math.random() * 1000) },
  }));
  return { type: 'FeatureCollection' as const, features };
}

function trackData(count: number) {
  const coordinates = Array.from({ length: count }, (_, i) => [C.lng + Math.sin(i / 6) * 0.02, C.lat + Math.cos(i / 8) * 0.015]);
  return { type: 'Feature' as const, geometry: { type: 'LineString' as const, coordinates }, properties: { id: 1, name: '演示轨迹', time: coordinates.map((_, i) => i * 2) } };
}

// 数据只生成一次：避免每次 render 产生新随机数据 → data 变化触发重复 setData / 重建
const HEATMAP_DATA = randomPointsData(300, true);
const CLUSTER_DATA = randomPointsData(2000, false);
const POINT_DATA = randomPointsData(200, false);
const LINE_DATA = randomLinesData(8);
const FLYLINE_DATA = randomLinesData(6);
const POLYGON_DATA = randomPolygonsData(6);
const TEXT_DATA = randomPointsData(150, false);
const BAR_DATA = randomBarData(80);
const TRACK_DATA = trackData(40);
const WEBGL_POINTS = Array.from({ length: 200 }, () => [C.lng + (Math.random() - 0.5) * 0.14, C.lat + (Math.random() - 0.5) * 0.09]);

// 示例站开箱即用：缺依赖时从 CDN 加载（组件本身仍不 import）
const THREE_CDN = 'https://unpkg.com/three@0.137.5/build/three.min.js';
const DECK_CDN = 'https://unpkg.com/deck.gl@8.9.36/dist.min.js';
function loadScriptOnce(src: string, check: () => boolean): Promise<void> {
  if (check()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`加载失败：${src}`));
    document.head.appendChild(s);
  });
}
const loadThree = () => loadScriptOnce(THREE_CDN, () => !!(globalThis as any).THREE);
const loadDeck = () => loadScriptOnce(DECK_CDN, () => !!(globalThis as any).deck?.Deck);

function hint(text: string) {
  return <div style={{ padding: 16, fontSize: 13, color: '#666' }}>{text}</div>;
}

// ─── HeatmapLayer ───
registerDemo('heatmap-layer', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <HeatmapLayer
        data={HEATMAP_DATA as any}
        size={30}
        opacity={0.9}
        gradient={{ 0: 'rgba(0, 90, 255, 1)', 0.5: 'rgba(0, 255, 120, 1)', 1: 'rgba(255, 0, 0, 1)' }}
        weightField="count"
      />
    </MapContainer>
  ),
  code: `import { Map, HeatmapLayer } from '@baidumap/react-bmap';

const data = { type: 'FeatureCollection', features: Array.from({ length: 300 }, (_, i) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [116.34 + Math.random() * 0.14, 39.88 + Math.random() * 0.09] },
  properties: { id: i, count: 1 + Math.floor(Math.random() * 100) },
})) };

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <HeatmapLayer data={data} size={30} opacity={0.9}
    gradient={{ 0: 'rgba(0,90,255,1)', 0.5: 'rgba(0,255,120,1)', 1: 'rgba(255,0,0,1)' }}
    weightField="count" />
</Map>`,
});

// ─── ClusterLayer ───
registerDemo('cluster-layer', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <ClusterLayer
        data={CLUSTER_DATA as any}
        clusterRadius={60}
        clusterMinPoints={2}
        onClick={(e: any) => {
          const v = e?.value;
          if (v?.isCluster) console.log(`聚合 ${v.pointCount} 个点`, v.latLng);
        }}
      />
    </MapContainer>
  ),
  code: `import { Map, ClusterLayer } from '@baidumap/react-bmap';

const data = { type: 'FeatureCollection', features: Array.from({ length: 2000 }, (_, i) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [116.34 + Math.random() * 0.14, 39.88 + Math.random() * 0.09] },
  properties: { id: i, name: '点' + i },
})) };

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <ClusterLayer data={data} clusterRadius={60} clusterMinPoints={2}
    onClick={(e) => { const v = e.value; if (v?.isCluster) console.log(v.pointCount, e.latLng); }} />
</Map>`,
});

// ─── PointLayer ───
registerDemo('point-layer', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <PointLayer
        data={POINT_DATA as any}
        shape="circle"
        size={18}
        fillColor="#1890ff"
        fillOpacity={0.8}
        strokeColor="#ffffff"
        strokeWeight={2}
      />
    </MapContainer>
  ),
  code: `import { Map, PointLayer } from '@baidumap/react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <PointLayer data={data} shape="circle" size={18}
    fillColor="#1890ff" fillOpacity={0.8}
    strokeColor="#ffffff" strokeWeight={2} />
</Map>`,
});

// ─── PolylineLayer ───
registerDemo('polyline-layer', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <PolylineLayer
        data={LINE_DATA as any}
        strokeColor="#3388ff"
        strokeWeight={4}
        strokeOpacity={0.9}
        strokeLineCap="round"
        strokeLineJoin="round"
      />
    </MapContainer>
  ),
  code: `import { Map, PolylineLayer } from '@baidumap/react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <PolylineLayer data={data} strokeColor="#3388ff" strokeWeight={4}
    strokeOpacity={0.9} strokeLineCap="round" strokeLineJoin="round" />
</Map>`,
});

// ─── PolygonLayer ───
registerDemo('polygon-layer', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <PolygonLayer
        data={POLYGON_DATA as any}
        fillColor="#1890ff"
        fillOpacity={0.25}
        strokeColor="#096dd9"
        strokeWeight={2}
        strokeOpacity={0.9}
      />
    </MapContainer>
  ),
  code: `import { Map, PolygonLayer } from '@baidumap/react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <PolygonLayer data={data} fillColor="#1890ff" fillOpacity={0.25}
    strokeColor="#096dd9" strokeWeight={2} strokeOpacity={0.9} />
</Map>`,
});

// ─── TextLayer ───
registerDemo('text-layer', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <TextLayer
        data={TEXT_DATA as any}
        text={(p: any) => String(p?.name ?? '')}
        fontSize={14}
        color="#1890ff"
        strokeColor="#ffffff"
        strokeWeight={2}
        fontWeight="bold"
        collides
        waitTime={100}
      />
    </MapContainer>
  ),
  code: `import { Map, TextLayer } from '@baidumap/react-bmap';

// text 可传字符串或 (properties) => string；不传时默认读 properties.text
<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <TextLayer data={data} text={(p) => p.name} fontSize={14} color="#1890ff"
    strokeColor="#ffffff" strokeWeight={2} fontWeight="bold"
    collides waitTime={100} />
</Map>`,
});

// ─── BarLayer ───
registerDemo('bar-layer', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <BarLayer
        data={BAR_DATA as any}
        color="rgba(0, 180, 0, 1)"
        size={1500}
        height={3000}
        edgeCount={50}
      />
    </MapContainer>
  ),
  code: `import { Map, BarLayer } from '@baidumap/react-bmap';

// unit 默认 'm'（size 单位是米）；切 unit='px' 时 size 应为像素量级
<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <BarLayer data={data} color="rgba(0,180,0,1)" size={1500} height={3000} edgeCount={50} />
</Map>`,
});

// ─── FlyLineLayer ───
registerDemo('fly-line-layer', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <FlyLineLayer data={FLYLINE_DATA as any} strokeColor="rgba(255, 71, 26, 0.9)" mode="arc" arcHeight={0.3} duration={2} />
    </MapContainer>
  ),
  code: `import { Map, FlyLineLayer } from '@baidumap/react-bmap';

// mode "arc" 取首末两点生成流动弧线
<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <FlyLineLayer data={data} strokeColor="rgba(255,71,26,0.9)"
    mode="arc" arcHeight={0.3} duration={2} />
</Map>`,
});

// ─── TrackLine ───
registerDemo('track-line', {
  Component: () => {
    const ref = useRef<TrackLineRef>(null);
    return (
      <MapContainer center={C} zoom={13} style={{ height: '100%' }}>
        <TrackLine
          ref={ref}
          data={TRACK_DATA as any}
          duration={30}
          autoStart
          autoFollow
          movePoint={{ type: 'ground', url: 'https://jsapi-demo.bj.bcebos.com/images/markers/car.png', size: [22, 44], adjustSize: true }}
        />
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 999, display: 'flex', gap: 8 }}>
          <button onClick={() => ref.current?.start()}>播放</button>
          <button onClick={() => ref.current?.resume()}>继续</button>
          <button onClick={() => ref.current?.pause()}>暂停</button>
          <button onClick={() => ref.current?.stop()}>停止</button>
        </div>
      </MapContainer>
    );
  },
  code: `import { useRef } from 'react';
import { Map, TrackLine, type TrackLineRef } from '@baidumap/react-bmap';

const points = Array.from({ length: 40 }, (_, i) => [
  center.lng + Math.sin(i / 6) * 0.02,
  center.lat + Math.cos(i / 8) * 0.015,
]);
const data = {
  type: 'Feature',
  geometry: { type: 'LineString', coordinates: points },
  properties: { id: 1, time: points.map((_, i) => i * 2) },
};

const trackRef = useRef<TrackLineRef>(null);
<Map center={center} zoom={13}>
  <TrackLine ref={trackRef} data={data} duration={30} autoStart autoFollow
    movePoint={{ type: 'ground', url: '.../car.png', size: [22, 44], adjustSize: true }} />
</Map>

trackRef.current?.start();  // resume / pause / stop`,
});

// ─── DeckglLayer（自动加载 CDN）───
registerDemo('deckgl-layer', {
  Component: () => {
    const [ready, setReady] = useState(!!(globalThis as any).deck?.Deck);
    const [error, setError] = useState('');
    useEffect(() => { loadDeck().then(() => setReady(true), (e: Error) => setError(e.message)); }, []);

    // hooks 必须在早退之前调用；用 useMemo 固定 data 引用，避免每次 render 都 setProps
    const deck = (globalThis as any).deck;
    const data = useMemo(() => {
      if (!ready || !deck?.ScatterplotLayer) return null;
      const points = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        lng: C.lng + (Math.random() - 0.5) * 0.14,
        lat: C.lat + (Math.random() - 0.5) * 0.09,
        radius: 40 + Math.random() * 60,
        color: [24 + Math.floor(Math.random() * 200), 90, 255],
      }));
      return {
        layers: [new deck.ScatterplotLayer({
          id: 'demo-scatter',
          data: points,
          getPosition: (d: any) => [d.lng, d.lat],
          getRadius: (d: any) => d.radius,
          getFillColor: (d: any) => d.color,
          stroked: true,
          getLineColor: [255, 255, 255],
          lineWidthMinPixels: 1,
          radiusMinPixels: 2,
          radiusMaxPixels: 60,
        })],
      };
    }, [ready, deck]);

    if (error) return hint(`deck.gl 加载失败：${error}。请宿主引入 8.9.x 全量包并挂到 window.deck。`);
    if (!ready || !data) return hint('正在加载 deck.gl（8.9.36 CDN）…');
    return (
      <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
        <DeckglLayer animation data={data} />
      </MapContainer>
    );
  },
  code: `import { Map, DeckglLayer } from '@baidumap/react-bmap';
import * as deck from 'deck.gl';   // 8.9.x 全量包
window.deck = deck;

// data 即 deck props（开放集合），变化走 setProps，不重建 Deck
<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <DeckglLayer animation data={{ layers: [new deck.ScatterplotLayer({ ... })] }} />
</Map>`,
});

// ─── ThreejsLayer（自动加载 CDN）───
registerDemo('threejs-layer', {
  Component: () => {
    const [ready, setReady] = useState(!!(globalThis as any).THREE);
    const [error, setError] = useState('');
    const meshRef = useRef<any>(null);
    useEffect(() => { loadThree().then(() => setReady(true), (e: Error) => setError(e.message)); }, []);
    if (error) return hint(`three.js 加载失败：${error}`);
    if (!ready) return hint('正在加载 three.js（0.137.5 CDN）…');
    return (
      <MapContainer center={C} zoom={16} style={{ height: '100%' }}>
        <ThreejsLayer
          antialias
          animation
          referCenter={C}
          zIndex={5}
          // animation 只负责每帧重绘，场景变化要在 preRender 里做
          preRender={() => { if (meshRef.current) meshRef.current.rotation.y += 0.03; }}
          onInit={(ctx) => {
            const THREE = (globalThis as any).THREE;
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(500, 500, 500), new THREE.MeshBasicMaterial({ color: 0x1890ff }));
            const [x, y] = ctx.projectToLayer([C.lng, C.lat]) as [number, number];
            mesh.position.set(x, y, 250);
            meshRef.current = mesh;
            (ctx.layer as any).add?.(mesh);
          }}
        />
      </MapContainer>
    );
  },
  code: `import { Map, ThreejsLayer } from '@baidumap/react-bmap';
import * as THREE from 'three';
window.THREE = THREE;

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={16}>
  <ThreejsLayer referCenter={center} animation antialias zIndex={5} onInit={(ctx) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(500, 500, 500),
      new THREE.MeshBasicMaterial({ color: 0x1890ff }));
    const [x, y] = ctx.projectToLayer([lng, lat]);
    mesh.position.set(x, y, 250);
    ctx.layer.add(mesh);
  }} />
</Map>`,
});

// ─── WebGLCustomLayer ───
const WEBGL_VS = `attribute vec2 a_pos;
uniform mat4 u_mvpMatrix;
uniform float u_size;
uniform float u_pixelRatio;
uniform float u_time;
void main() {
  float breathe = 0.85 + 0.15 * sin(u_time * 3.0);
  gl_Position = u_mvpMatrix * vec4(a_pos, 0.0, 1.0);
  gl_PointSize = u_size * u_pixelRatio * breathe;
}`;
const WEBGL_FS = `precision mediump float;
uniform vec4 u_color;
uniform float u_opacity;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.0, d) * u_color.a * u_opacity;
  gl_FragColor = vec4(u_color.rgb, alpha);
}`;

registerDemo('webgl-custom-layer', {
  Component: () => {
    return (
      <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
        <WebGLCustomLayer
          vertexShader={WEBGL_VS}
          fragmentShader={WEBGL_FS}
          referCenter={C}
          attributes={{ a_pos: { data: WEBGL_POINTS, type: 'lnglat' } }}
          uniforms={{ u_color: [0.1, 0.6, 1, 1], u_size: 18 }}
          draw={{ mode: 'POINTS' }}
          animation
        />
      </MapContainer>
    );
  },
  code: `import { Map, WebGLCustomLayer } from '@baidumap/react-bmap';

// attributes.type 'lnglat' 会按 referCenter 自动投影
<Map center={center} zoom={12}>
  <WebGLCustomLayer vertexShader={vs} fragmentShader={fs} referCenter={center}
    attributes={{ a_pos: { data: points, type: 'lnglat' } }}
    uniforms={{ u_color: [0.1, 0.6, 1, 1], u_size: 18 }}
    draw={{ mode: 'POINTS' }} animation />
</Map>`,
});

// ─── useEBikeRoute ───
function MapReady({ onReady }: { onReady: (m: any) => void }) {
  useMapReady(onReady);
  return null;
}

function EBikeDemo() {
  const [map, setMap] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [searched, setSearched] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [panelEl, setPanelEl] = useState<HTMLElement | null>(null);
  const panelCallbackRef = useCallback((el: HTMLDivElement | null) => { setPanelEl(el); }, []);
  const pendingSearchRef = useRef(false);
  const route = useEBikeRoute({
    location: '北京',
    renderOptions: { map: map ?? undefined, panel: panelEl ?? undefined, autoViewport: true },
    // 面板元素始终挂载（SDK 需要它写入结果），但搜索完成前 display:none，避免出现空白面板
    onSearchComplete: () => { setMsg('搜索完成'); setHasResult(true); },
  });
  const disabled = !map || route.loading;

  // 面板挂载（panelEl 就绪、service 已按新 renderOptions 重建）后再发起检索，
  // 保证首次搜索的结果能直接渲染到面板里。
  useEffect(() => {
    if (!searched || !panelEl || !map || !pendingSearchRef.current) return;
    pendingSearchRef.current = false;
    route.search({ lng: 116.404, lat: 39.915 }, { lng: 116.461, lat: 39.914 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searched, panelEl, map]);

  // 面板内的滚轮只用于滚动结果，阻止冒泡到地图（否则会触发地图缩放）。
  // 用原生非 passive 监听，确保在 map 容器的 bubble 监听之前截断。
  useEffect(() => {
    const el = panelEl;
    if (!el) return;
    const stop = (e: Event) => { e.stopPropagation(); };
    el.addEventListener('wheel', stop, { passive: false });
    el.addEventListener('mousewheel', stop, { passive: false });
    return () => {
      el.removeEventListener('wheel', stop);
      el.removeEventListener('mousewheel', stop);
    };
  }, [panelEl]);

  return (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <MapReady onReady={setMap} />
      <div style={{
        position: 'absolute', top: 12, left: 12, zIndex: 10,
        background: 'rgba(255,255,255,0.96)', padding: 12, borderRadius: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)', width: 300,
        maxHeight: 'calc(100% - 24px)',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>电动车路线</div>
        <div style={{ fontSize: 12, color: '#888' }}>天安门 → 国贸</div>
        <button
          disabled={disabled}
          onClick={() => {
            setSearched(true);
            setHasResult(false);
            setMsg('');
            pendingSearchRef.current = true;
          }}
          style={{
            padding: '6px 12px', fontSize: 13, border: 'none', borderRadius: 4,
            color: '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
            background: disabled ? '#a9c9ff' : '#3385ff',
            transition: 'background .2s',
          }}
        >
          {route.loading ? '搜索中…' : '开始搜索'}
        </button>
        {msg && <div style={{ fontSize: 12, color: '#52c41a' }}>{msg}</div>}

        {/* 点搜索后才显示；结果由 SDK 渲染到这里 */}
        {searched && (
          <div
            id="ebike-route-panel"
            ref={panelCallbackRef}
            onWheel={(e) => e.stopPropagation()}
            style={{
              display: hasResult ? 'block' : 'none',
              maxHeight: 360, minHeight: 80, overflowY: 'auto',
              overscrollBehavior: 'contain',
              borderTop: '1px solid #eee', paddingTop: 8, fontSize: 12,
            }}
          />
        )}
      </div>
    </MapContainer>
  );
}

registerDemo('e-bike-route', {
  Component: EBikeDemo,
  code: `import { useState } from 'react';
import { Map, useEBikeRoute, useMapReady } from '@baidumap/react-bmap';

function MapReady({ onReady }) { useMapReady(onReady); return null; }

function Demo() {
  const [map, setMap] = useState(null);
  const [panelEl, setPanelEl] = useState(null);
  const { search, loading } = useEBikeRoute({
    location: '北京',
    // panel 传 DOM 元素，路线结果由 SDK 渲染到该容器
    renderOptions: { map, panel: panelEl ?? undefined, autoViewport: true },
  });
  return (
    <Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
      <MapReady onReady={setMap} />
      <div style={{ position: 'absolute', top: 12, left: 12, width: 300 }}>
        <button disabled={!map || loading}
          onClick={() => search({ lng: 116.404, lat: 39.915 }, { lng: 116.461, lat: 39.914 })}>search</button>
        {/* 结果面板放在按钮下方 */}
        <div ref={setPanelEl} style={{ marginTop: 8, maxHeight: 300, overflowY: 'auto' }} />
      </div>
    </Map>
  );
}`,
});
