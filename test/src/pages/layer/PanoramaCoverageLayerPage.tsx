/**
 * PanoramaCoverageLayer 测试页 — 全景覆盖区域图层。
 * dts 标记 @removed 4.0，但 SDK 运行时仍保留此类。
 * 无参数构造，通过 map.addLayer / map.removeLayer 管理。
 */
import React, { useState } from 'react';
import { Map, PanoramaCoverageLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

export function PanoramaCoverageLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('PanoramaCoverageLayer');
  const [visible, setVisible] = useState(true);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}>
          {visible && supported && <PanoramaCoverageLayer />}
        </Map>
      </div>
      <div className="test-controls">
        <h2>PanoramaCoverageLayer</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'supported' : 'unsupported'}</span>
          <p className="muted small">
            全景覆盖区域图层。dts 标记 @removed 4.0，但 SDK 运行时仍保留此类。
            展示全景街道覆盖范围，无参数构造。
          </p>
        </section>

        <section>
          <h3>显示</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            显示图层（挂载 / 卸载）
          </label>
          <p className="muted small">在支持全景的区域会显示蓝色覆盖层。缩放地图到街道级别可以看到更详细的全景覆盖。</p>
        </section>

        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => setVisible(true)}>reset</button>
          </div>
        </section>

        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`<Map defaultCenter={center} defaultZoom={12}>
  <PanoramaCoverageLayer />
</Map>`}
          </pre>
        </section>
      </div>
    </div>
  );
}
