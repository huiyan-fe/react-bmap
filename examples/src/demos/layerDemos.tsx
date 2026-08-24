import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  GeoJSONLayer, DistrictLayer, TrafficLayer,
  FillLayer, DOMLayer,
  PointIconLayer, PointShapeLayer, PanoramaCoverageLayer,
  ThreeLayer,
} from 'react-bmap';
import type { ThreeLayerRef } from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const C = { lng: 116.404, lat: 39.915 };

// ─── 共享 GeoJSON 数据 ───
const POINT_DATA = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.404, 39.915] }, properties: { id: 1, name: '天安门' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.415, 39.910] }, properties: { id: 2, name: '故宫' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.397, 39.913] }, properties: { id: 3, name: '中山公园' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.417, 39.928] }, properties: { id: 4, name: '北海公园' } },
  ],
};

const POLYGON_DATA = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[116.355, 39.888], [116.436, 39.888], [116.436, 39.942], [116.355, 39.942], [116.355, 39.888]]] }, properties: { id: 1, name: '区域A' } },
    { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[116.463, 39.915], [116.544, 39.915], [116.544, 39.969], [116.463, 39.969], [116.463, 39.915]]] }, properties: { id: 2, name: '区域B' } },
  ],
};

// ─── GeoJSONLayer ───
registerDemo('geojson-layer', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <GeoJSONLayer
        dataSource={POINT_DATA as any}
        markerStyle={{ title: 'GeoJSON 点' }}
        polylineStyle={{ strokeColor: '#1890ff', strokeWeight: 6, strokeOpacity: 0.9 }}
        polygonStyle={{ strokeColor: '#ff6600', strokeWeight: 4, fillColor: '#ff660033', fillOpacity: 0.5 }}
      />
    </MapContainer>
  ),
  code: `import { Map, GeoJSONLayer } from 'react-bmap';

const data = { type: 'FeatureCollection', features: [...] };

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <GeoJSONLayer dataSource={data}
    markerStyle={{ title: '点' }}
    polylineStyle={{ strokeColor: '#1890ff', strokeWeight: 6 }}
    polygonStyle={{ strokeColor: '#ff6600', fillColor: '#ff660033' }} />
</Map>`,
});

// ─── DistrictLayer ───
registerDemo('district-layer', {
  Component: () => (
    <MapContainer center={C} zoom={8} style={{ height: '100%' }}>
      <DistrictLayer name="北京市" strokeColor="#1890ff" fillColor="#1890ff22" />
    </MapContainer>
  ),
  code: `import { Map, DistrictLayer } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={8}>
  <DistrictLayer name="北京市" strokeColor="#1890ff" fillColor="#1890ff22" />
</Map>`,
});

// ─── TrafficLayer ───
registerDemo('traffic-layer', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <TrafficLayer />
    </MapContainer>
  ),
  code: `import { Map, TrafficLayer } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <TrafficLayer />
</Map>`,
});

// ─── FillLayer ───
registerDemo('fill-layer', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <FillLayer
        border
        enablePicked
        idKey="id"
        style={{ fillColor: 'rgba(24, 144, 255, 0.4)', strokeColor: '#1890ff', strokeWeight: 4, strokeStyle: 'solid' } as any}
        data={POLYGON_DATA as any}
      />
    </MapContainer>
  ),
  code: `import { Map, FillLayer } from 'react-bmap';

const data = { type: 'FeatureCollection', features: [
  { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[...]]] }, properties: { id: 1 } },
]};

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <FillLayer border enablePicked idKey="id"
    style={{ fillColor: 'rgba(24, 144, 255, 0.4)', strokeColor: '#1890ff', strokeWeight: 4 }}
    data={data} />
</Map>`,
});

// ─── DOMLayer ───
registerDemo('dom-layer', {
  Component: () => {
    const createDOM = useCallback((properties: any) => {
      const div = document.createElement('div');
      div.style.cssText = 'background:#1890ff;color:#fff;padding:4px 8px;border-radius:4px;font-size:13px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);';
      div.textContent = properties?.name ?? '';
      return div;
    }, []);
    return (
      <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
        <DOMLayer createDOM={createDOM} data={POINT_DATA as any} minZoom={5} maxZoom={20} />
      </MapContainer>
    );
  },
  code: `import { Map, DOMLayer } from 'react-bmap';

const data = { type: 'FeatureCollection', features: [
  { type: 'Feature', geometry: { type: 'Point', coordinates: [116.404, 39.915] }, properties: { name: '天安门' } },
]};

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <DOMLayer createDOM={(props) => {
    const div = document.createElement('div');
    div.textContent = props.name;
    return div;
  }} data={data} />
</Map>`,
});

// ─── PointIconLayer ───
registerDemo('point-icon-layer', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <PointIconLayer
        isFlat
        isFixed
        idKey="id"
        style={{ icon: 'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_1.png', sizes: [40, 40], scale: 1, rotation: 0, opacity: 1 } as any}
        data={POINT_DATA as any}
      />
    </MapContainer>
  ),
  code: `import { Map, PointIconLayer } from 'react-bmap';

const data = { type: 'FeatureCollection', features: [...] };

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <PointIconLayer isFlat isFixed idKey="id"
    style={{ icon: 'https://example.com/icon.png', sizes: [40, 40] }}
    data={data} />
</Map>`,
});

