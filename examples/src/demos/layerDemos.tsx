import React, { useCallback } from 'react';
import {
  GeoJSONLayer, DistrictLayer, TrafficLayer,
  FillLayer, DOMLayer,
  PointIconLayer, PointShapeLayer, PanoramaCoverageLayer,
} from 'react-bmap';
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

// ─── LineLayer / PixelLayer / BaiduLayer / ThreeLayer ───（暂时下掉）
// 这四个是 4.0+ 的额外图层，wrapper 由 createLayerComponent 生成，
// Options 只有 visible/opacity/minZoom/maxZoom/zIndex（LineLayer 多 style/idKey/crs/enablePicked），
// 既没有 data 属性、也不向外暴露原始实例，所以拿不到 setData 的入口——
// 写成 <LineLayer /> 只会得到一张空地图，不如不给页面。
// 恢复条件：先给这四个 wrapper 补上 data（参考 FeatureLayer 的 `data?: object` + rawRef.current.setData?.(data)），
// 再照 point-icon-layer 的写法补 demo，并在 examples/src/config/components.ts 里加回条目。
// 对应的 API 表已经在 examples/src/config/apiData.ts 就位（'line-layer' 等），无需重写。
