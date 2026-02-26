import React from 'react';
import { ScaleControl, ScaleControlPropsSchema } from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const code = `import { Map, ScaleControl } from 'react-bmap';

<Map center={{ lng: 116.402544, lat: 39.928216 }} zoom={11}>
  <ScaleControl />
</Map>`;

function Demo() {
  return (
    <MapContainer center={{ lng: 116.402544, lat: 39.928216 }} zoom={11} style={{ height: '100%' }}>
      <ScaleControl />
    </MapContainer>
  );
}

registerDemo('scalecontrol', {
  Component: Demo,
  code,
  schema: ScaleControlPropsSchema,
});
