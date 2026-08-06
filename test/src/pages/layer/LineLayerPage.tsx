/** LineLayer 测试页 */
import React from 'react';
import { Map, LineLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

export function LineLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('LineLayer');
  return (
    <div className="test-page">
      <div className="test-map"><Map defaultCenter={BEIJING} defaultZoom={11} style={{ height: '100%' }}>{supported && <LineLayer />}</Map></div>
      <div className="test-controls">
        <h2>LineLayer</h2>
        <section><h3>能力</h3><span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span><p className="muted small">@since 4.0。线图层（继承 NormalLayer）。</p></section>
        <section><h3>代码示例</h3><pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`<LineLayer style={{ strokeColor: '#1890ff', strokeWeight: 3 }} />`}</pre></section>
      </div>
    </div>
  );
}
