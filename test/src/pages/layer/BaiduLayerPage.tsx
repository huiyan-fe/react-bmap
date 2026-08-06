/** BaiduLayer 测试页 */
import React from 'react';
import { Map, BaiduLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

export function BaiduLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('BaiduLayer');
  return (
    <div className="test-page">
      <div className="test-map"><Map defaultCenter={BEIJING} defaultZoom={11} style={{ height: '100%' }}>{supported && <BaiduLayer />}</Map></div>
      <div className="test-controls">
        <h2>BaiduLayer</h2>
        <section><h3>能力</h3><span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span><p className="muted small">@since 4.0。百度图层。</p></section>
        <section><h3>代码示例</h3><pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`<BaiduLayer />`}</pre></section>
      </div>
    </div>
  );
}
