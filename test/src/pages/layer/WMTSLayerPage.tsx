/**
 * WMTSLayer 测试页 — v4+。WMTS 标准瓦片矩阵服务图层。
 * 需要 url + params（LAYER / TILEMATRIXSET 等必填）。
 * 和 WMSLayer 一样受 CORS 限制。
 */
import React, { useState } from 'react';
import { Map, WMTSLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const DEFAULT_URL = '';
const DEFAULT_PARAMS = '{\n  "LAYER": "",\n  "TILEMATRIXSET": "",\n  "FORMAT": "image/png",\n  "TRANSPARENT": "true"\n}';

export function WMTSLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('WMTSLayer');
  const [visible, setVisible] = useState(true);
  const [url, setUrl] = useState(DEFAULT_URL);
  const [paramsStr, setParamsStr] = useState(DEFAULT_PARAMS);
  const [opacity, setOpacity] = useState(1);

  let params: Record<string, string> | undefined;
  try { params = JSON.parse(paramsStr); } catch { params = undefined; }

  const rebuildKey = `${url}|${paramsStr}|${opacity}`;

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={6} style={{ height: '100%' }}>
          {visible && supported && url && params && (
            <WMTSLayer
              key={rebuildKey}
              url={url}
              params={params}
              opacity={opacity !== 1 ? opacity : undefined}
            />
          )}
        </Map>
      </div>
      <div className="test-controls">
        <h2>WMTSLayer</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span>
          <p className="muted small">@since 4.0。WMTS 标准瓦片矩阵服务图层。v3 不支持。</p>
        </section>

        <section>
          <h3>显示</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            显示图层（挂载 / 卸载）
          </label>
        </section>

        <section>
          <h3>url（WMTS 服务地址）</h3>
          <input type="text" className="full-width" placeholder="https://your-wmts-server/wmts" value={url} onChange={e => setUrl(e.target.value)} />
        </section>

        <section>
          <h3>params（WMTS 参数 JSON）</h3>
          <textarea
            className="full-width"
            rows={5}
            value={paramsStr}
            onChange={e => setParamsStr(e.target.value)}
          />
          <p className="muted small">LAYER 和 TILEMATRIXSET 必填。其他：FORMAT、TRANSPARENT、VERSION 等。</p>
        </section>

        <section>
          <h3>opacity: {opacity}</h3>
          <input type="range" min={0} max={1} step={0.1} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="full-width" />
        </section>

        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => { setVisible(true); setUrl(DEFAULT_URL); setParamsStr(DEFAULT_PARAMS); setOpacity(1); }}>reset all</button>
          </div>
        </section>

        <section>
          <h3>说明</h3>
          <p className="muted small">
            ⚠️ WMTS 服务必须配置 CORS 才能从浏览器加载瓦片。
            大多数公共 WMTS 服务不开 CORS，会报 net::ERR_FAILED。
            需要填自己部署的、已配置 CORS 的 WMTS 服务地址。
            WMTS 与 WMS 的区别：WMTS 是预切好的静态瓦片（快），WMS 是服务端实时渲染（慢）。
          </p>
        </section>

        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`<Map defaultCenter={center} defaultZoom={6}>
  <WMTSLayer
    url="https://your-wmts-server/wmts"
    params={{
      LAYER: 'your_layer',
      TILEMATRIXSET: 'default',
      FORMAT: 'image/png',
      TRANSPARENT: 'true',
    }}
    opacity={0.8}
  />
</Map>`}
          </pre>
        </section>
      </div>
    </div>
  );
}
