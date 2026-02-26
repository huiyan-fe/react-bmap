import React from 'react';
import { TrafficLayer, TrafficLayerPropsSchema } from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const code = `import { Map, TrafficLayer } from 'react-bmap';

<Map center={{ lng: 116.402544, lat: 39.928216 }} zoom={12}>
  <TrafficLayer />
</Map>`;

function Demo() {
  return (
    <MapContainer center={{ lng: 116.402544, lat: 39.928216 }} zoom={12} style={{ height: '100%' }}>
      <TrafficLayer />
    </MapContainer>
  );
}

registerDemo('trafficlayer', {
  Component: Demo,
  code,
  schema: TrafficLayerPropsSchema,
});
