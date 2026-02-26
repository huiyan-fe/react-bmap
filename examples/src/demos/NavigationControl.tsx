import React from 'react';
import { NavigationControl, NavigationControlPropsSchema } from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const code = `import { Map, NavigationControl } from 'react-bmap';

<Map center={{ lng: 116.402544, lat: 39.928216 }} zoom={11}>
  <NavigationControl />
</Map>`;

function Demo() {
  return (
    <MapContainer center={{ lng: 116.402544, lat: 39.928216 }} zoom={11} style={{ height: '100%' }}>
      <NavigationControl />
    </MapContainer>
  );
}

registerDemo('navigationcontrol', {
  Component: Demo,
  code,
  schema: NavigationControlPropsSchema,
});
