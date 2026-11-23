/** PolylineLayer 测试页 — v4+ 折线图层。 */
import React, { useState } from 'react';
import { Map, PolylineLayer, useCapabilities } from '@baidumap/react-bmap';
import { BEIJING } from '../../TestProvider';
import { randomLinesData, useEventLog, LogPanel } from './visualDemoUtils';

const COUNT_OPTIONS = [4, 8, 20];

export function PolylineLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('PolylineLayer');
  const [count, setCount] = useState(8);
  const [data, setData] = useState(() => randomLinesData(8));
  const [strokeColor, setStrokeColor] = useState('#3388ff');
  const [strokeWeight, setStrokeWeight] = useState(4);
  const [strokeOpacity, setStrokeOpacity] = useState(0.9);
  const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [lineCap, setLineCap] = useState<'butt' | 'round' | 'square'>('round');
  const [lineJoin, setLineJoin] = useState<'miter' | 'bevel' | 'round'>('round');
  const events = useEventLog();

  const regenerate = (n = count) => { setCount(n); setData(randomLinesData(n)); events.push(`重新生成 ${n} 条线`); };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}>
          {supported && (
            <PolylineLayer
              data={data as any}
              strokeColor={strokeColor}
              strokeWeight={strokeWeight}
              strokeOpacity={strokeOpacity}
              strokeStyle={strokeStyle}
              dashArray={strokeStyle === 'dashed' ? [10, 5] : undefined}
              strokeLineCap={lineCap}
              strokeLineJoin={lineJoin}
              onClick={(e: any) => events.push(`click ${e?.value?.properties?.name ?? ''}`)}
              onMouseOver={(e: any) => events.push(`mouseover ${e?.value?.properties?.name ?? ''}`)}
              onMouseOut={() => events.push('mouseout')}
              onMouseMove={() => events.push('mousemove')}
            />
          )}
        </Map>
        <LogPanel state={events} hint="点击 / 悬停线触发事件" />
      </div>
      <div className="test-controls">
        <h2>PolylineLayer</h2>
        <section>
          <h3>能力 <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span></h3>
          <p className="muted small">@since 4.0。折线图层，data 为 GeoJSON 线数据，支持纯色 / 虚线 / 纹理线。</p>
        </section>
        <section>
          <h3>数据</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {COUNT_OPTIONS.map(n => <button key={n} style={{ fontSize: 11 }} className={count === n ? 'active' : ''} onClick={() => regenerate(n)}>{n} 条</button>)}
            <button style={{ fontSize: 11 }} onClick={() => regenerate()}>重新生成</button>
          </div>
          <p className="muted small">当前 {data.features.length} 条线。</p>
        </section>
        <section>
          <h3>样式</h3>
          <label>线色 <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} /></label><br />
          <label>strokeWeight {strokeWeight} <input type="range" min={1} max={16} value={strokeWeight} onChange={e => setStrokeWeight(+e.target.value)} /></label><br />
          <label>strokeOpacity {strokeOpacity} <input type="range" min={0} max={1} step={0.05} value={strokeOpacity} onChange={e => setStrokeOpacity(+e.target.value)} /></label>
        </section>
        <section>
          <h3>线型</h3>
          <div className="btn-group">
            {(['solid', 'dashed', 'dotted'] as const).map(s => <button key={s} style={{ fontSize: 11 }} className={strokeStyle === s ? 'active' : ''} onClick={() => setStrokeStyle(s)}>{s}</button>)}
          </div>
        </section>
        <section>
          <h3>端点 / 连接</h3>
          <div className="btn-group">
            {(['butt', 'round', 'square'] as const).map(s => <button key={s} style={{ fontSize: 11 }} className={lineCap === s ? 'active' : ''} onClick={() => setLineCap(s)}>cap:{s}</button>)}
          </div>
          <div className="btn-group" style={{ marginTop: 4 }}>
            {(['miter', 'bevel', 'round'] as const).map(s => <button key={s} style={{ fontSize: 11 }} className={lineJoin === s ? 'active' : ''} onClick={() => setLineJoin(s)}>join:{s}</button>)}
          </div>
        </section>
        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`<PolylineLayer data={geojson} strokeColor="#3388ff"
  strokeWeight={4} strokeOpacity={0.9}
  strokeStyle="${strokeStyle}" dashArray={[10, 5]}
  strokeLineCap="round" strokeLineJoin="round" />`}</pre>
        </section>
      </div>
    </div>
  );
}
