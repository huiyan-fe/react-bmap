/** BaiduLayer 测试页 — v4+。百度底图图层。 */
import React, { useState } from 'react';
import { BaiduLayer } from 'react-bmap';
import type { BaiduLayerProps } from 'react-bmap';
import { DEFAULT_BASE_OPTIONS, LayerBaseOptionControls, LayerPageLayout, PropsView } from './shared';

const CODE = `<Map defaultCenter={center} defaultZoom={11}>
  <BaiduLayer visible opacity={0.6} />
</Map>`;

export function BaiduLayerPage() {
  const [options, setOptions] = useState<BaiduLayerProps>({ ...DEFAULT_BASE_OPTIONS });

  return (
    <LayerPageLayout
      title="BaiduLayer"
      capability="BaiduLayer"
      versionNote="@since 4.0。百度图层，叠在底图之上，调 opacity 最容易看出差异。"
      code={CODE}
      controls={
        <>
          <LayerBaseOptionControls value={options} onChange={setOptions} />
          <PropsView value={options} />
        </>
      }
    >
      <BaiduLayer {...options} />
    </LayerPageLayout>
  );
}
