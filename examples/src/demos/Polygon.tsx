import React from 'react';
import { Polygon, PolygonPropsSchema } from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const code = `import { Map, Polygon } from 'react-bmap';

<Map center={{ lng: 116.442519, lat: 39.945597 }} zoom={14}>
  <Polygon
    fillColor="red"
    strokeColor="yellow"
    path={[
      { lng: 116.442519, lat: 39.945597 },
      { lng: 116.484488, lat: 39.905315 },
      { lng: 116.443094, lat: 39.886494 },
      { lng: 116.426709, lat: 39.900001 },
    ]}
  />
</Map>`;

function Demo() {
  return (
    <MapContainer center={{ lng: 116.442519, lat: 39.945597 }} zoom={14} style={{ height: '100%' }}>
      <Polygon
        fillColor="red"
        strokeColor="yellow"
        path={[
          { lng: 116.442519, lat: 39.945597 },
          { lng: 116.484488, lat: 39.905315 },
          { lng: 116.443094, lat: 39.886494 },
          { lng: 116.426709, lat: 39.900001 },
        ]}
      />
    </MapContainer>
  );
}

registerDemo('polygon', {
  Component: Demo,
  code,
  schema: PolygonPropsSchema,
});
