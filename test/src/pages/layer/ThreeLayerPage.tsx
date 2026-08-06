/** ThreeLayer 测试页 */
import React from 'react';
import { Map, ThreeLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

export function ThreeLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('ThreeLayer');
  return (
    <div className="test-page">
      <div className="test-map"><Map defaultCenter={BEIJING} defaultZoom={11} style={{ height: '100%' }}>{supported && <ThreeLayer />}</Map></div>
      <div className="test-controls">
        <h2>ThreeLayer</h2>
        <section><h3>能力</h3><span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span><p className="muted small">@since 4.0。Three.js 图层（需要 three.js 依赖）。</p></section>
        <section><h3>代码示例</h3><pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`<ThreeLayer />`}</pre></section>
      </div>
    </div>
  );
}
