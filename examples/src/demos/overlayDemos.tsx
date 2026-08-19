import React, { useEffect, useState } from 'react';
import {
  Marker, Label, Polyline, Polygon, Circle, Rectangle,
  BezierCurve, Prism, GroundOverlay, GroundPoint, PointCollection,
  InfoWindow, Symbol, Icon, IconSequence, CustomOverlay,
  Marker3D, MapMask, SimpleInfoWindow, PlaceDetail,
  ScaleControl,
  useDriver,
  BMAP_ANCHOR_TOP_LEFT, BMAP_ANCHOR_TOP_RIGHT,
  BMAP_POINT_SHAPE_CIRCLE,
  BMap_Symbol_SHAPE_FORWARD_OPEN_ARROW,
} from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const C = { lng: 116.404, lat: 39.915 };

// ─── Marker ───
registerDemo('marker', {
  title: '基础用法',
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <Marker position={C} />
    </MapContainer>
  ),
  code: `import { Map, Marker } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <Marker position={{ lng: 116.404, lat: 39.915 }} />
</Map>`,
});

registerDemo('marker', {
  title: '自定义图标',
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <Marker position={C} icon={{ url: 'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_1.png', size: { width: 48, height: 48 } }} />
    </MapContainer>
  ),
  code: `import { Map, Marker } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <Marker position={{ lng: 116.404, lat: 39.915 }}
    icon={{ url: 'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_1.png', size: { width: 48, height: 48 } }} />
</Map>`,
});

// ─── Label ───
// styles 是键值对形式的 CSS，直接写在 SDK 生成的 DOM 上，所以样式都在这里调
const labelBase: Record<string, string | number> = {
  padding: '6px 12px',
  fontSize: 16,
  lineHeight: '24px',
  textAlign: 'center',
  borderRadius: 4,
  backgroundColor: '#fff',
  borderColor: '#ccc',
  color: '#333',
};

registerDemo('label', {
  title: '基础用法',
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <Label position={C} content="天安门" width={120} styles={labelBase} />
    </MapContainer>
  ),
  code: `import { Map, Label } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <Label position={{ lng: 116.404, lat: 39.915 }} content="天安门" width={120}
    styles={{ padding: '6px 12px', fontSize: 16, borderRadius: 4,
      backgroundColor: '#fff', borderColor: '#ccc', color: '#333' }} />
</Map>`,
});

registerDemo('label', {
  title: '多个标注与自定义样式',
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <Label
        position={C}
        content="天安门"
        width={100}
        offset={{ width: -50, height: -38 }}
        styles={{ ...labelBase, color: '#1890ff', borderColor: '#1890ff' }}
      />
      <Label
        position={{ lng: 116.44, lat: 39.915 }}
        content="王府井"
        width={100}
        offset={{ width: -50, height: -38 }}
        styles={{ ...labelBase, color: '#52c41a', borderColor: '#52c41a' }}
      />
      <Label
        position={{ lng: 116.38, lat: 39.885 }}
        content="前门"
        width={100}
        offset={{ width: -50, height: -38 }}
        styles={{ ...labelBase, color: '#fff', backgroundColor: '#1890ff', borderColor: '#1890ff' }}
      />
    </MapContainer>
  ),
  code: `import { Map, Label } from 'react-bmap';

// offset 以 position 为基准偏移，负值可把标签挪到点位上方居中
const base = { padding: '6px 12px', fontSize: 16, borderRadius: 4, backgroundColor: '#fff' };

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <Label position={{ lng: 116.404, lat: 39.915 }} content="天安门" width={100}
    offset={{ width: -50, height: -38 }}
    styles={{ ...base, color: '#1890ff', borderColor: '#1890ff' }} />
  <Label position={{ lng: 116.44, lat: 39.915 }} content="王府井" width={100}
    offset={{ width: -50, height: -38 }}
    styles={{ ...base, color: '#52c41a', borderColor: '#52c41a' }} />
  <Label position={{ lng: 116.38, lat: 39.885 }} content="前门" width={100}
    offset={{ width: -50, height: -38 }}
    styles={{ ...base, color: '#fff', backgroundColor: '#1890ff', borderColor: '#1890ff' }} />
</Map>`,
});

