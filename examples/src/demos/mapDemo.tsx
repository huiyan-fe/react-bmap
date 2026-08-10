import React from 'react';
import { Map, Marker, NavigationControl, ScaleControl } from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const code = `import { Map, Marker, NavigationControl, ScaleControl } from 'react-bmap';

<Map
  center={{ lng: 116.402544, lat: 39.928216 }}
  zoom={11}
  style={{ height: 400 }}
  onClick={(e) => console.log('click', e)}
>
  <Marker position={{ lng: 116.402544, lat: 39.928216 }} />
  <NavigationControl />
  <ScaleControl />
</Map>`;

function Demo() {
  return (
    <MapContainer
      center={{ lng: 116.402544, lat: 39.928216 }}
      zoom={11}
      style={{ height: '100%' }}
      onClick={(e: any) => console.log('map click', e)}
    >
      <Marker position={{ lng: 116.402544, lat: 39.928216 }} />
      <NavigationControl />
      <ScaleControl />
    </MapContainer>
  );
}

registerDemo('map', { Component: Demo, code });