// ─── PointShapeLayer ───
registerDemo('point-shape-layer', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <PointShapeLayer
        idKey="id"
        style={{ shapeType: 1, size: 40, color: '#1890ff', opacity: 1, strokeColor: '#fff', strokeWeight: 0, rotation: 0 } as any}
        data={POINT_DATA as any}
      />
    </MapContainer>
  ),
  code: `import { Map, PointShapeLayer } from 'react-bmap';

// shapeType: 1=圆形 2=三角形 3=方形 4=菱形 5=六边形 7=五角星
const data = { type: 'FeatureCollection', features: [...] };

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <PointShapeLayer idKey="id"
    style={{ shapeType: 1, size: 40, color: '#1890ff' }}
    data={data} />
</Map>`,
});

// ─── PanoramaCoverageLayer ───
registerDemo('panorama-coverage-layer', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <PanoramaCoverageLayer />
    </MapContainer>
  ),
  code: `import { Map, PanoramaCoverageLayer } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <PanoramaCoverageLayer />
</Map>`,
});

// ─── ThreeLayer ───
// 本库不依赖 three，SDK 又要求 window.THREE 必须先就位（构造函数第一行就是 if (!window.THREE) throw，
// 异常被工厂吞掉后图层静默变成 null），所以这里按需从 CDN 注入，就绪前不渲染 <ThreeLayer>。
// r150+ 已移除 build/three.min.js，固定用最后一个带 UMD 全局的版本。
const THREE_CDN = 'https://unpkg.com/three@0.137.5/build/three.min.js';

let threePromise: Promise<void> | null = null;

function loadThree(): Promise<void> {
  if ((window as any).THREE) return Promise.resolve();
  if (threePromise) return threePromise;
  threePromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = THREE_CDN;
    script.async = true;
    script.onload = () => ((window as any).THREE ? resolve() : reject(new Error('脚本已加载但 window.THREE 不存在')));
    script.onerror = () => reject(new Error(`three.js 加载失败：${THREE_CDN}`));
    document.head.appendChild(script);
  });
  threePromise = threePromise.catch((err) => { threePromise = null; throw err; });
  return threePromise;
}

const Hint = ({ text }: { text: string }) => (
  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 14 }}>
    {text}
  </div>
);

registerDemo('three-layer', {
  Component: () => {
    const layerRef = useRef<ThreeLayerRef>(null);
    const [ready, setReady] = useState(() => !!(window as any).THREE);
    const [error, setError] = useState('');

    useEffect(() => {
      if (ready) return;
      loadThree().then(() => setReady(true), (e: Error) => setError(e.message));
    }, [ready]);

    // onInit 在 GL 就绪后触发，第 4 个参数就是 ref 拿到的那个句柄
    const onInit = useCallback((_r: any, _s: any, _c: any, layer: ThreeLayerRef) => {
      const THREE = (window as any).THREE;
      const world = layer.toWorld(C);
      if (!THREE || !world) return;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(500, 500, 500),
        new THREE.MeshBasicMaterial({ color: 0x1890ff }),
      );
      const [x, y] = world;
      mesh.position.set(x, y, 250); // z 轴朝天，底面贴地
      layer.add(mesh);
      // add 只 doOnceDraw 一次，animate() 在 needsUpdate 为假时直接 return，必须补一次重绘
      layer.triggerRepaint();
    }, []);

    if (error) return <Hint text={error} />;
    if (!ready) return <Hint text="three.js 加载中…" />;
    return (
      // 世界坐标单位约等于米：500 米的盒子在 zoom 11 只有几个像素，这里用 16
      <MapContainer center={C} zoom={16} style={{ height: '100%' }}>
        <ThreeLayer ref={layerRef} antialias zIndex={5} onInit={onInit} />
      </MapContainer>
    );
  },
  code: `import { useRef } from 'react';
import { Map, ThreeLayer } from 'react-bmap';
import type { ThreeLayerRef } from 'react-bmap';

// three.js 由宿主工程自己引入，且必须挂到 window.THREE 上（SDK 直接读全局）
import * as THREE from 'three';
window.THREE = THREE;

const center = { lng: 116.404, lat: 39.915 };
const layerRef = useRef<ThreeLayerRef>(null);

<Map center={center} zoom={16}>
  <ThreeLayer
    ref={layerRef}
    antialias
    zIndex={5}
    onInit={(renderer, scene, camera, layer) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(500, 500, 500),
        new THREE.MeshBasicMaterial({ color: 0x1890ff }),
      );
      // toWorld 走 map.toFormatCoords（实例上的 convertLngLat 在 v4 里是坏的）
      const [x, y] = layer.toWorld(center)!;
      mesh.position.set(x, y, 250);
      layer.add(mesh);
      layer.triggerRepaint();  // 不调这一下 animate() 直接 return，画面不更新
    }}
  />
</Map>

// 场景后续变化走 ref 句柄，不必重建图层：
// layerRef.current.add(mesh) / .remove(mesh) / .pick(x, y) / .triggerRepaint()`,
});

// ─── LineLayer / PixelLayer / BaiduLayer ───（暂时下掉）
// 这三个是 4.0+ 的额外图层，wrapper 由 createLayerComponent 生成，
// Options 只有 visible/opacity/minZoom/maxZoom/zIndex（LineLayer 多 style/idKey/crs/enablePicked），
// 既没有 data 属性、也不向外暴露原始实例，所以拿不到 setData 的入口——
// 写成 <LineLayer /> 只会得到一张空地图，不如不给页面。
// 恢复条件：先给这三个 wrapper 补上 data（参考 FeatureLayer 的 `data?: object` + rawRef.current.setData?.(data)），
// 再照 point-icon-layer 的写法补 demo，并在 examples/src/config/components.ts 里加回条目。
// 对应的 API 表已经在 examples/src/config/apiData.ts 就位（'line-layer' 等），无需重写。
