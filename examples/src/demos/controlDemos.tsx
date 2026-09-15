import React from 'react';
import {
  NavigationControl, NavigationControl3D, ScaleControl, OverviewMapControl,
  MapTypeControl, CopyrightControl, GeolocationControl, PanoramaControl,
  ZoomControl, CityListControl, CustomControl,
  RawControl, useDriver,
  Marker,
  BMAP_ANCHOR_TOP_LEFT, BMAP_ANCHOR_TOP_RIGHT, BMAP_ANCHOR_BOTTOM_LEFT, BMAP_ANCHOR_BOTTOM_RIGHT,
} from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const C = { lng: 116.404, lat: 39.915 };

// ─── NavigationControl ───
registerDemo('navigation-control', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <NavigationControl anchor={BMAP_ANCHOR_TOP_LEFT} />
    </MapContainer>
  ),
  code: `import { Map, NavigationControl, BMAP_ANCHOR_TOP_LEFT } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <NavigationControl anchor={BMAP_ANCHOR_TOP_LEFT} />
</Map>`,
});

// ─── NavigationControl3D ───
registerDemo('navigation-control-3d', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }} tilt={60}>
      <NavigationControl3D anchor={BMAP_ANCHOR_TOP_LEFT} />
    </MapContainer>
  ),
  code: `import { Map, NavigationControl3D, BMAP_ANCHOR_TOP_LEFT } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11} tilt={60}>
  <NavigationControl3D anchor={BMAP_ANCHOR_TOP_LEFT} />
</Map>`,
});

// ─── ScaleControl ───
registerDemo('scale-control', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <ScaleControl anchor={BMAP_ANCHOR_BOTTOM_LEFT} />
    </MapContainer>
  ),
  code: `import { Map, ScaleControl, BMAP_ANCHOR_BOTTOM_LEFT } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <ScaleControl anchor={BMAP_ANCHOR_BOTTOM_LEFT} />
</Map>`,
});

// ─── OverviewMapControl ───
registerDemo('overview-map-control', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <OverviewMapControl anchor={BMAP_ANCHOR_BOTTOM_RIGHT} />
    </MapContainer>
  ),
  code: `import { Map, OverviewMapControl, BMAP_ANCHOR_BOTTOM_RIGHT } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <OverviewMapControl anchor={BMAP_ANCHOR_BOTTOM_RIGHT} />
</Map>`,
});

// ─── MapTypeControl ───
registerDemo('map-type-control', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <MapTypeControl anchor={BMAP_ANCHOR_TOP_RIGHT} />
    </MapContainer>
  ),
  code: `import { Map, MapTypeControl, BMAP_ANCHOR_TOP_RIGHT } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <MapTypeControl anchor={BMAP_ANCHOR_TOP_RIGHT} />
</Map>`,
});

// ─── CopyrightControl ───
registerDemo('copyright-control', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <CopyrightControl
        anchor={BMAP_ANCHOR_BOTTOM_RIGHT}
        copyrights={[{ id: 1, content: '<span style="color:#666;font-size:12px">© 2026 My App</span>' }]}
      />
    </MapContainer>
  ),
  code: `import { Map, CopyrightControl, BMAP_ANCHOR_BOTTOM_LEFT } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <CopyrightControl anchor={BMAP_ANCHOR_BOTTOM_RIGHT}
    copyrights={[{ id: 1, content: '<span>© 2026 My App</span>' }]} />
</Map>`,
});

// ─── GeolocationControl ───
registerDemo('geolocation-control', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <GeolocationControl anchor={BMAP_ANCHOR_BOTTOM_RIGHT} />
    </MapContainer>
  ),
  code: `import { Map, GeolocationControl, BMAP_ANCHOR_BOTTOM_RIGHT } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <GeolocationControl anchor={BMAP_ANCHOR_BOTTOM_RIGHT} />
</Map>`,
});

// ─── PanoramaControl ───
registerDemo('panorama-control', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <PanoramaControl anchor={BMAP_ANCHOR_TOP_LEFT} />
    </MapContainer>
  ),
  code: `import { Map, PanoramaControl, BMAP_ANCHOR_TOP_LEFT } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <PanoramaControl anchor={BMAP_ANCHOR_TOP_LEFT} />
</Map>`,
});

// ─── ZoomControl ───
registerDemo('zoom-control', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <ZoomControl anchor={BMAP_ANCHOR_BOTTOM_RIGHT} />
    </MapContainer>
  ),
  code: `import { Map, ZoomControl, BMAP_ANCHOR_BOTTOM_RIGHT } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <ZoomControl anchor={BMAP_ANCHOR_BOTTOM_RIGHT} />
</Map>`,
});

