/** ThreeLayer 测试页 — v4+，依赖 three.js。 */
import React, { useState } from 'react';
import { ThreeLayer } from 'react-bmap';
import type { ThreeLayerProps } from 'react-bmap';
import { DEFAULT_BASE_OPTIONS, LayerBaseOptionControls, LayerPageLayout, PropsView } from './shared';

const CODE = `<Map defaultCenter={center} defaultZoom={11}>
  <ThreeLayer visible zIndex={5} />
</Map>`;

export function ThreeLayerPage() {
  const [options, setOptions] = useState<ThreeLayerProps>({ ...DEFAULT_BASE_OPTIONS });

  return (
    <LayerPageLayout
      title="ThreeLayer"
      capability="ThreeLayer"
      versionNote="@since 4.0。Three.js 图层，需要页面自行引入 three.js；缺依赖时 SDK 上不会挂出该类，看上面的运行时探测标签。"
      code={CODE}
      controls={
        <>
          <LayerBaseOptionControls value={options} onChange={setOptions} />
          <PropsView value={options} />
          <section>
            <h3>说明</h3>
            <p className="muted small">
              组件只负责创建与挂载图层，three.js 的场景 / 相机 / 模型需要拿到原始图层实例后自行操作，
              当前组件 API 未暴露该实例，所以这里不会有可见的三维内容。
            </p>
          </section>
        </>
      }
    >
      <ThreeLayer {...options} />
    </LayerPageLayout>
  );
}
