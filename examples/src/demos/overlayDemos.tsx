import React, { useState } from 'react';
import {
  Marker, Label, Polyline, Polygon, Circle, Rectangle,
  BezierCurve, Prism, GroundOverlay, GroundPoint, PointCollection,
  InfoWindow, Symbol, Icon, IconSequence, Hotspot, CustomOverlay,
  Marker3D, MapMask, SimpleInfoWindow, PlaceDetail,
  NavigationControl, ScaleControl,
  BMAP_ANCHOR_TOP_LEFT, BMAP_ANCHOR_TOP_RIGHT,
  BMAP_POINT_SHAPE_CIRCLE,
} from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const C = { lng: 116.404, lat: 39.915 };

// ─── Marker ───
registerDemo('marker', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <Marker position={C} />
      <Marker position={{ lng: 116.5, lat: 39.9 }} icon={{ url: 'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_1.png', size: { width: 30, height: 30 } }} />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, Marker } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <Marker position={{ lng: 116.404, lat: 39.915 }} />
  <Marker position={{ lng: 116.5, lat: 39.9 }}
    icon={{ url: 'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_1.png', size: { width: 30, height: 30 } }} />
</Map>`,
});

// ─── Label ───
registerDemo('label', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <Label position={C} content="天安门" width={80} styles={{ color: '#333', borderColor: '#ccc', backgroundColor: '#fff', padding: '2px 6px' }} />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, Label } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <Label position={{ lng: 116.404, lat: 39.915 }} content="天安门" width={80}
    styles={{ color: '#333', borderColor: '#ccc', backgroundColor: '#fff' }} />
</Map>`,
});

// ─── Polyline ───
registerDemo('polyline', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <Polyline
        path={[C, { lng: 116.414, lat: 39.925 }, { lng: 116.424, lat: 39.915 }]}
        strokeColor="#1890ff"
        strokeWeight={5}
        strokeOpacity={0.8}
      />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, Polyline } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <Polyline
    path={[{ lng: 116.404, lat: 39.915 }, { lng: 116.414, lat: 39.925 }, { lng: 116.424, lat: 39.915 }]}
    strokeColor="#1890ff" strokeWeight={5} strokeOpacity={0.8} />
</Map>`,
});

// ─── Polygon ───
registerDemo('polygon', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <Polygon
        path={[C, { lng: 116.414, lat: 39.925 }, { lng: 116.424, lat: 39.915 }]}
        strokeColor="#ff6600"
        fillColor="#ff660033"
        strokeWeight={3}
      />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, Polygon } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <Polygon
    path={[{ lng: 116.404, lat: 39.915 }, { lng: 116.414, lat: 39.925 }, { lng: 116.424, lat: 39.915 }]}
    strokeColor="#ff6600" fillColor="#ff660033" strokeWeight={3} />
</Map>`,
});

// ─── Circle ───
registerDemo('circle', {
  Component: () => (
    <MapContainer center={C} zoom={13} style={{ height: '100%' }}>
      <Circle center={C} radius={500} strokeColor="#1890ff" fillColor="#1890ff22" strokeWeight={2} />
      <ScaleControl />
    </MapContainer>
  ),
  code: `import { Map, Circle } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={13}>
  <Circle center={{ lng: 116.404, lat: 39.915 }} radius={500}
    strokeColor="#1890ff" fillColor="#1890ff22" strokeWeight={2} />
</Map>`,
});

// ─── Rectangle ───
registerDemo('rectangle', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <Rectangle
        bounds={{ sw: { lng: 116.39, lat: 39.90 }, ne: { lng: 116.42, lat: 39.93 } }}
        strokeColor="#52c41a" fillColor="#52c41a22" strokeWeight={2}
      />
      <ScaleControl />
    </MapContainer>
  ),
  code: `import { Map, Rectangle } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <Rectangle
    bounds={{ sw: { lng: 116.39, lat: 39.90 }, ne: { lng: 116.42, lat: 39.93 } }}
    strokeColor="#52c41a" fillColor="#52c41a22" strokeWeight={2} />
</Map>`,
});