// ─── Polyline ───
registerDemo('polyline', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <Polyline
        path={[C, { lng: 116.485, lat: 39.996 }, { lng: 116.566, lat: 39.915 }]}
        strokeColor="#1890ff"
        strokeWeight={9}
        strokeOpacity={0.8}
      />
    </MapContainer>
  ),
  code: `import { Map, Polyline } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <Polyline
    path={[{ lng: 116.404, lat: 39.915 }, { lng: 116.485, lat: 39.996 }, { lng: 116.566, lat: 39.915 }]}
    strokeColor="#1890ff" strokeWeight={9} strokeOpacity={0.8} />
</Map>`,
});

// ─── Polygon ───
registerDemo('polygon', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <Polygon
        path={[C, { lng: 116.485, lat: 39.996 }, { lng: 116.566, lat: 39.915 }]}
        strokeColor="#ff6600"
        fillColor="#ff660033"
        strokeWeight={6}
      />
    </MapContainer>
  ),
  code: `import { Map, Polygon } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <Polygon
    path={[{ lng: 116.404, lat: 39.915 }, { lng: 116.485, lat: 39.996 }, { lng: 116.566, lat: 39.915 }]}
    strokeColor="#ff6600" fillColor="#ff660033" strokeWeight={6} />
</Map>`,
});

// ─── Circle ───
registerDemo('circle', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <Circle center={C} radius={5400} strokeColor="#1890ff" fillColor="#1890ff22" strokeWeight={4} />
      <ScaleControl />
    </MapContainer>
  ),
  code: `import { Map, Circle } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <Circle center={{ lng: 116.404, lat: 39.915 }} radius={5400}
    strokeColor="#1890ff" fillColor="#1890ff22" strokeWeight={4} />
</Map>`,
});

// ─── Rectangle ───
registerDemo('rectangle', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <Rectangle
        bounds={{ sw: { lng: 116.262, lat: 39.785 }, ne: { lng: 116.55, lat: 40.045 } }}
        strokeColor="#52c41a" fillColor="#52c41a22" strokeWeight={4}
      />
      <ScaleControl />
    </MapContainer>
  ),
  code: `import { Map, Rectangle } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <Rectangle
    bounds={{ sw: { lng: 116.262, lat: 39.785 }, ne: { lng: 116.55, lat: 40.045 } }}
    strokeColor="#52c41a" fillColor="#52c41a22" strokeWeight={4} />
</Map>`,
});

// ─── BezierCurve ───
// SDK 的 BezierCurve 是二阶贝塞尔：每段只吃一个控制点，controlPoints 组数 = path.length - 1
registerDemo('bezier-curve', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <BezierCurve
        path={[C, { lng: 116.55, lat: 40.045 }]}
        controlPoints={[[{ lng: 116.391, lat: 40.061 }]]}
        strokeColor="#722ed1" strokeWeight={8}
      />
    </MapContainer>
  ),
  code: `import { Map, BezierCurve } from 'react-bmap';

// 二阶贝塞尔：每段一个控制点，所以 controlPoints 有 path.length - 1 组
<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <BezierCurve
    path={[{ lng: 116.404, lat: 39.915 }, { lng: 116.55, lat: 40.045 }]}
    controlPoints={[[{ lng: 116.391, lat: 40.061 }]]}
    strokeColor="#722ed1" strokeWeight={8} />
</Map>`,
});

// ─── Prism ───
registerDemo('prism', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }} tilt={60}>
      <Prism
        path={[C, { lng: 116.489, lat: 39.98 }, { lng: 116.359, lat: 39.98 }]}
        altitude={2000}
        topFillColor="#ff6600" topFillOpacity={0.9}
        sideFillColor="#ff9955" sideFillOpacity={0.7}
      />
    </MapContainer>
  ),
  code: `import { Map, Prism } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11} tilt={60}>
  <Prism
    path={[{ lng: 116.404, lat: 39.915 }, { lng: 116.489, lat: 39.98 }, { lng: 116.359, lat: 39.98 }]}
    altitude={2000} topFillColor="#ff6600" topFillOpacity={0.9}
    sideFillColor="#ff9955" sideFillOpacity={0.7} />
</Map>`,
});

