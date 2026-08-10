import React, { useState } from 'react';
import { Map, Marker, ContextMenu, MenuItem, Panorama, PlaceDetailPanel } from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const C = { lng: 116.404, lat: 39.915 };

// ─── ContextMenu ───
registerDemo('context-menu', {
  Component: () => (
    <MapContainer center={C} zoom={13} style={{ height: '100%' }}>
      <ContextMenu>
        <MenuItem text="放大" callback={() => console.log('zoom in')} />
        <MenuItem text="缩小" callback={() => console.log('zoom out')} />
        <MenuItem text="添加标注" callback={() => console.log('add marker')} />
      </ContextMenu>
      <Marker position={C} />
    </MapContainer>
  ),
  code: `import { Map, ContextMenu, MenuItem } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={13}>
  <ContextMenu>
    <MenuItem text="放大" callback={() => console.log('zoom in')} />
    <MenuItem text="缩小" callback={() => console.log('zoom out')} />
    <MenuItem text="添加标注" callback={() => console.log('add marker')} />
  </ContextMenu>
</Map>`,
});

// ─── Panorama ───
registerDemo('panorama', {
  Component: () => (
    <div style={{ height: '100%', position: 'relative' }}>
      <Panorama point={C} style={{ width: '100%', height: '100%' }} />
    </div>
  ),
  code: `import { Panorama } from 'react-bmap';

<Panorama
  point={{ lng: 116.404, lat: 39.915 }}
  style={{ width: '100%', height: 400 }}
/>`,
});

// ─── PlaceDetailPanel ───
registerDemo('place-detail-panel', {
  Component: () => (
    <div style={{ height: '100%', position: 'relative' }}>
      <MapContainer defaultCenter={C} defaultZoom={14} style={{ height: '100%' }} />
      <PlaceDetailPanel
        uid="06d2dffda107b0ef89f15db6"
        renderOptions={{
          displayCarousel: true,
          displayTag: true,
          displayRating: true,
          displayAddress: true,
          displayComment: true,
          displayCommentTotalCount: true,
        } as any}
        style={{
          position: 'absolute', top: 10, left: 10, zIndex: 10,
          width: 440, background: '#fff', borderRadius: 8, padding: 4,
          fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          overflow: 'auto', maxHeight: 'calc(100% - 20px)',
        }}
      />
    </div>
  ),
  code: `import { Map, PlaceDetailPanel } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={14} />
<PlaceDetailPanel
  uid="06d2dffda107b0ef89f15db6"
  renderOptions={{ displayCarousel: true, displayAddress: true }}
  style={{ position: 'absolute', top: 10, left: 10, width: 440 }}
/>`,
});
