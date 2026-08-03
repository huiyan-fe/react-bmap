/**
 * FeatureLayer 测试页 — v4+。矢量要素图层，继承 NormalLayer。
 * 支持 setData / updateState / clearState 等方法。
 *
 * 组件方式：
 * <FeatureLayer idKey="id" enablePicked data={geojson} />
 *
 * data 变化时组件内部调用 raw.setData()。
 */
import React, { useMemo, useState } from 'react';
import { Map, FeatureLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

// demo GeoJSON — 多边形 + 点
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
  ],
};

const POINT_DATA = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.404, 39.915] }, properties: { id: 1, name: '天安门' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.415, 39.910] }, properties: { id: 2, name: '故宫' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.397, 39.913] }, properties: { id: 3, name: '中山公园' } },
  ],
};

const MIXED_DATA = {
  type: 'FeatureCollection',
  features: [...POLYGON_DATA.features, ...POINT_DATA.features],
};

const DATA_PRESETS = [
  { label: '多边形', data: POLYGON_DATA },
  { label: '点', data: POINT_DATA },
  { label: '混合', data: MIXED_DATA },
] as const;

const SELECTED_COLORS = [
  'rgba(255, 0, 0, 1.0)',
  'rgba(0, 255, 0, 1.0)',
  'rgba(0, 0, 255, 1.0)',
  'rgba(255, 165, 0, 1.0)',
];

export function FeatureLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('FeatureLayer');
  const [visible, setVisible] = useState(true);
  const [dataIdx, setDataIdx] = useState(0);
  const [enablePicked, setEnablePicked] = useState(true);
  const [selectedColor, setSelectedColor] = useState(SELECTED_COLORS[0]);
  const [opacity, setOpacity] = useState(1);

  const data = DATA_PRESETS[dataIdx].data;
  const dataKey = useMemo(() => JSON.stringify(data), [data]);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={13} style={{ height: '100%' }}>
          {visible && supported && (
            <FeatureLayer
              idKey="id"
              crs="BD09LL"
              enablePicked={enablePicked}
              selectedColor={selectedColor}
              opacity={opacity !== 1 ? opacity : undefined}
              data={data}
            />
          )}
        </Map>
      </div>
      <div className="test-controls">
        <h2>FeatureLayer</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span>
          <p className="muted small">
            @since 4.0，@internal。FeatureLayer 是 SDK 内部类，运行时未公开暴露（BMap.FeatureLayer 不存在）。
            矢量要素图层功能请使用 FillLayer / PointIconLayer / PointShapeLayer 等具体子类。
          </p>
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
                {p.label}（{p.data.features.length}）
              </button>
            ))}
          </div>
          <p className="muted small">data 变化时组件内部调用 raw.setData()，实时更新。</p>
        </section>

        <section>
          <h3>enablePicked</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={enablePicked} onChange={e => setEnablePicked(e.target.checked)} />
            允许鼠标点击拾取（重建）
          </label>
        </section>

        <section>
          <h3>selectedColor</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {SELECTED_COLORS.map((c, i) => (
              <button key={c} className={selectedColor === c ? 'active' : ''} style={{ fontSize: 10, background: c, color: '#fff' }} onClick={() => setSelectedColor(c)}>
                {c}
              </button>
            ))}
          </div>
          <p className="muted small">选中要素的颜色（重建）</p>
        </section>

        <section>
          <h3>opacity: {opacity}</h3>
          <input type="range" min={0} max={1} step={0.1} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="full-width" />
        </section>

        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => { setVisible(true); setDataIdx(0); setEnablePicked(true); setSelectedColor(SELECTED_COLORS[0]); setOpacity(1); }}>reset all</button>
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
  <FeatureLayer
    idKey="id"
    crs="BD09LL"
    enablePicked
    selectedColor="rgba(255, 0, 0, 1.0)"
    data={geojson}
  />
</Map>`}
          </pre>
        </section>

        <section>
          <h3>SDK 实例方法</h3>
          <p className="muted small">
            组件内部支持：data → setData()<br />
            其他方法（需通过 driver 获取 raw 实例）：<br />
            • updateState(keys, params) — 更新要素状态<br />
            • removeState(keys) — 移除要素状态<br />
            • clearState() — 清空要素状态<br />
            • addDelIndex(index) / removeDelIndex(index) — 隐藏/显示指定索引要素<br />
            • setBaseOptions(opts) / setStyleOptions(opts) — 更新配置/样式
          </p>
        </section>
      </div>
    </div>
  );
}
