/**
 * PointShapeLayer 测试页 — v4+。点形状图层。
 * 使用 2D 几何图形（圆形、方形、三角形、五角星等）渲染点数据。
 *
 * 组件方式：
 * <PointShapeLayer style={{ shapeType: 2, size: 20, color: '#ff0000' }} data={geojson} />
 */
import React, { useMemo, useState } from 'react';
import { Map, PointShapeLayer, useCapabilities } from 'react-bmap';
import type { PointShapeStyle } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

// shapeType: 1=圆形 2=三角形 3=方形 4=菱形 5=六边形 7=五角星
const SHAPES = [
  { label: '1', type: 1 },
  { label: '2', type: 2 },
  { label: '3', type: 3 },
  { label: '4', type: 4 },
  { label: '5', type: 5 },
  { label: '7', type: 7 },
];

const COLORS = ['#1890ff', '#52c41a', '#fa8c16', '#ff4d4f', '#722ed1'];

const DEMO_DATA = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.404, 39.915] }, properties: { id: 1, name: '天安门' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.415, 39.910] }, properties: { id: 2, name: '故宫' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.397, 39.913] }, properties: { id: 3, name: '中山公园' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.417, 39.928] }, properties: { id: 4, name: '北海公园' } },
  ],
};

export function PointShapeLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('PointShapeLayer');
  const [visible, setVisible] = useState(true);
  const [shapeIdx, setShapeIdx] = useState(0);
  const [size, setSize] = useState(20);
  const [color, setColor] = useState(COLORS[0]);
  const [opacity, setOpacity] = useState(1);
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [strokeWeight, setStrokeWeight] = useState(0);
  const [rotation, setRotation] = useState(0);

  const style = useMemo<PointShapeStyle>(() => ({
    shapeType: SHAPES[shapeIdx].type,
    size,
    color,
    opacity,
    strokeColor,
    strokeWeight,
    rotation,
  }), [shapeIdx, size, color, opacity, strokeColor, strokeWeight, rotation]);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={14} style={{ height: '100%' }}>
          {visible && supported && (
            <PointShapeLayer
              idKey="id"
              style={style}
              data={DEMO_DATA}
            />
          )}
        </Map>
      </div>
      <div className="test-controls">
        <h2>PointShapeLayer</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span>
          <p className="muted small">@since 4.0。点形状图层，使用 2D 几何图形（圆形/方形/三角形/五角星等）渲染点数据。v3 不支持。</p>
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
          <p className="muted small">{DEMO_DATA.features.length} 个点标注（天安门/故宫/中山公园/北海公园）。</p>
        </section>

        <section>
          <h3>shapeType（形状）</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {SHAPES.map((s, i) => (
              <button key={s.label} className={shapeIdx === i ? 'active' : ''} style={{ fontSize: 11 }} onClick={() => setShapeIdx(i)}>
                {s.label}（{s.type}）
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>size: {size}px</h3>
          <input type="range" min={5} max={100} value={size} onChange={e => setSize(Number(e.target.value))} className="full-width" />
        </section>

        <section>
          <h3>color（填充色）</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button key={c} className={color === c ? 'active' : ''} style={{ fontSize: 10, background: c, color: '#fff' }} onClick={() => setColor(c)}>
                {c}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>opacity: {opacity}</h3>
          <input type="range" min={0} max={1} step={0.1} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="full-width" />
        </section>

        <section>
          <h3>strokeColor（描边色）</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {['#ffffff', '#000000', ...COLORS].map(c => (
              <button key={c} className={strokeColor === c ? 'active' : ''} style={{ fontSize: 10, background: c, color: c === '#ffffff' ? '#333' : '#fff' }} onClick={() => setStrokeColor(c)}>
                {c}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>strokeWeight: {strokeWeight}px</h3>
          <input type="range" min={0} max={10} value={strokeWeight} onChange={e => setStrokeWeight(Number(e.target.value))} className="full-width" />
        </section>

        <section>
          <h3>rotation: {rotation}°</h3>
          <input type="range" min={0} max={360} value={rotation} onChange={e => setRotation(Number(e.target.value))} className="full-width" />
        </section>

        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => { setVisible(true); setShapeIdx(0); setSize(20); setColor(COLORS[0]); setOpacity(1); setStrokeColor('#ffffff'); setStrokeWeight(0); setRotation(0); }}>reset all</button>
          </div>
        </section>

        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`<Map defaultCenter={center} defaultZoom={14}>
  <PointShapeLayer
    idKey="id"
    style={{
      shapeType: 2,  // 圆形
      size: 20,
      color: '#1890ff',
      opacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      rotation: 0,
    }}
    data={{
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'Point', coordinates: [116.404, 39.915] }, properties: { id: 1 } },
      ],
    }}
  />
</Map>`}
          </pre>
        </section>
      </div>
    </div>
  );
}
