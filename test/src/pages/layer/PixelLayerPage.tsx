/** PixelLayer 测试页 — v4+。像素图层。 */
import React, { useState } from 'react';
import { PixelLayer } from 'react-bmap';
import type { PixelLayerProps } from 'react-bmap';
import { DEFAULT_BASE_OPTIONS, LayerBaseOptionControls, LayerPageLayout, PropsView } from './shared';

const CODE = `<Map defaultCenter={center} defaultZoom={11}>
  <PixelLayer visible opacity={0.8} zIndex={3} />
</Map>`;

export function PixelLayerPage() {
  const [options, setOptions] = useState<PixelLayerProps>({ ...DEFAULT_BASE_OPTIONS });

  return (
    <LayerPageLayout
      title="PixelLayer"
      capability="PixelLayer"
      versionNote="@since 4.0。像素图层，通过 addLayer / removeLayer 挂载。"
      code={CODE}
      controls={
        <>
          <LayerBaseOptionControls value={options} onChange={setOptions} />
          <PropsView value={options} />
        </>
      }
    >
      <PixelLayer {...options} />
    </LayerPageLayout>
  );
}