// ─── GroundOverlay ───
registerDemo('ground-overlay', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <GroundOverlay
        bounds={{ sw: { lng: 116.229, lat: 39.802 }, ne: { lng: 116.586, lat: 40.028 } }}
        url="https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_all.png"
        opacity={0.8}
      />
      <ScaleControl />
    </MapContainer>
  ),
  code: `import { Map, GroundOverlay } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <GroundOverlay
    bounds={{ sw: { lng: 116.229, lat: 39.802 }, ne: { lng: 116.586, lat: 40.028 } }}
    url="https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_all.png"
    opacity={0.8} />
</Map>`,
});

// ─── GroundPoint ───
registerDemo('ground-point', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }} tilt={75} heading={30}>
      <GroundPoint point={C} url="https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_all.png" size={{ width: 96, height: 96 }} level={11} />
      <GroundPoint point={{ lng: 116.489, lat: 39.98 }} url="https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_all.png" size={{ width: 96, height: 96 }} level={11} scale={1.5} rotation={45} />
    </MapContainer>
  ),
  code: `import { Map, GroundPoint } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11} tilt={75} heading={30}>
  <GroundPoint point={{ lng: 116.404, lat: 39.915 }}
    url="https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_all.png"
    size={{ width: 96, height: 96 }} level={11} />
  <GroundPoint point={{ lng: 116.489, lat: 39.98 }}
    url="https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_all.png"
    size={{ width: 96, height: 96 }} level={11} scale={1.5} rotation={45} />
</Map>`,
});

// ─── PointCollection ───
registerDemo('point-collection', {
  Component: () => {
    const pts = Array.from({ length: 50 }, (_, i) => ({
      lng: 116.21 + Math.random() * 0.388,
      lat: 39.785 + Math.random() * 0.26,
    }));
    return (
      <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
        <PointCollection points={pts} shape={BMAP_POINT_SHAPE_CIRCLE} color="#ff6600" size={8} />
      </MapContainer>
    );
  },
  code: `import { Map, PointCollection, BMAP_POINT_SHAPE_CIRCLE } from 'react-bmap';

const pts = Array.from({ length: 50 }, () => ({
  lng: 116.21 + Math.random() * 0.388,
  lat: 39.785 + Math.random() * 0.26,
}));

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <PointCollection points={pts} shape={BMAP_POINT_SHAPE_CIRCLE} color="#ff6600" size={8} />
</Map>`,
});

// ─── InfoWindow ───
// ─── InfoWindow ───
registerDemo('info-window', {
  title: '自动打开',
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <InfoWindow position={C} title="天安门" content="北京市东城区东长安街" />
    </MapContainer>
  ),
  code: `import { Map, InfoWindow } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <InfoWindow position={{ lng: 116.404, lat: 39.915 }}
    title="天安门" content="北京市东城区东长安街" />
</Map>`,
});

registerDemo('info-window', {
  title: '点击 Marker 控制开关',
  Component: () => {
    const [open, setOpen] = useState(false);
    return (
      <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
        <Marker position={C} onClick={() => setOpen(!open)} />
        <InfoWindow position={C} title="天安门" content="<b>天安门</b><br/>北京市东城区" visible={open} />
      </MapContainer>
    );
  },
  code: `import { Map, Marker, InfoWindow } from 'react-bmap';

function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
      <Marker position={{ lng: 116.404, lat: 39.915 }} onClick={() => setOpen(!open)} />
      <InfoWindow position={{ lng: 116.404, lat: 39.915 }}
        title="天安门" content="<b>天安门</b><br/>北京市东城区" visible={open} />
    </Map>
  );
}`,
});

