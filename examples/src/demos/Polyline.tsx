import React from 'react';
import { Polyline, PolylinePropsSchema } from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const code = `import { Map, Polyline } from 'react-bmap';

<Map center={{ lng: 116.403119, lat: 39.929543 }} zoom={14}>
  <Polyline
    strokeColor="green"
    path={[
      { lng: 116.403119, lat: 39.929543 },
      { lng: 116.265139, lat: 39.978658 },
      { lng: 116.217996, lat: 39.904309 },
    ]}
  />
</Map>`;

function Demo() {
  return (
    <MapContainer center={{ lng: 116.403119, lat: 39.929543 }} zoom={14} style={{ height: '100%' }}>
      <Polyline
        strokeColor="green"
        path={[
          { lng: 116.403119, lat: 39.929543 },
          { lng: 116.265139, lat: 39.978658 },
          { lng: 116.217996, lat: 39.904309 },
        ]}
      />
    </MapContainer>
  );
}

registerDemo('polyline', {
  Component: Demo,
  code,
  schema: PolylinePropsSchema,
});