// ─── CityListControl ───
registerDemo('city-list-control', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <CityListControl anchor={BMAP_ANCHOR_TOP_LEFT} />
    </MapContainer>
  ),
  code: `import { Map, CityListControl, BMAP_ANCHOR_TOP_LEFT } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <CityListControl anchor={BMAP_ANCHOR_TOP_LEFT} />
</Map>`,
});

// ─── CustomControl（2.0.2 新增） ───
function CustomControlDemo() {
  const [zoom, setZoom] = React.useState(11);
  return (
    <MapContainer center={C} zoom={zoom} style={{ height: '100%' }}>
      <CustomControl anchor={BMAP_ANCHOR_TOP_RIGHT}>
        <div style={{
          background: '#fff', border: '1px solid #ccc', borderRadius: 4,
          padding: '6px 10px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', fontSize: 13,
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <button onClick={() => setZoom(z => Math.min(z + 1, 19))}>放大</button>
          <button onClick={() => setZoom(z => Math.max(z - 1, 3))}>缩小</button>
          <span>zoom={zoom}</span>
        </div>
      </CustomControl>
    </MapContainer>
  );
}
registerDemo('custom-control', {
  Component: CustomControlDemo,
  code: `import { useState } from 'react';
import { Map, CustomControl, BMAP_ANCHOR_TOP_RIGHT } from 'react-bmap';

// CustomControl（2.0.2 新增）：把自定义 DOM/React 内容挂载到地图固定像素位置，
// 通过内部按钮联动操作地图属性（zoom），演示自定义控件与地图状态的交互。
function Demo() {
  const [zoom, setZoom] = useState(11);
  return (
    <Map center={{ lng: 116.404, lat: 39.915 }} zoom={zoom}>
      <CustomControl anchor={BMAP_ANCHOR_TOP_RIGHT}>
        <div style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 4, padding: '6px 10px', display: 'flex', gap: 8 }}>
          <button onClick={() => setZoom(z => Math.min(z + 1, 19))}>放大</button>
          <button onClick={() => setZoom(z => Math.max(z - 1, 3))}>缩小</button>
          <span>zoom={zoom}</span>
        </div>
      </CustomControl>
    </Map>
  );
}`,
});

// ─── RawControl（逃生舱：挂载任意继承 Control 的原生实例） ───
const RawControlDemo: React.FC = () => {
  const driver = useDriver();
  const rawSDK = (driver as any)?.rawSDK;
  if (!rawSDK) return null;
  const create = () => {
    class ActionControl extends rawSDK.Control {
      defaultAnchor: any; defaultOffset: any;
      constructor() {
        super();
        this.defaultAnchor = BMAP_ANCHOR_BOTTOM_LEFT;
        this.defaultOffset = new rawSDK.Size(10, 10);
      }
      initialize(map: any) {
        const div = document.createElement('div');
        div.style.cssText = 'padding:6px 12px;background:#1890ff;color:#fff;border-radius:4px;font-size:12px;cursor:pointer;';
        div.textContent = '放大一级';
        div.addEventListener('click', () => map.setZoom(map.getZoom() + 1));
        map.getContainer().appendChild(div);
        return div;
      }
    }
    return new ActionControl();
  };
  return <RawControl create={create} deps={[]} />;
};
registerDemo('raw-control', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <RawControlDemo />
    </MapContainer>
  ),
  code: `import { Map, RawControl, useDriver, BMAP_ANCHOR_BOTTOM_LEFT } from 'react-bmap';

// 用户自己写继承 BMap.Control 的类（掌控 initialize/DOM），库负责挂载卸载
function ActionControlDemo() {
  const driver = useDriver();
  const rawSDK = (driver as any)?.rawSDK;
  if (!rawSDK) return null;
  const create = () => {
    class ActionControl extends rawSDK.Control {
      constructor() {
        super();
        this.defaultAnchor = BMAP_ANCHOR_BOTTOM_LEFT;
        this.defaultOffset = new rawSDK.Size(10, 10);
      }
      initialize(map) {
        const div = document.createElement('div');
        div.style.cssText = 'padding:6px 12px;background:#1890ff;color:#fff;border-radius:4px;cursor:pointer;';
        div.textContent = '放大一级';
        div.addEventListener('click', () => map.setZoom(map.getZoom() + 1));
        map.getContainer().appendChild(div);
        return div;
      }
    }
    return new ActionControl();
  };
  return <RawControl create={create} deps={[]} />;
}

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <ActionControlDemo />
</Map>`,
});
