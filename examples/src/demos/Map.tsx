import React from 'react';
import { Marker, NavigationControl, MapPropsSchema } from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const code = `import { Map, Marker, NavigationControl } from 'react-bmap';

<Map
  center={{ lng: 116.402544, lat: 39.928216 }}
  zoom={11}
  style={{ height: 400 }}
>
  <Marker position={{ lng: 116.402544, lat: 39.928216 }} />
  <NavigationControl />
</Map>`;

function Demo() {
  return (
    <MapContainer center={{ lng: 116.402544, lat: 39.928216 }} zoom={11} style={{ height: '100%' }}>
      <Marker position={{ lng: 116.402544, lat: 39.928216 }} />
      <NavigationControl />
    </MapContainer>
  );
}

registerDemo('map', {
  Component: Demo,
  code,
  schema: MapPropsSchema,
});
