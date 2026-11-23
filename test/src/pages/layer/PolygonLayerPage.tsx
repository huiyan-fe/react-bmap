/** PolygonLayer 测试页 — v4+ 面图层。 */
import React, { useState } from 'react';
import { Map, PolygonLayer, useCapabilities } from '@baidumap/react-bmap';
import { BEIJING } from '../../TestProvider';
import { randomPolygonsData, useEventLog, LogPanel } from './visualDemoUtils';

const COUNT_OPTIONS = [3, 6, 12];

export function PolygonLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('PolygonLayer');
  const [count, setCount] = useState(6);
  const [data, setData] = useState(() => randomPolygonsData(6));
  const [fillColor, setFillColor] = useState('#1890ff');
  const [fillOpacity, setFillOpacity] = useState(0.25);
  const [strokeColor, setStrokeColor] = useState('#096dd9');
  const [strokeWeight, setStrokeWeight] = useState(2);
  const [strokeOpacity, setStrokeOpacity] = useState(0.9);
  const events = useEventLog();

  const regenerate = (n = count) => { setCount(n); setData(randomPolygonsData(n)); events.push(`重新生成 ${n} 个面`); };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}>
          {supported && (
            <PolygonLayer
              data={data as any}
              fillColor={fillColor}
              fillOpacity={fillOpacity}
              strokeColor={strokeColor}
              strokeWeight={strokeWeight}
              strokeOpacity={strokeOpacity}
              onClick={(e: any) => events.push(`click ${e?.value?.properties?.name ?? ''}`)}
              onMouseOver={(e: any) => events.push(`mouseover ${e?.value?.properties?.name ?? ''}`)}
              onMouseOut={() => events.push('mouseout')}
              onMouseMove={() => events.push('mousemove')}
            />
          )}
        </Map>
        <LogPanel state={events} hint="点击 / 悬停面触发事件" />
      </div>
      <div className="test-controls">
        <h2>PolygonLayer</h2>
        <section>
          <h3>能力 <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span></h3>
          <p className="muted small">@since 4.0。面图层，data 为 GeoJSON 面数据，支持纯色 / 纹理填充。</p>
        </section>
        <section>
          <h3>数据</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {COUNT_OPTIONS.map(n => <button key={n} style={{ fontSize: 11 }} className={count === n ? 'active' : ''} onClick={() => regenerate(n)}>{n} 个</button>)}
            <button style={{ fontSize: 11 }} onClick={() => regenerate()}>重新生成</button>
          </div>
          <p className="muted small">当前 {data.features.length} 个面。</p>
        </section>
        <section>
          <h3>填充</h3>
          <label>填充色 <input type="color" value={fillColor} onChange={e => setFillColor(e.target.value)} /></label><br />
          <label>fillOpacity {fillOpacity} <input type="range" min={0} max={1} step={0.05} value={fillOpacity} onChange={e => setFillOpacity(+e.target.value)} /></label>
        </section>
        <section>
          <h3>描边</h3>
          <label>描边色 <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} /></label><br />
          <label>strokeWeight {strokeWeight} <input type="range" min={0} max={10} value={strokeWeight} onChange={e => setStrokeWeight(+e.target.value)} /></label><br />
          <label>strokeOpacity {strokeOpacity} <input type="range" min={0} max={1} step={0.05} value={strokeOpacity} onChange={e => setStrokeOpacity(+e.target.value)} /></label>
        </section>
        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`<PolygonLayer data={geojson} fillColor="#1890ff" fillOpacity={0.25}
  strokeColor="#096dd9" strokeWeight={2} strokeOpacity={0.9} />`}</pre>
        </section>
      </div>
    </div>
  );
}