// ─── Symbol ───
registerDemo('symbol', {
  Component: () => {
    return (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <Marker
        position={C}
        icon={{
          symbol: {
            path: "M10 0 C10 5.52 5.52 10 0 10 C5.52 10 10 14.48 10 20 C10 14.48 14.48 10 20 10 C14.48 10 10 5.52 10 0 Z",
            fillColor: "#1890ff",
            fillOpacity: 0.8,
            strokeColor: "#fff",
            strokeWeight: 3,
            scale: 2.5,
          }
        }}
      />
    </MapContainer>
    );
  },
  code: `import { Map, Marker } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <Marker position={{ lng: 116.404, lat: 39.915 }}
    icon={{
      symbol: {
        // SVG path 或 SDK 预设形状常量（BMap_Symbol_SHAPE_CIRCLE 等）
        path: "M10 0 C10 5.52 5.52 10 0 10 C5.52 10 10 14.48 10 20 C10 14.48 14.48 10 20 10 C14.48 10 10 5.52 10 0 Z",
        fillColor: "#1890ff",
        fillOpacity: 0.8,
        strokeColor: "#fff",
        strokeWeight: 3,
        scale: 2.5,
      }
    }} />
</Map>`,
});

// ─── Icon ───
registerDemo('icon', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <Marker
        position={C}
        icon={{
          url: "https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_1.png",
          size: { width: 48, height: 48 },
        }}
      />
    </MapContainer>
  ),
  code: `import { Map, Marker } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <Marker position={{ lng: 116.404, lat: 39.915 }}
    icon={{
      url: "https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_1.png",
      size: { width: 48, height: 48 },
    }} />
</Map>`,
});

// ─── IconSequence ───
// IconSequence 是值对象且 skipMount：直接写成 JSX 不会调 addOverlay，地图上什么都看不到。
// 真实用法是 useDriver() 创建后传给 Polyline 的 icons。
const SEQ_PATH = Array.from({ length: 25 }, (_, i) => {
  const t = i / 24;
  return { lng: 116.19 + t * 0.43, lat: 39.9 + Math.sin(t * Math.PI) * 0.075 };
});

const ArrowLine: React.FC = () => {
  const driver = useDriver();
  const [icons, setIcons] = useState<unknown[]>([]);

  useEffect(() => {
    if (!driver) return;
    const symbol = driver.createSymbol(BMap_Symbol_SHAPE_FORWARD_OPEN_ARROW, {
      scale: 0.55,
      strokeColor: '#fff',
      strokeWeight: 2,
    });
    if (!symbol) return;
    // offset：首个符号距起点的位置；repeat：符号间距；fixedRotation：图标跟随线走向
    const seq = driver.createIconSequence(symbol, '0%', '8%', true);
    if (seq) setIcons([seq]);
  }, [driver]);

  return <Polyline path={SEQ_PATH} icons={icons} strokeColor="#1890ff" strokeWeight={8} strokeOpacity={0.9} />;
};

registerDemo('icon-sequence', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <ArrowLine />
    </MapContainer>
  ),
  code: `import { useEffect, useState } from 'react';
import { Map, Polyline, useDriver, BMap_Symbol_SHAPE_FORWARD_OPEN_ARROW } from 'react-bmap';

const path = Array.from({ length: 25 }, (_, i) => {
  const t = i / 24;
  return { lng: 116.19 + t * 0.43, lat: 39.9 + Math.sin(t * Math.PI) * 0.075 };
});

// 注意：<IconSequence /> 是值对象（skipMount），直接渲染不会出现在地图上；
// 4.0 起已废弃，新代码建议用 Polyline 的 strokeTexture 代替。
function ArrowLine() {
  const driver = useDriver();
  const [icons, setIcons] = useState([]);

  useEffect(() => {
    if (!driver) return;
    const symbol = driver.createSymbol(BMap_Symbol_SHAPE_FORWARD_OPEN_ARROW, {
      scale: 0.55, strokeColor: '#fff', strokeWeight: 2,
    });
    if (!symbol) return;
    // offset：首个符号距起点的位置；repeat：符号间距；fixedRotation：图标跟随线走向
    const seq = driver.createIconSequence(symbol, '0%', '8%', true);
    if (seq) setIcons([seq]);
  }, [driver]);

  return <Polyline path={path} icons={icons} strokeColor="#1890ff" strokeWeight={8} strokeOpacity={0.9} />;
}

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <ArrowLine />
</Map>`,
});