// ─── BezierCurve ───
registerDemo('bezier-curve', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <BezierCurve
        path={[C, { lng: 116.42, lat: 39.93 }]}
        controlPoints={[[{ lng: 116.41, lat: 39.92 }, { lng: 116.415, lat: 39.925 }]]}
        strokeColor="#722ed1" strokeWeight={4}
      />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, BezierCurve } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <BezierCurve
    path={[{ lng: 116.404, lat: 39.915 }, { lng: 116.42, lat: 39.93 }]}
    controlPoints={[[{ lng: 116.41, lat: 39.92 }, { lng: 116.415, lat: 39.925 }]]}
    strokeColor="#722ed1" strokeWeight={4} />
</Map>`,
});

// ─── Prism ───
registerDemo('prism', {
  Component: () => (
    <MapContainer center={C} zoom={14} style={{ height: '100%' }} tilt={60}>
      <Prism
        path={[C, { lng: 116.41, lat: 39.92 }, { lng: 116.40, lat: 39.92 }]}
        altitude={200}
        strokeColor="#ff6600" fillColor="#ff660088"
      />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, Prism } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={14} tilt={60}>
  <Prism
    path={[{ lng: 116.404, lat: 39.915 }, { lng: 116.41, lat: 39.92 }, { lng: 116.40, lat: 39.92 }]}
    altitude={200} strokeColor="#ff6600" fillColor="#ff660088" />
</Map>`,
});

// ─── GroundOverlay ───
registerDemo('ground-overlay', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <GroundOverlay
        bounds={{ sw: { lng: 116.38, lat: 39.90 }, ne: { lng: 116.43, lat: 39.93 } }}
        url="https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_all.png"
        opacity={0.8}
      />
      <ScaleControl />
    </MapContainer>
  ),
  code: `import { Map, GroundOverlay } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <GroundOverlay
    bounds={{ sw: { lng: 116.38, lat: 39.90 }, ne: { lng: 116.43, lat: 39.93 } }}
    url="https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_all.png"
    opacity={0.8} />
</Map>`,
});

