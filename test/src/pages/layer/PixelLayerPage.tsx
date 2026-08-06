/** PixelLayer 测试页 */
import React from 'react';
import { Map, PixelLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

export function PixelLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('PixelLayer');
  return (
    <div className="test-page">
      <div className="test-map"><Map defaultCenter={BEIJING} defaultZoom={11} style={{ height: '100%' }}>{supported && <PixelLayer />}</Map></div>
      <div className="test-controls">
        <h2>PixelLayer</h2>
        <section><h3>能力</h3><span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span><p className="muted small">@since 4.0。像素图层。</p></section>
        <section><h3>代码示例</h3><pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`<PixelLayer />`}</pre></section>
      </div>
    </div>
  );
}
