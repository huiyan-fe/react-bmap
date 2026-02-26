import React from 'react';
import { Circle, ScaleControl, CirclePropsSchema } from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const code = `import { Map, Circle, ScaleControl } from 'react-bmap';

<Map center={{ lng: 116.403119, lat: 39.929543 }} zoom={14}>
  <ScaleControl />
  <Circle
    center={{ lng: 116.403119, lat: 39.929543 }}
    radius={300}
    fillColor="blue"
    strokeColor="white"
  />
</Map>`;

function Demo() {
  return (
    <MapContainer center={{ lng: 116.403119, lat: 39.929543 }} zoom={14} style={{ height: '100%' }}>
      <ScaleControl />
      <Circle
        center={{ lng: 116.403119, lat: 39.929543 }}
        radius={300}
        fillColor="blue"
        strokeColor="white"
      />
    </MapContainer>
  );
}

registerDemo('circle', {
  Component: Demo,
  code,
  schema: CirclePropsSchema,
});
