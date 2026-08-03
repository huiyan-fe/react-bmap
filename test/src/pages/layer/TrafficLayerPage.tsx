/**
 * TrafficLayer 测试页 — 全版本共有。路况图层，继承 TileLayer。
 * v4 通过 map.addLayer / map.removeLayer 管理（setTrafficOn 已废弃）。
 *
 * 组件方式：
 * <TrafficLayer autoRefresh refreshInterval={300000} colors={[...]} edge />
 *
 * setColors / setEdge 在组件内部实现（TrafficLayer.tsx），通过 props 驱动。
 */
import React, { useState } from 'react';
import { Map, TrafficLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const DEFAULT_COLORS = ['#00ff00', '#ffff00', '#ff8800', '#ff0000'];
const TRAFFIC_LABELS = ['畅通', '缓行', '拥堵', '严重'];

export function TrafficLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('TrafficLayer');
  const isV4 = caps.has('Map.setHeading');
  const [visible, setVisible] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(300000);
  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [edge, setEdge] = useState(true);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}>
          {visible && supported && (
            <TrafficLayer
              autoRefresh={autoRefresh}
              refreshInterval={refreshInterval}
              colors={isV4 ? colors : undefined}
              edge={isV4 ? edge : undefined}
            />
          )}
        </Map>
      </div>
      <div className="test-controls">
        <h2>TrafficLayer</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'supported' : 'unsupported'}</span>
          <p className="muted small">全版本共有。路况图层，继承 TileLayer。v4 通过 map.addLayer / map.removeLayer 管理。</p>
        </section>

        <section>
          <h3>显示</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            显示图层（挂载 / 卸载）
          </label>
        </section>

        <section>
          <h3>constructor 选项</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
            autoRefresh（自动刷新，v4）
          </label>
          <label className="checkbox-row">
            refreshInterval (ms)
            <input type="number" value={refreshInterval} onChange={e => setRefreshInterval(Number(e.target.value))} />
          </label>
          <p className="muted small">变化时组件内部重建图层</p>
        </section>

        {isV4 && (
          <>
            <section>
              <h3>colors（v4+ setColors）</h3>
              <p className="muted small">路况颜色：畅通、缓行、拥堵、严重拥堵</p>
              {colors.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, width: 60 }}>{TRAFFIC_LABELS[i]}</span>
                  <input type="color" value={c} onChange={e => {
                    const next = [...colors]; next[i] = e.target.value; setColors(next);
                  }} />
                  <code style={{ fontSize: 11 }}>{c}</code>
                </div>
              ))}
            </section>

            <section>
              <h3>edge（v4+ setEdge）</h3>
              <label className="checkbox-row">
                <input type="checkbox" checked={edge} onChange={e => setEdge(e.target.checked)} />
                显示白边（路况描边）
              </label>
            </section>
          </>
        )}

        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setVisible(true); setAutoRefresh(true); setRefreshInterval(300000);
              setColors(DEFAULT_COLORS); setEdge(true);
            }}>reset all</button>
          </div>
        </section>

        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`<Map defaultCenter={center} defaultZoom={12}>
  <TrafficLayer
    autoRefresh
    refreshInterval={300000}
    colors={['#00ff00', '#ffff00', '#ff8800', '#ff0000']}
    edge
  />
</Map>`}
          </pre>
        </section>
      </div>
    </div>
  );
}
