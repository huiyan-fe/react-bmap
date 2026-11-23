/** HeatmapLayer 测试页 — v4+ 热力图图层。 */
import React, { useState } from 'react';
import { Map, HeatmapLayer, useCapabilities } from '@baidumap/react-bmap';
import { BEIJING } from '../../TestProvider';
import { C, randomPointsData, useEventLog, LogPanel } from './visualDemoUtils';

const COUNT_OPTIONS = [200, 300, 500];
const GRADIENT_PRESETS: Array<{ label: string; value: Record<number, string> }> = [
  { label: '蓝绿黄红', value: { 0: 'rgba(0, 90, 255, 1)', 0.25: 'rgba(0, 200, 255, 1)', 0.5: 'rgba(0, 255, 120, 1)', 0.75: 'rgba(255, 255, 0, 1)', 1: 'rgba(255, 0, 0, 1)' } },
  { label: '红黄渐变', value: { 0: 'rgba(255, 255, 0, 1)', 1: 'rgba(255, 0, 0, 1)' } },
  { label: '黑白', value: { 0: 'rgba(0, 0, 0, 1)', 1: 'rgba(255, 255, 255, 1)' } },
];

export function HeatmapLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('Heatmap');
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(300);
  const [data, setData] = useState(() => randomPointsData(300, true));
  const [size, setSize] = useState(30);
  const [unit, setUnit] = useState<'px' | 'm'>('px');
  const [opacity, setOpacity] = useState(1);
  const [gradientIdx, setGradientIdx] = useState(0);
  const events = useEventLog();
  const weightField = 'count';

  const regenerate = (n = count) => { setCount(n); setData(randomPointsData(n, true)); events.push(`重新生成 ${n} 个点`); };
  const resetAll = () => { setVisible(true); setSize(30); setUnit('px'); setOpacity(1); setGradientIdx(0); regenerate(300); };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}>
          {visible && supported && (
            <HeatmapLayer
              data={data as any}
              size={size}
              unit={unit}
              opacity={opacity}
              gradient={GRADIENT_PRESETS[gradientIdx].value}
              weightField={weightField}
              onClick={(e: any) => events.push(`click value=${e?.value} @ ${e?.latLng ? `${e.latLng.lng},${e.latLng.lat}` : '—'}`)}
              onMouseOver={(e: any) => events.push(`mouseover value=${e?.value}`)}
              onMouseOut={(e: any) => events.push(`mouseout value=${e?.value}`)}
            />
          )}
        </Map>
        <LogPanel state={events} hint="点击 / 悬停热力图触发事件" />
      </div>
      <div className="test-controls">
        <h2>HeatmapLayer</h2>
        <section>
          <h3>能力 <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span></h3>
          <p className="muted small">@since 4.0。热力图图层，通过 setData 加载 GeoJSON，权重取 properties[weightField]（默认 count）。v3 不支持。</p>
        </section>
        <section>
          <h3>显示</h3>
          <label><input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} /> 显示图层（挂载 / 卸载）</label>
        </section>
        <section>
          <h3>数据（北京城区随机点）</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {COUNT_OPTIONS.map(n => <button key={n} style={{ fontSize: 11 }} className={count === n ? 'active' : ''} onClick={() => regenerate(n)}>{n} 点</button>)}
            <button style={{ fontSize: 11 }} onClick={() => regenerate()}>重新生成</button>
          </div>
          <p className="muted small">当前 {data.features.length} 个点；properties.count 权重 1~100。data 变化时组件内部调用 setData()。</p>
        </section>
        <section>
          <h3>size（热力核半径）: {size}</h3>
          <input type="range" min={5} max={100} value={size} onChange={e => setSize(+e.target.value)} className="full-width" />
          <p className="muted small">构造项变化 → 重建图层</p>
        </section>
        <section>
          <h3>gradient（渐变色带）</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {GRADIENT_PRESETS.map((g, i) => <button key={g.label} style={{ fontSize: 11 }} className={gradientIdx === i ? 'active' : ''} onClick={() => setGradientIdx(i)}>{g.label}</button>)}
          </div>
        </section>
        <section>
          <h3>opacity（整体透明度）: {opacity}</h3>
          <input type="range" min={0} max={1} step={0.05} value={opacity} onChange={e => setOpacity(+e.target.value)} className="full-width" />
        </section>
        <section>
          <h3>unit（半径单位）</h3>
          <div className="btn-group">
            {(['px', 'm'] as const).map(u => <button key={u} style={{ fontSize: 11 }} className={unit === u ? 'active' : ''} onClick={() => setUnit(u)}>{u}</button>)}
          </div>
          <p className="muted small">px：屏幕像素；m：按实际米数换算，随缩放变化。</p>
        </section>
        <section><button onClick={resetAll}>reset all</button></section>
        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`<HeatmapLayer data={geojson} size={30} unit="px" opacity={1}
  gradient={{ 0: 'rgba(0,90,255,1)', 0.5: 'rgba(0,255,120,1)', 1: 'rgba(255,0,0,1)' }}
  weightField="count"
  onClick={(e) => console.log(e.value, e.latLng)} />`}</pre>
        </section>
      </div>
    </div>
  );
}
