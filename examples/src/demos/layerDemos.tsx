import React, { useCallback } from 'react';
import {
  GeoJSONLayer, DistrictLayer, TrafficLayer,
  FillLayer, DOMLayer,
  PointIconLayer, PointShapeLayer, PanoramaCoverageLayer,
  NavigationControl,
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
    { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[116.395, 39.910], [116.410, 39.910], [116.410, 39.920], [116.395, 39.920], [116.395, 39.910]]] }, properties: { id: 1, name: '区域A' } },
    { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[116.415, 39.915], [116.430, 39.915], [116.430, 39.925], [116.415, 39.925], [116.415, 39.915]]] }, properties: { id: 2, name: '区域B' } },
  ],
};

// ─── GeoJSONLayer ───
registerDemo('geojson-layer', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <GeoJSONLayer
        dataSource={POINT_DATA as any}
        markerStyle={{ title: 'GeoJSON 点' }}
        polylineStyle={{ strokeColor: '#1890ff', strokeWeight: 3, strokeOpacity: 0.9 }}
        polygonStyle={{ strokeColor: '#ff6600', strokeWeight: 2, fillColor: '#ff660033', fillOpacity: 0.5 }}
      />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, GeoJSONLayer } from 'react-bmap';

const data = { type: 'FeatureCollection', features: [...] };

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <GeoJSONLayer dataSource={data}
    markerStyle={{ title: '点' }}
    polylineStyle={{ strokeColor: '#1890ff', strokeWeight: 3 }}
    polygonStyle={{ strokeColor: '#ff6600', fillColor: '#ff660033' }} />
</Map>`,
});

// ─── DistrictLayer ───
registerDemo('district-layer', {
  Component: () => (
    <MapContainer center={C} zoom={8} style={{ height: '100%' }}>
      <DistrictLayer name="北京市" strokeColor="#1890ff" fillColor="#1890ff22" />
      <NavigationControl />
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
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <TrafficLayer />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, TrafficLayer } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <TrafficLayer />
</Map>`,
});

// ─── WMSLayer（仅代码，无在线示例） ───
registerDemo('wms-layer', {
  code: `import { Map, WMSLayer } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={10}>
  <WMSLayer url="https://your-wms-server.com/wms"
    params={{ LAYERS: 'mrds', FORMAT: 'image/png', TRANSPARENT: 'true' }} />
</Map>`,
});

// ─── WMTSLayer（仅代码，无在线示例） ───
registerDemo('wmts-layer', {
  code: `import { Map, WMTSLayer } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={10}>
  <WMTSLayer url="https://your-wmts-server.com/wmts"
    params={{ LAYER: 'World_Imagery', TILEMATRIXSET: 'default028mm', FORMAT: 'image/png' }} />
</Map>`,
});

// ─── XYZLayer（仅代码，无在线示例） ───
registerDemo('xyz-layer', {
  code: `import { Map, XYZLayer } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={10}>
  <XYZLayer tileUrlTemplate="https://your-tile-server.com/[z]/[x]/[y].png" />
</Map>`,
});

// ─── MVTLayer（仅代码，无在线示例） ───
registerDemo('mvt-layer', {
  code: `import { Map, MVTLayer } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={10}>
  <MVTLayer tileUrlTemplate="https://your-mvt-server.com/[z]/[x]/[y].pbf" />
</Map>`,
});

// ─── FillLayer ───
registerDemo('fill-layer', {
  Component: () => (
    <MapContainer center={C} zoom={13} style={{ height: '100%' }}>
      <FillLayer
        border
        enablePicked
        idKey="id"
        style={{ fillColor: 'rgba(24, 144, 255, 0.4)', strokeColor: '#1890ff', strokeWeight: 2, strokeStyle: 'solid' } as any}
        data={POLYGON_DATA as any}
      />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, FillLayer } from 'react-bmap';

const data = { type: 'FeatureCollection', features: [
  { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[...]]] }, properties: { id: 1 } },
]};

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={13}>
  <FillLayer border enablePicked idKey="id"
    style={{ fillColor: 'rgba(24, 144, 255, 0.4)', strokeColor: '#1890ff', strokeWeight: 2 }}
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
      <MapContainer center={C} zoom={14} style={{ height: '100%' }}>
        <DOMLayer createDOM={createDOM} data={POINT_DATA as any} minZoom={5} maxZoom={20} />
        <NavigationControl />
      </MapContainer>
    );
  },
  code: `import { Map, DOMLayer } from 'react-bmap';

const data = { type: 'FeatureCollection', features: [
  { type: 'Feature', geometry: { type: 'Point', coordinates: [116.404, 39.915] }, properties: { name: '天安门' } },
]};

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={14}>
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
    <MapContainer center={C} zoom={14} style={{ height: '100%' }}>
      <PointIconLayer
        isFlat
        isFixed
        idKey="id"
        style={{ icon: 'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_1.png', sizes: [25, 25], scale: 1, rotation: 0, opacity: 1 } as any}
        data={POINT_DATA as any}
      />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, PointIconLayer } from 'react-bmap';

const data = { type: 'FeatureCollection', features: [...] };

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={14}>
  <PointIconLayer isFlat isFixed idKey="id"
    style={{ icon: 'https://example.com/icon.png', sizes: [25, 25] }}
    data={data} />
</Map>`,
});

// ─── PointShapeLayer ───
registerDemo('point-shape-layer', {
  Component: () => (
    <MapContainer center={C} zoom={14} style={{ height: '100%' }}>
      <PointShapeLayer
        idKey="id"
        style={{ shapeType: 1, size: 20, color: '#1890ff', opacity: 1, strokeColor: '#fff', strokeWeight: 0, rotation: 0 } as any}
        data={POINT_DATA as any}
      />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, PointShapeLayer } from 'react-bmap';

// shapeType: 1=圆形 2=三角形 3=方形 4=菱形 5=六边形 7=五角星
const data = { type: 'FeatureCollection', features: [...] };

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={14}>
  <PointShapeLayer idKey="id"
    style={{ shapeType: 1, size: 20, color: '#1890ff' }}
    data={data} />
</Map>`,
});

// ─── PanoramaCoverageLayer ───
registerDemo('panorama-coverage-layer', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <PanoramaCoverageLayer />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, PanoramaCoverageLayer } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <PanoramaCoverageLayer />
</Map>`,
});

// ─── LineLayer ───
registerDemo('line-layer', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <LineLayer />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, LineLayer } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <LineLayer />
</Map>`,
});

// ─── PixelLayer ───
registerDemo('pixel-layer', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <PixelLayer />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, PixelLayer } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <PixelLayer />
</Map>`,
});

// ─── BaiduLayer ───
registerDemo('baidu-layer', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <BaiduLayer />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, BaiduLayer } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <BaiduLayer />
</Map>`,
});

// ─── ThreeLayer ───
registerDemo('three-layer', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <ThreeLayer />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, ThreeLayer } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <ThreeLayer />
</Map>`,
});
