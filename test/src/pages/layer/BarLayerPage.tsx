/** BarLayer 测试页 — v4+ 柱状图层。 */
import React, { useState } from 'react';
import { Map, BarLayer, useCapabilities } from '@baidumap/react-bmap';
import { BEIJING } from '../../TestProvider';
import { randomBarData, useEventLog, LogPanel } from './visualDemoUtils';

const COUNT_OPTIONS = [40, 80, 200];
const SIZE_OPTIONS = [1500, 5000, 20000];
const HEIGHT_OPTIONS = [3000, 10000, 50000];

export function BarLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('BarLayer');
  const [count, setCount] = useState(80);
  const [data, setData] = useState(() => randomBarData(80));
  const [color, setColor] = useState('rgba(0, 180, 0, 1)');
  const [size, setSize] = useState(1500);
  const [height, setHeight] = useState(3000);
  const [edgeCount, setEdgeCount] = useState(50);
  const [unit, setUnit] = useState<'m' | 'px'>('m');
  const events = useEventLog();

  const regenerate = (n = count) => { setCount(n); setData(randomBarData(n)); events.push(`重新生成 ${n} 根柱`); };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}>
          {supported && (
            <BarLayer
              data={data as any}
              color={color}
              size={size}
              height={height}
              edgeCount={edgeCount}
              unit={unit}
              onClick={(e: any) => events.push(`click ${e?.value?.properties?.name ?? ''} value=${e?.value?.properties?.value ?? ''}`)}
              onMouseOver={(e: any) => events.push(`mouseover ${e?.value?.properties?.name ?? ''}`)}
              onMouseOut={() => events.push('mouseout')}
              onMouseMove={() => events.push('mousemove')}
            />
          )}
        </Map>
        <LogPanel state={events} hint="点击 / 悬停柱体触发事件" />
      </div>
      <div className="test-controls">
        <h2>BarLayer</h2>
        <section>
          <h3>能力 <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span></h3>
          <p className="muted small">@since 4.0。柱状图层，data 为 GeoJSON 点数据；height 取 properties.value（0~1000）。unit 默认 m，size/height 为米量级。</p>
        </section>
        <section>
          <h3>数据</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {COUNT_OPTIONS.map(n => <button key={n} style={{ fontSize: 11 }} className={count === n ? 'active' : ''} onClick={() => regenerate(n)}>{n} 柱</button>)}
            <button style={{ fontSize: 11 }} onClick={() => regenerate()}>重新生成</button>
          </div>
        </section>
        <section>
          <h3>样式</h3>
          <label>柱色 <input type="color" value={color.startsWith('rgba') ? '#00b400' : color} onChange={e => setColor(e.target.value)} /></label>
        </section>
        <section>
          <h3>size（米 / px）</h3>
          <div className="btn-group">
            {SIZE_OPTIONS.map(s => <button key={s} style={{ fontSize: 11 }} className={size === s ? 'active' : ''} onClick={() => setSize(s)}>{s}</button>)}
          </div>
          <p className="muted small">切到 px 单位时请用像素量级（如 30），沿用米单位大数值会被视锥裁掉。</p>
        </section>
        <section>
          <h3>height</h3>
          <div className="btn-group">
            {HEIGHT_OPTIONS.map(h => <button key={h} style={{ fontSize: 11 }} className={height === h ? 'active' : ''} onClick={() => setHeight(h)}>{h}</button>)}
          </div>
        </section>
        <section>
          <h3>edgeCount: {edgeCount}</h3>
          <input type="range" min={4} max={64} value={edgeCount} onChange={e => setEdgeCount(+e.target.value)} className="full-width" />
        </section>
        <section>
          <h3>unit</h3>
          <div className="btn-group">
            {(['m', 'px'] as const).map(u => <button key={u} style={{ fontSize: 11 }} className={unit === u ? 'active' : ''} onClick={() => setUnit(u)}>{u}</button>)}
          </div>
        </section>
        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`<BarLayer data={geojson} color="${color}"
  size={1500} height={3000} edgeCount={50} unit="m" />`}</pre>
        </section>
      </div>
    </div>
  );
}
