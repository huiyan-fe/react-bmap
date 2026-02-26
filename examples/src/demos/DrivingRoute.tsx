import React from 'react';
import { DrivingRoute, DrivingRoutePropsSchema } from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const code = `import { Map, DrivingRoute } from 'react-bmap';

<Map center={{ lng: 116.4, lat: 39.9 }} zoom={12}>
  <DrivingRoute
    start={{ lng: 116.404269, lat: 39.915119 }}
    end={{ lng: 116.501269, lat: 39.937119 }}
  />
</Map>`;

function Demo() {
  return (
    <MapContainer center={{ lng: 116.4, lat: 39.9 }} zoom={12} style={{ height: '100%' }}>
      <DrivingRoute
        start={{ lng: 116.404269, lat: 39.915119 }}
        end={{ lng: 116.501269, lat: 39.937119 }}
      />
    </MapContainer>
  );
}

registerDemo('drivingroute', {
  Component: Demo,
  code,
  schema: DrivingRoutePropsSchema,
});
