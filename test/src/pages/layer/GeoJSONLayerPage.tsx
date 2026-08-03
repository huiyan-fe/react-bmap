/**
 * GeoJSONLayer 测试页 — v4+。GeoJSON 覆盖物组合图层。
 * 支持点（markerStyle）、线（polylineStyle）、面（polygonStyle）三种几何类型。
 *
 * 注意：markerStyle.icon 需要 SDK BMap.Icon 实例，plain object 会报错。
 * 组件方式不支持传入 SDK Icon 实例，因此 markerStyle 只设置 title 等基本属性。
 * 如需自定义图标，请用 driver.createIcon() 创建后通过 driver 方式调用。
 */
import React, { useState } from 'react';
import { Map, GeoJSONLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

// ─── 数据预设 ───
const POINTS_DATA = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.404, 39.915] }, properties: { name: '天安门' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.415, 39.910] }, properties: { name: '故宫' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.397, 39.913] }, properties: { name: '中山公园' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.417, 39.928] }, properties: { name: '北海公园' } },
  ],
};

const LINES_DATA = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[116.390, 39.910], [116.404, 39.915], [116.415, 39.910], [116.425, 39.920]] }, properties: { name: '路线1' } },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[116.380, 39.925], [116.400, 39.925], [116.420, 39.925]] }, properties: { name: '路线2' } },
  ],
};

const POLYGONS_DATA = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[116.395, 39.910], [116.410, 39.910], [116.410, 39.920], [116.395, 39.920], [116.395, 39.910]]] },
      properties: { name: '区域A' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[116.415, 39.915], [116.430, 39.915], [116.430, 39.925], [116.415, 39.925], [116.415, 39.915]]] },
      properties: { name: '区域B' },
    },
  ],
};

const ALL_DATA = {
  type: 'FeatureCollection',
  features: [...POINTS_DATA.features, ...LINES_DATA.features, ...POLYGONS_DATA.features],
};

const DATA_PRESETS = [
  { label: '点标注', data: POINTS_DATA },
  { label: '线路', data: LINES_DATA },
  { label: '区域', data: POLYGONS_DATA },
  { label: '全部', data: ALL_DATA },
] as const;

const COLORS = ['#1890ff', '#52c41a', '#fa8c16', '#ff4d4f', '#722ed1'];

export function GeoJSONLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('GeoJSONLayer');
  const [visible, setVisible] = useState(true);
  const [dataIdx, setDataIdx] = useState(0);
  const [lineColor, setLineColor] = useState(COLORS[1]);
  const [lineWidth, setLineWidth] = useState(4);
  const [polygonStroke, setPolygonStroke] = useState(COLORS[2]);
  const [polygonFill, setPolygonFill] = useState(COLORS[0]);
  const [polygonOpacity, setPolygonOpacity] = useState(0.3);

  const data = DATA_PRESETS[dataIdx].data;

  // 所有 props 变化时通过 key 重建
  const rebuildKey = `${dataIdx}|${lineColor}|${lineWidth}|${polygonStroke}|${polygonFill}|${polygonOpacity}`;

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={13} style={{ height: '100%' }}>
          {visible && supported && (
            <GeoJSONLayer
              key={rebuildKey}
              dataSource={data}
              markerStyle={{ title: 'GeoJSON 点标注' }}
              polylineStyle={{ strokeColor: lineColor, strokeWeight: lineWidth, strokeOpacity: 0.9 }}
              polygonStyle={{ strokeColor: polygonStroke, strokeWeight: 2, fillColor: polygonFill, fillOpacity: polygonOpacity }}
            />
          )}
        </Map>
      </div>
      <div className="test-controls">
        <h2>GeoJSONLayer</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span>
          <p className="muted small">@since 4.0。GeoJSON 覆盖物组合图层，通过 map.addLayer / map.removeLayer 管理。v3 不支持。</p>
        </section>

        <section>
          <h3>显示</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            显示图层（挂载 / 卸载）
          </label>
        </section>

        <section>
          <h3>数据预设</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {DATA_PRESETS.map((p, i) => (
              <button key={p.label} className={dataIdx === i ? 'active' : ''} style={{ fontSize: 11 }} onClick={() => setDataIdx(i)}>
                {p.label}（{(p.data as any).features.length}）
              </button>
            ))}
          </div>
          <p className="muted small">dataSource 变化时通过 key 重建图层</p>
        </section>

        <section>
          <h3>markerStyle（点样式）</h3>
          <p className="muted small">
            点标注使用 SDK 默认图标。markerStyle.icon 需要 BMap.Icon 实例，
            组件方式无法传入 plain object（SDK 会报 getCurrentImageUrl is not a function）。
            如需自定义图标请用 driver.createIcon() 创建后通过 driver 方式调用。
          </p>
        </section>

        <section>
          <h3>polylineStyle（线样式）</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button key={c} className={lineColor === c ? 'active' : ''} style={{ fontSize: 10, background: c, color: '#fff' }} onClick={() => setLineColor(c)}>
                {c}
              </button>
            ))}
          </div>
          <label className="checkbox-row">
            strokeWeight: {lineWidth}
            <input type="range" min={1} max={10} value={lineWidth} onChange={e => setLineWidth(Number(e.target.value))} />
          </label>
        </section>

        <section>
          <h3>polygonStyle（面样式）</h3>
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>strokeColor</div>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button key={c} className={polygonStroke === c ? 'active' : ''} style={{ fontSize: 10, background: c, color: '#fff' }} onClick={() => setPolygonStroke(c)}>
                {c}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, marginTop: 6, marginBottom: 4 }}>fillColor</div>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button key={c} className={polygonFill === c ? 'active' : ''} style={{ fontSize: 10, background: c, color: '#fff' }} onClick={() => setPolygonFill(c)}>
                {c}
              </button>
            ))}
          </div>
          <label className="checkbox-row">
            fillOpacity: {polygonOpacity}
            <input type="range" min={0} max={1} step={0.1} value={polygonOpacity} onChange={e => setPolygonOpacity(Number(e.target.value))} />
          </label>
        </section>

        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setVisible(true); setDataIdx(0);
              setLineColor(COLORS[1]); setLineWidth(4); setPolygonStroke(COLORS[2]);
              setPolygonFill(COLORS[0]); setPolygonOpacity(0.3);
            }}>reset all</button>
          </div>
        </section>

        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`const geojson = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.404, 39.915] }, properties: {} },
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[...], [...]] }, properties: {} },
    { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[...]]] }, properties: {} },
  ],
};

<Map defaultCenter={center} defaultZoom={13}>
  <GeoJSONLayer
    dataSource={geojson}
    markerStyle={{ title: '标注' }}
    polylineStyle={{ strokeColor: '#52c41a', strokeWeight: 4 }}
    polygonStyle={{ strokeColor: '#fa8c16', fillColor: '#1890ff', fillOpacity: 0.3 }}
  />
</Map>`}
          </pre>
        </section>
      </div>
    </div>
  );
}
