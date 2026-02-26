import React from 'react';
import { Marker, NavigationControl, MarkerPropsSchema } from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const code = `import { Map, Marker, NavigationControl } from 'react-bmap';

<Map center={{ lng: 116.402544, lat: 39.928216 }} zoom={11}>
  <Marker position={{ lng: 116.402544, lat: 39.928216 }} />
  <Marker position={{ lng: 116.5, lat: 39.9 }} icon="simple_blue" />
  <NavigationControl />
</Map>`;

function Demo() {
  return (
    <MapContainer center={{ lng: 116.402544, lat: 39.928216 }} zoom={11} style={{ height: '100%' }}>
      <Marker position={{ lng: 116.402544, lat: 39.928216 }} />
      <Marker position={{ lng: 116.5, lat: 39.9 }} icon="simple_blue" />
      <NavigationControl />
    </MapContainer>
  );
}

registerDemo('marker', {
  Component: Demo,
  code,
  schema: MarkerPropsSchema,
});
