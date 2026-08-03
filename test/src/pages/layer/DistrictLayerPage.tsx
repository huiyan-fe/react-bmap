/**
 * DistrictLayer 测试页 — v4+。行政区划图层。
 */
import React, { useState } from 'react';
import { Map, DistrictLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const PRESETS = [
  { name: '北京市', strokeColor: '#1890ff', fillColor: '#1890ff33' },
  { name: '上海市', strokeColor: '#52c41a', fillColor: '#52c41a33' },
  { name: '广东省', strokeColor: '#fa8c16', fillColor: '#fa8c1633' },
];

export function DistrictLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('DistrictLayer');
  const [visible, setVisible] = useState(true);
  const [presetIdx, setPresetIdx] = useState(0);
  const preset = PRESETS[presetIdx];

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={8} style={{ height: '100%' }}>
          {visible && supported && (
            <DistrictLayer
              key={preset.name}
              name={preset.name}
              strokeColor={preset.strokeColor}
              fillColor={preset.fillColor}
            />
          )}
        </Map>
      </div>
      <div className="test-controls">
        <h2>DistrictLayer</h2>
        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span>
          <p className="muted small">@since 4.0。行政区划图层，通过 map.addLayer / map.removeLayer 管理。v3 不支持。</p>
        </section>
        <section>
          <h3>显示</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            显示图层（挂载 / 卸载）
          </label>
        </section>
        <section>
          <h3>预设区域</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {PRESETS.map((p, i) => (
              <button key={p.name} className={presetIdx === i ? 'active' : ''} style={{ fontSize: 11 }} onClick={() => setPresetIdx(i)}>
                {p.name}
              </button>
            ))}
          </div>
          <p className="muted small">name 变化时通过 key 重建图层</p>
        </section>
        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`<Map defaultCenter={center} defaultZoom={8}>
  <DistrictLayer name="北京市" strokeColor="#1890ff" fillColor="#1890ff33" />
</Map>`}
          </pre>
        </section>
      </div>
    </div>
  );
}