// ─── GroundPoint ───
registerDemo('ground-point', {
  Component: () => (
    <MapContainer center={C} zoom={14} style={{ height: '100%' }} tilt={60}>
      <GroundPoint point={C} height={100} url="https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_all.png" size={{ width: 30, height: 30 }} fillColor="#1890ff" />
      <GroundPoint point={{ lng: 116.41, lat: 39.92 }} height={150} url="https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_all.png" size={{ width: 30, height: 30 }} fillColor="#ff6600" />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, GroundPoint } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={14} tilt={60}>
  <GroundPoint point={{ lng: 116.404, lat: 39.915 }} height={100}
    url="https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_all.png"
    size={{ width: 30, height: 30 }} fillColor="#1890ff" />
  <GroundPoint point={{ lng: 116.41, lat: 39.92 }} height={150}
    url="https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_all.png"
    size={{ width: 30, height: 30 }} fillColor="#ff6600" />
</Map>`,
});

// ─── PointCollection ───
registerDemo('point-collection', {
  Component: () => {
    const pts = Array.from({ length: 50 }, (_, i) => ({
      lng: 116.38 + Math.random() * 0.05,
      lat: 39.90 + Math.random() * 0.03,
    }));
    return (
      <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
        <PointCollection points={pts} shape={BMAP_POINT_SHAPE_CIRCLE} color="#ff6600" size={2} />
        <NavigationControl />
      </MapContainer>
    );
  },
  code: `import { Map, PointCollection, BMAP_POINT_SHAPE_CIRCLE } from 'react-bmap';

const pts = Array.from({ length: 50 }, () => ({
  lng: 116.38 + Math.random() * 0.05,
  lat: 39.90 + Math.random() * 0.03,
}));

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <PointCollection points={pts} shape={BMAP_POINT_SHAPE_CIRCLE} color="#ff6600" size={2} />
</Map>`,
});

// ─── InfoWindow ───
registerDemo('info-window', {
  Component: () => {
    const [open, setOpen] = useState(true);
    return (
      <MapContainer center={C} zoom={13} style={{ height: '100%' }}>
        <Marker position={C} onClick={() => setOpen(!open)} />
        <InfoWindow position={C} content="<b>天安门</b><br/>北京市东城区" visible={open} />
        <NavigationControl />
      </MapContainer>
    );
  },
  code: `import { Map, Marker, InfoWindow } from 'react-bmap';

function Demo() {
  const [open, setOpen] = useState(true);
  return (
    <Map center={{ lng: 116.404, lat: 39.915 }} zoom={13}>
      <Marker position={{ lng: 116.404, lat: 39.915 }} onClick={() => setOpen(!open)} />
      <InfoWindow position={{ lng: 116.404, lat: 39.915 }}
        content="<b>天安门</b><br/>北京市东城区" visible={open} />
    </Map>
  );
}`,
});

// ─── Symbol ───
registerDemo('symbol', {
  Component: () => {
    return (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <Marker
        position={C}
        icon={{
          symbol: {
            shapeType: "M10 0 C10 5.52 5.52 10 0 10 C5.52 10 10 14.48 10 20 C10 14.48 14.48 10 20 10 C14.48 10 10 5.52 10 0 Z",
            fillColor: "#1890ff",
            fillOpacity: 0.8,
            strokeColor: "#fff",
            strokeWeight: 2,
            scale: 1.5,
          }
        }}
      />
      <NavigationControl />
    </MapContainer>
    );
  },
  code: `import { Map, Marker } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <Marker position={{ lng: 116.404, lat: 39.915 }}
    icon={{
      symbol: {
        // SVG path 或 SDK 预设形状常量（BMap_Symbol_SHAPE_CIRCLE 等）
        shapeType: "M10 0 C10 5.52 5.52 10 0 10 C5.52 10 10 14.48 10 20 C10 14.48 14.48 10 20 10 C14.48 10 10 5.52 10 0 Z",
        fillColor: "#1890ff",
        fillOpacity: 0.8,
        strokeColor: "#fff",
        strokeWeight: 2,
        scale: 1.5,
      }
    }} />
</Map>`,
});

// ─── Icon ───
registerDemo('icon', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <Marker
        position={C}
        icon={{
          url: "https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_1.png",
          size: { width: 30, height: 30 },
        }}
      />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, Marker } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <Marker position={{ lng: 116.404, lat: 39.915 }}
    icon={{
      url: "https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_1.png",
      size: { width: 30, height: 30 },
    }} />
</Map>`,
});

// ─── IconSequence ───
registerDemo('icon-sequence', {
  Component: () => (
    <MapContainer center={C} zoom={13} style={{ height: '100%' }}>
      <Polyline
        path={[C, { lng: 116.41, lat: 39.92 }, { lng: 116.42, lat: 39.91 }]}
        strokeColor="#1890ff"
        strokeWeight={6}
      />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, Polyline } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={13}>
  <Polyline
    path={[{ lng: 116.404, lat: 39.915 }, { lng: 116.41, lat: 39.92 }, { lng: 116.42, lat: 39.91 }]}
    strokeColor="#1890ff" strokeWeight={6} />
</Map>`,
});

// ─── Hotspot ───
registerDemo('hotspot', {
  Component: () => (
    <MapContainer center={C} zoom={15} style={{ height: '100%' }}>
      <Hotspot position={C} />
      <ScaleControl />
    </MapContainer>
  ),
  code: `import { Map, Hotspot } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={15}>
  <Hotspot position={{ lng: 116.404, lat: 39.915 }} />
</Map>`,
});

// ─── CustomOverlay ───
registerDemo('custom-overlay', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <CustomOverlay point={C} offsetY={-20}>
        <div style={{ background: '#1890ff', color: '#fff', padding: '4px 10px', borderRadius: 4, fontSize: 13, whiteSpace: 'nowrap' }}>
          自定义 HTML 覆盖物
        </div>
      </CustomOverlay>
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, CustomOverlay } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <CustomOverlay point={{ lng: 116.404, lat: 39.915 }} offsetY={-20}>
    <div style={{ background: '#1890ff', color: '#fff', padding: '4px 10px', borderRadius: 4 }}>
      自定义 HTML 覆盖物
    </div>
  </CustomOverlay>
</Map>`,
});

