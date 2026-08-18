import React from 'react';
import {
  NavigationControl, NavigationControl3D, ScaleControl, OverviewMapControl,
  MapTypeControl, CopyrightControl, GeolocationControl, PanoramaControl,
  ZoomControl, CityListControl,
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
    <MapContainer center={C} zoom={14} style={{ height: '100%' }} tilt={60}>
      <NavigationControl3D anchor={BMAP_ANCHOR_TOP_LEFT} />
    </MapContainer>
  ),
  code: `import { Map, NavigationControl3D, BMAP_ANCHOR_TOP_LEFT } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={14} tilt={60}>
  <NavigationControl3D anchor={BMAP_ANCHOR_TOP_LEFT} />
</Map>`,
});

// ─── ScaleControl ───
registerDemo('scale-control', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <ScaleControl anchor={BMAP_ANCHOR_BOTTOM_LEFT} />
    </MapContainer>
  ),
  code: `import { Map, ScaleControl, BMAP_ANCHOR_BOTTOM_LEFT } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <ScaleControl anchor={BMAP_ANCHOR_BOTTOM_LEFT} />
</Map>`,
});

// ─── OverviewMapControl ───
registerDemo('overview-map-control', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <OverviewMapControl anchor={BMAP_ANCHOR_BOTTOM_RIGHT} />
    </MapContainer>
  ),
  code: `import { Map, OverviewMapControl, BMAP_ANCHOR_BOTTOM_RIGHT } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
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
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <CopyrightControl
        anchor={BMAP_ANCHOR_BOTTOM_RIGHT}
        copyrights={[{ id: 1, content: '<span style="color:#666;font-size:12px">© 2026 My App</span>' }]}
      />
    </MapContainer>
  ),
  code: `import { Map, CopyrightControl, BMAP_ANCHOR_BOTTOM_LEFT } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <CopyrightControl anchor={BMAP_ANCHOR_BOTTOM_RIGHT}
    copyrights={[{ id: 1, content: '<span>© 2026 My App</span>' }]} />
</Map>`,
});

// ─── GeolocationControl ───
registerDemo('geolocation-control', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <GeolocationControl anchor={BMAP_ANCHOR_BOTTOM_RIGHT} />
    </MapContainer>
  ),
  code: `import { Map, GeolocationControl, BMAP_ANCHOR_BOTTOM_RIGHT } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <GeolocationControl anchor={BMAP_ANCHOR_BOTTOM_RIGHT} />
</Map>`,
});

// ─── PanoramaControl ───
registerDemo('panorama-control', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <PanoramaControl anchor={BMAP_ANCHOR_TOP_LEFT} />
    </MapContainer>
  ),
  code: `import { Map, PanoramaControl, BMAP_ANCHOR_TOP_LEFT } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <PanoramaControl anchor={BMAP_ANCHOR_TOP_LEFT} />
</Map>`,
});

// ─── ZoomControl ───
registerDemo('zoom-control', {
  Component: () => (
    <MapContainer center={C} zoom={12} style={{ height: '100%' }}>
      <ZoomControl anchor={BMAP_ANCHOR_BOTTOM_RIGHT} />
    </MapContainer>
  ),
  code: `import { Map, ZoomControl, BMAP_ANCHOR_BOTTOM_RIGHT } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
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
