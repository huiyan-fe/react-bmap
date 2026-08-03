/**
 * RasterTileLayer 测试页 — v4+。栅格瓦片图层。
 */
import React, { useState } from 'react';
import { Map, RasterTileLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const DEFAULT_URL = 'https://maponline0.bdimg.com/tile/?qt=tile&x={X}&y={Y}&z={Z}&styles=pl&scaler=1&udt=20230815';

export function RasterTileLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('RasterTileLayer');
  const [visible, setVisible] = useState(true);
  const [url, setUrl] = useState(DEFAULT_URL);
  const [opacity, setOpacity] = useState(1);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={11} style={{ height: '100%' }}>
          {visible && supported && (
            <RasterTileLayer key={`${url}|${opacity}`} url={url} opacity={opacity !== 1 ? opacity : undefined} />
          )}
        </Map>
      </div>
      <div className="test-controls">
        <h2>RasterTileLayer</h2>
        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span>
          <p className="muted small">@since 4.0。栅格瓦片图层。v3 不支持。</p>
        </section>
        <section>
          <h3>显示</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            显示图层（挂载 / 卸载）
          </label>
        </section>
        <section>
          <h3>url（必填）</h3>
          <textarea className="full-width" rows={2} value={url} onChange={e => setUrl(e.target.value)} />
          <p className="muted small">瓦片 URL 或模板函数，占位符 {'{X}/{Y}/{Z}'}。变化时重建。</p>
        </section>
        <section>
          <h3>opacity: {opacity}</h3>
          <input type="range" min={0} max={1} step={0.1} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="full-width" />
        </section>
        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`<Map defaultCenter={center} defaultZoom={11}>
  <RasterTileLayer url="https://yourhost/tile/{x}/{y}/{z}.png" />
</Map>`}
          </pre>
        </section>
      </div>
    </div>
  );
}
