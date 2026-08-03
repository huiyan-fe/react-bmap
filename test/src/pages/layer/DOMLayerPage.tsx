/**
 * DOMLayer 测试页 — v4+。自定义 DOM 覆盖物图层。
 * 通过 createDOM 回调创建自定义 DOM 元素，setData 加载 GeoJSON 数据。
 *
 * 组件方式：
 * <DOMLayer createDOM={(props, point) => { ... return HTMLElement; }} data={geojson} />
 */
import React, { useCallback, useState } from 'react';
import { Map, DOMLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const DEMO_DATA = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.404, 39.915] }, properties: { name: '天安门' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.415, 39.910] }, properties: { name: '故宫' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.397, 39.913] }, properties: { name: '中山公园' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.417, 39.928] }, properties: { name: '北海公园' } },
  ],
};

const COLORS = ['#1890ff', '#52c41a', '#fa8c16', '#ff4d4f', '#722ed1'];

export function DOMLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('DOMLayer');
  const [visible, setVisible] = useState(true);
  const [colorIdx, setColorIdx] = useState(0);
  const [enableDraggingMap, setEnableDraggingMap] = useState(true);
  const [fontSize, setFontSize] = useState(12);

  const createDOM = useCallback((properties: any, point: any) => {
    const div = document.createElement('div');
    const color = COLORS[colorIdx];
    div.style.cssText = `background:${color};color:#fff;padding:${fontSize / 3}px ${fontSize * 0.6}px;border-radius:4px;font-size:${fontSize}px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;`;
    div.textContent = properties?.name ?? '';
    return div;
  }, [colorIdx, fontSize]);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={14} style={{ height: '100%' }}>
          {visible && supported && (
            <DOMLayer
              key={`${colorIdx}|${fontSize}|${enableDraggingMap}`}
              createDOM={createDOM}
              data={DEMO_DATA}
              enableDraggingMap={enableDraggingMap}
              minZoom={5}
              maxZoom={20}
            />
          )}
        </Map>
      </div>
      <div className="test-controls">
        <h2>DOMLayer</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span>
          <p className="muted small">@since 4.0。自定义 DOM 覆盖物图层，批量管理 DOM 覆盖物。通过 createDOM 回调创建自定义 DOM 元素。v3 不支持。</p>
        </section>

        <section>
          <h3>显示</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            显示图层（挂载 / 卸载）
          </label>
        </section>

        <section>
          <h3>数据</h3>
          <p className="muted small">{DEMO_DATA.features.length} 个点标注（天安门/故宫/中山公园/北海公园），data 变化时调用 setData()。</p>
        </section>

        <section>
          <h3>createDOM 回调（DOM 样式）</h3>
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>背景色</div>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {COLORS.map((c, i) => (
              <button key={c} className={colorIdx === i ? 'active' : ''} style={{ fontSize: 10, background: c, color: '#fff' }} onClick={() => setColorIdx(i)}>
                {c}
              </button>
            ))}
          </div>
          <label className="checkbox-row">
            fontSize: {fontSize}px
            <input type="range" min={8} max={24} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} />
          </label>
          <p className="muted small">createDOM 变化时重建图层（通过 key）。</p>
        </section>

        <section>
          <h3>enableDraggingMap</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={enableDraggingMap} onChange={e => setEnableDraggingMap(e.target.checked)} />
            允许在 DOM 覆盖物上拖拽地图（重建）
          </label>
        </section>

        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => { setVisible(true); setColorIdx(0); setEnableDraggingMap(true); setFontSize(12); }}>reset all</button>
          </div>
        </section>

        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`<Map defaultCenter={center} defaultZoom={14}>
  <DOMLayer
    createDOM={(properties, point) => {
      const div = document.createElement('div');
      div.style.cssText = 'background:#1890ff;color:#fff;padding:4px 8px;border-radius:4px;';
      div.textContent = properties.name;
      return div;
    }}
    data={{
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'Point', coordinates: [116.404, 39.915] }, properties: { name: '天安门' } },
      ],
    }}
    enableDraggingMap
  />
</Map>`}
          </pre>
        </section>

        <section>
          <h3>SDK 实例方法</h3>
          <p className="muted small">
            组件内部支持：createDOM → constructor, data → setData()<br />
            其他方法：show() / hide() / setStyleOptions() / removeAllOverlays() / removeOverlay()<br />
            事件：click / mouseover / mouseout
          </p>
        </section>
      </div>
    </div>
  );
}
