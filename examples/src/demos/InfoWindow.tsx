import React from 'react';
import { Marker, InfoWindow, InfoWindowPropsSchema } from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const code = `import { Map, Marker, InfoWindow } from 'react-bmap';

<Map center={{ lng: 116.402544, lat: 39.928216 }} zoom={12}>
  <Marker position={{ lng: 116.402544, lat: 39.928216 }} />
  <InfoWindow
    position={{ lng: 116.402544, lat: 39.928216 }}
    text="信息窗口内容"
    title="信息窗口标题"
  />
</Map>`;

function Demo() {
  return (
    <MapContainer center={{ lng: 116.402544, lat: 39.928216 }} zoom={12} style={{ height: '100%' }}>
      <Marker position={{ lng: 116.402544, lat: 39.928216 }} />
      <InfoWindow
        position={{ lng: 116.402544, lat: 39.928216 }}
        text="信息窗口内容"
        title="信息窗口标题"
      />
    </MapContainer>
  );
}

registerDemo('infowindow', {
  Component: Demo,
  code,
  schema: InfoWindowPropsSchema,
});
