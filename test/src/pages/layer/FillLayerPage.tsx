/**
 * FillLayer 测试页 — v4+。面填充图层。
 * 支持 setData（GeoJSON 数据）、setStyleOptions（运行时样式更新）。
 *
 * 组件方式：
 * <FillLayer border style={{ fillColor, strokeColor }} data={geojson} enablePicked />
 */
import React, { useMemo, useState } from 'react';
import { Map, FillLayer, useCapabilities } from 'react-bmap';
import type { FillLayerStyle } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

// demo GeoJSON — 多边形
const POLYGON_DATA = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[116.395, 39.910], [116.410, 39.910], [116.410, 39.920], [116.395, 39.920], [116.395, 39.910]]] },
      properties: { id: 1, name: '区域A' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[116.415, 39.915], [116.430, 39.915], [116.430, 39.925], [116.415, 39.925], [116.415, 39.915]]] },
      properties: { id: 2, name: '区域B' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[116.380, 39.900], [116.390, 39.900], [116.390, 39.910], [116.380, 39.910], [116.380, 39.900]]] },
      properties: { id: 3, name: '区域C' },
    },
  ],
};

const COLORS = ['#1890ff', '#52c41a', '#fa8c16', '#ff4d4f', '#722ed1'];

export function FillLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('FillLayer');
  const [visible, setVisible] = useState(true);
  const [border, setBorder] = useState(true);
  const [enablePicked, setEnablePicked] = useState(true);
  const [fillColor, setFillColor] = useState('rgba(24, 144, 255, 0.4)');
  const [borderWeight, setBorderWeight] = useState(2);
  const [borderColor, setBorderColor] = useState('#1890ff');
  const [strokeColor, setStrokeColor] = useState('#1890ff');
  const [strokeWeight, setStrokeWeight] = useState(2);
  const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [opacity, setOpacity] = useState(1);

  const style = useMemo<FillLayerStyle>(() => ({
    fillColor,
    fillOpacity: opacity,
    borderWeight,
    borderColor,
    strokeColor,
    strokeWeight,
    strokeStyle,
  }), [fillColor, opacity, borderWeight, borderColor, strokeColor, strokeWeight, strokeStyle]);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={13} style={{ height: '100%' }}>
          {visible && supported && (
            <FillLayer
              border={border}
              enablePicked={enablePicked}
              idKey="id"
              style={style}
              data={POLYGON_DATA}
            />
          )}
        </Map>
      </div>
      <div className="test-controls">
        <h2>FillLayer</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span>
          <p className="muted small">@since 4.0。面填充图层，支持纯色填充、描边、纹理填充。通过 setData 加载 GeoJSON 数据。v3 不支持。</p>
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
          <p className="muted small">{POLYGON_DATA.features.length} 个多边形（区域 A/B/C），data 变化时组件内部调用 setData()。</p>
        </section>

        <section>
          <h3>border</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={border} onChange={e => setBorder(e.target.checked)} />
            显示描边（重建）
          </label>
        </section>

        <section>
          <h3>enablePicked</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={enablePicked} onChange={e => setEnablePicked(e.target.checked)} />
            允许鼠标点击拾取（重建）
          </label>
        </section>

        <section>
          <h3>fillColor（填充色）</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button key={c} className={fillColor.includes(c) ? 'active' : ''} style={{ fontSize: 10, background: c, color: '#fff' }} onClick={() => setFillColor(`${c}66`)}>
                {c}
              </button>
            ))}
          </div>
          <p className="muted small">style 变化时调用 setStyleOptions() + doOnceDraw()，实时更新。</p>
        </section>

        <section>
          <h3>borderWeight: {borderWeight}（填充区描边宽度）</h3>
          <input type="range" min={0} max={10} value={borderWeight} onChange={e => setBorderWeight(Number(e.target.value))} className="full-width" />
        </section>

        <section>
          <h3>borderColor（填充区描边色）</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button key={c} className={borderColor === c ? 'active' : ''} style={{ fontSize: 10, background: c, color: '#fff' }} onClick={() => setBorderColor(c)}>
                {c}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>strokeColor（轮廓线色）</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button key={c} className={strokeColor === c ? 'active' : ''} style={{ fontSize: 10, background: c, color: '#fff' }} onClick={() => setStrokeColor(c)}>
                {c}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>strokeWeight: {strokeWeight}</h3>
          <input type="range" min={0} max={10} value={strokeWeight} onChange={e => setStrokeWeight(Number(e.target.value))} className="full-width" />
        </section>

        <section>
          <h3>strokeStyle</h3>
          <div className="btn-group">
            {(['solid', 'dashed', 'dotted'] as const).map(s => (
              <button key={s} className={strokeStyle === s ? 'active' : ''} style={{ fontSize: 11 }} onClick={() => setStrokeStyle(s)}>{s}</button>
            ))}
          </div>
        </section>

        <section>
          <h3>fillOpacity: {opacity}</h3>
          <input type="range" min={0} max={1} step={0.1} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="full-width" />
        </section>

        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => { setVisible(true); setBorder(true); setEnablePicked(true); setFillColor('rgba(24, 144, 255, 0.4)'); setBorderWeight(2); setBorderColor('#1890ff'); setStrokeColor('#1890ff'); setStrokeWeight(2); setStrokeStyle('solid'); setOpacity(1); }}>reset all</button>
          </div>
        </section>

        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`const geojson = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[...]]] }, properties: { id: 1 } },
  ],
};

<Map defaultCenter={center} defaultZoom={13}>
  <FillLayer
    border
    enablePicked
    idKey="id"
    style={{
      fillColor: 'rgba(24, 144, 255, 0.4)',
      strokeColor: '#1890ff',
      strokeWeight: 2,
      strokeStyle: 'solid',
    }}
    data={geojson}
  />
</Map>`}
          </pre>
        </section>

        <section>
          <h3>SDK 实例方法</h3>
          <p className="muted small">
            组件内部支持：data → setData()、style → setStyleOptions() + doOnceDraw()<br />
            其他方法（需通过 driver 获取 raw 实例）：<br />
            • updateState(keys, params) — 更新要素状态<br />
            • removeState(keys) / clearState() — 移除/清空状态<br />
            • setBaseOptions(opts) — 更新基础配置<br />
            • setVisible(v) / setOpacity(v) / setZIndex(z)<br />
            • addDelIndex(i) / removeDelIndex(i) — 隐藏/显示指定索引<br />
            • 事件：click / dblclick / mousemove / mouseout / dataparsed
          </p>
        </section>
      </div>
    </div>
  );
}
