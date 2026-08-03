/**
 * XYZLayer 测试页 — v4+。XYZ 瓦片图层。
 * 适用于标准 XYZ 瓦片 URL（如 OpenStreetMap、天地图等）。
 * 支持 tileUrlTemplate（[z]/[x]/[y] 占位符）和 tms 模式。
 */
import React, { useState } from 'react';
import { Map, XYZLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const TILE_PRESETS = [
  { label: 'OSM 地图', url: 'https://tile.openstreetmap.org/[z]/[x]/[y].png' },
];

export function XYZLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('XYZLayer');
  const [visible, setVisible] = useState(true);
  const [url, setUrl] = useState(TILE_PRESETS[0].url);
  const [opacity, setOpacity] = useState(1);
  const [tms, setTms] = useState(false);
  const [minZoom, setMinZoom] = useState<number | undefined>(undefined);
  const [maxZoom, setMaxZoom] = useState<number | undefined>(undefined);

  const rebuildKey = `${url}|${opacity}|${tms}|${minZoom ?? ''}|${maxZoom ?? ''}`;

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={6} style={{ height: '100%' }}>
          {visible && supported && (
            <XYZLayer
              key={rebuildKey}
              tileUrlTemplate={url}
              opacity={opacity !== 1 ? opacity : undefined}
              tms={tms || undefined}
              minZoom={minZoom}
              maxZoom={maxZoom}
            />
          )}
        </Map>
      </div>
      <div className="test-controls">
        <h2>XYZLayer</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span>
          <p className="muted small">@since 4.0。XYZ 瓦片图层，支持标准 XYZ 瓦片 URL。v3 不支持。</p>
        </section>

        <section>
          <h3>显示</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            显示图层（挂载 / 卸载）
          </label>
        </section>

        <section>
          <h3>tileUrlTemplate</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {TILE_PRESETS.map((p, i) => (
              <button key={i} className={url === p.url ? 'active' : ''} style={{ fontSize: 11 }} onClick={() => setUrl(p.url)}>
                {p.label}
              </button>
            ))}
          </div>
          <textarea className="full-width" rows={2} value={url} onChange={e => setUrl(e.target.value)} />
          <p className="muted small">占位符：[z]/[x]/[y] 或 {'{z}'}/{'{x}'}/{'{y}'}。变化时重建图层。</p>
        </section>

        <section>
          <h3>opacity: {opacity}</h3>
          <input type="range" min={0} max={1} step={0.1} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="full-width" />
        </section>

        <section>
          <h3>tms</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={tms} onChange={e => setTms(e.target.checked)} />
            tms（Y 轴翻转，重建）
          </label>
          <p className="muted small">TMS 服务的 Y 坐标从下往上，XYZ 从上往下。勾选后自动翻转 Y。</p>
        </section>

        <section>
          <h3>缩放范围</h3>
          <label className="checkbox-row">
            minZoom
            <input type="number" placeholder="未设置" value={minZoom ?? ''} onChange={e => setMinZoom(e.target.value === '' ? undefined : Number(e.target.value))} />
          </label>
          <label className="checkbox-row">
            maxZoom
            <input type="number" placeholder="未设置" value={maxZoom ?? ''} onChange={e => setMaxZoom(e.target.value === '' ? undefined : Number(e.target.value))} />
          </label>
        </section>

        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => { setVisible(true); setUrl(TILE_PRESETS[0].url); setOpacity(1); setTms(false); setMinZoom(undefined); setMaxZoom(undefined); }}>reset all</button>
          </div>
        </section>

        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`<Map defaultCenter={center} defaultZoom={6}>
  <XYZLayer
    tileUrlTemplate="https://tile.openstreetmap.org/[z]/[x]/[y].png"
    opacity={0.8}
    minZoom={3}
    maxZoom={18}
  />
</Map>`}
          </pre>
        </section>
      </div>
    </div>
  );
}
