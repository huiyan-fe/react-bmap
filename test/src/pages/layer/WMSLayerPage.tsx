/**
 * WMSLayer 测试页 — v4+。WMS 标准服务图层。
 * 需要 url + params（LAYERS 等必填）。
 */
import React, { useState } from 'react';
import { Map, WMSLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const DEFAULT_URL = 'https://mrdata.usgs.gov/services/mrds';
const DEFAULT_PARAMS = { LAYERS: 'mrds', FORMAT: 'image/png', TRANSPARENT: 'true' };

export function WMSLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('WMSLayer');
  const [visible, setVisible] = useState(true);
  const [url, setUrl] = useState(DEFAULT_URL);
  const [paramsStr, setParamsStr] = useState(JSON.stringify(DEFAULT_PARAMS, null, 2));
  const [opacity, setOpacity] = useState(1);

  let params: Record<string, string> | undefined;
  try { params = JSON.parse(paramsStr); } catch { params = undefined; }

  const rebuildKey = `${url}|${paramsStr}|${opacity}`;

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={6} style={{ height: '100%' }}>
          {visible && supported && (
            <WMSLayer
              key={rebuildKey}
              url={url}
              params={params}
              opacity={opacity !== 1 ? opacity : undefined}
            />
          )}
        </Map>
      </div>
      <div className="test-controls">
        <h2>WMSLayer</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span>
          <p className="muted small">@since 4.0。WMS 标准服务图层。v3 不支持。</p>
        </section>

        <section>
          <h3>显示</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            显示图层（挂载 / 卸载）
          </label>
        </section>

        <section>
          <h3>url（WMS 服务地址）</h3>
          <input type="text" className="full-width" value={url} onChange={e => setUrl(e.target.value)} />
        </section>

        <section>
          <h3>params（WMS 参数 JSON）</h3>
          <textarea
            className="full-width"
            rows={5}
            value={paramsStr}
            onChange={e => setParamsStr(e.target.value)}
          />
          <p className="muted small">LAYERS 必填。其他常用：FORMAT、TRANSPARENT、VERSION 等。</p>
        </section>

        <section>
          <h3>opacity: {opacity}</h3>
          <input type="range" min={0} max={1} step={0.1} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="full-width" />
        </section>

        <section>
          <h3>预设</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => { setUrl(DEFAULT_URL); setParamsStr(JSON.stringify(DEFAULT_PARAMS, null, 2)); setOpacity(1); setVisible(true); }}>reset all</button>
          </div>
          <p className="muted small">
            ⚠️ WMS 服务必须配置 CORS（Access-Control-Allow-Origin）才能从浏览器加载瓦片。
            大多数公共 WMS 服务（USGS、OSM 等）不开 CORS，会报 net::ERR_FAILED。
            需要填自己部署的、已配置 CORS 的 WMS 服务地址。
          </p>
        </section>

        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`<Map defaultCenter={center} defaultZoom={6}>
  <WMSLayer
    url="https://mrdata.usgs.gov/services/mrds"
    params={{ LAYERS: 'mrds', FORMAT: 'image/png', TRANSPARENT: 'true' }}
    opacity={0.8}
  />
</Map>`}
          </pre>
        </section>
      </div>
    </div>
  );
}