// ─── CustomOverlay ───
registerDemo('custom-overlay', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <CustomOverlay point={C} offsetY={-20}>
        <div style={{ background: '#1890ff', color: '#fff', padding: '8px 16px', borderRadius: 6, fontSize: 17, whiteSpace: 'nowrap' }}>
          自定义 HTML 覆盖物
        </div>
      </CustomOverlay>
    </MapContainer>
  ),
  code: `import { Map, CustomOverlay } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <CustomOverlay point={{ lng: 116.404, lat: 39.915 }} offsetY={-20}>
    <div style={{ background: '#1890ff', color: '#fff', padding: '8px 16px', borderRadius: 6, fontSize: 17 }}>
      自定义 HTML 覆盖物
    </div>
  </CustomOverlay>
</Map>`,
});

// ─── Marker3D ───
registerDemo('marker-3d', {
  Component: () => (
    <MapContainer defaultCenter={C} defaultZoom={11} style={{ height: '100%' }}>
      <Marker3D position={C} height={300} shape={1} size={120} fillColor="#1890ff" fillOpacity={0.8} />
      <Marker3D position={{ lng: 116.489, lat: 39.98 }} height={450} shape={1} size={120} fillColor="#ff6600" fillOpacity={0.8} />
    </MapContainer>
  ),
  code: `import { Map, Marker3D } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11} tilt={60}>
  <Marker3D position={{ lng: 116.404, lat: 39.915 }} height={300} shape={1} size={120} fillColor="#1890ff" fillOpacity={0.8} />
  <Marker3D position={{ lng: 116.489, lat: 39.98 }} height={450} shape={1} size={120} fillColor="#ff6600" fillOpacity={0.8} />
</Map>`,
});

// ─── MapMask ───
registerDemo('map-mask', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <MapMask
        bounds={{ sw: { lng: 116.229, lat: 39.802 }, ne: { lng: 116.586, lat: 40.028 } }}
        showRegion="outside"
        isBuildingMask
        isPoiMask
        isMapMask
      />
    </MapContainer>
  ),
  code: `import { Map, MapMask } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <MapMask
    bounds={{ sw: { lng: 116.229, lat: 39.802 }, ne: { lng: 116.586, lat: 40.028 } }}
    showRegion="outside" isBuildingMask isPoiMask isMapMask />
</Map>`,
});

// ─── SimpleInfoWindow ───
registerDemo('simple-info-window', {
  Component: () => {
    const [open, setOpen] = useState(true);
    return (
      <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
        <Marker position={C} onClick={() => setOpen(!open)} />
        <SimpleInfoWindow
          position={C}
          content="天安门广场"
          open={open}
        />
      </MapContainer>
    );
  },
  code: `import { Map, Marker, SimpleInfoWindow } from 'react-bmap';

function Demo() {
  const [open, setOpen] = useState(true);
  return (
    <Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
      <Marker position={{ lng: 116.404, lat: 39.915 }} onClick={() => setOpen(!open)} />
      <SimpleInfoWindow position={{ lng: 116.404, lat: 39.915 }}
        content="天安门广场" open={open} />
    </Map>
  );
}`,
});

// ─── PlaceDetail ───
registerDemo('place-detail-overlay', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <Marker position={C}>
        <PlaceDetail uid="06d2dffda107b0ef89f15db6" open={true} />
      </Marker>
    </MapContainer>
  ),
  code: `import { Map, Marker, PlaceDetail } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <Marker position={{ lng: 116.404, lat: 39.915 }}>
    <PlaceDetail uid="06d2dffda107b0ef89f15db6" open={true} />
  </Marker>
</Map>`,
});