// ─── Marker3D ───
registerDemo('marker-3d', {
  Component: () => (
    <MapContainer defaultCenter={C} defaultZoom={14} style={{ height: '100%' }}>
      <Marker3D position={C} height={100} shape={1} size={50} fillColor="#1890ff" fillOpacity={0.8} />
      <Marker3D position={{ lng: 116.41, lat: 39.92 }} height={150} shape={1} size={50} fillColor="#ff6600" fillOpacity={0.8} />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, Marker3D } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={14} tilt={60}>
  <Marker3D position={{ lng: 116.404, lat: 39.915 }} height={100} shape={1} size={50} fillColor="#1890ff" fillOpacity={0.8} />
  <Marker3D position={{ lng: 116.41, lat: 39.92 }} height={150} shape={1} size={50} fillColor="#ff6600" fillOpacity={0.8} />
</Map>`,
});

// ─── MapMask ───
registerDemo('map-mask', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <MapMask
        bounds={{ sw: { lng: 116.38, lat: 39.90 }, ne: { lng: 116.43, lat: 39.93 } }}
        showRegion="outside"
        isBuildingMask
        isPoiMask
        isMapMask
      />
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, MapMask } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <MapMask
    bounds={{ sw: { lng: 116.38, lat: 39.90 }, ne: { lng: 116.43, lat: 39.93 } }}
    showRegion="outside" isBuildingMask isPoiMask isMapMask />
</Map>`,
});

// ─── SimpleInfoWindow ───
registerDemo('simple-info-window', {
  Component: () => {
    const [open, setOpen] = useState(true);
    return (
      <MapContainer center={C} zoom={13} style={{ height: '100%' }}>
        <Marker position={C} onClick={() => setOpen(!open)} />
        <SimpleInfoWindow
          position={C}
          content="天安门广场"
          visible={open}
        />
        <NavigationControl />
      </MapContainer>
    );
  },
  code: `import { Map, Marker, SimpleInfoWindow } from 'react-bmap';

function Demo() {
  const [open, setOpen] = useState(true);
  return (
    <Map center={{ lng: 116.404, lat: 39.915 }} zoom={13}>
      <Marker position={{ lng: 116.404, lat: 39.915 }} onClick={() => setOpen(!open)} />
      <SimpleInfoWindow position={{ lng: 116.404, lat: 39.915 }}
        content="天安门广场" visible={open} />
    </Map>
  );
}`,
});

// ─── PlaceDetail ───
registerDemo('place-detail-overlay', {
  Component: () => (
    <MapContainer center={C} zoom={15} style={{ height: '100%' }}>
      <Marker position={C}>
        <PlaceDetail uid="06d2dffda107b0ef89f15db6" open={true} />
      </Marker>
      <NavigationControl />
    </MapContainer>
  ),
  code: `import { Map, Marker, PlaceDetail } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={15}>
  <Marker position={{ lng: 116.404, lat: 39.915 }}>
    <PlaceDetail uid="06d2dffda107b0ef89f15db6" open={true} />
  </Marker>
</Map>`,
});
