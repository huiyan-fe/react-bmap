/** FlyLineLayer 测试页 — v4+ 飞线图层。 */
import React, { useState } from 'react';
import { Map, FlyLineLayer, useCapabilities } from '@baidumap/react-bmap';
import { BEIJING } from '../../TestProvider';
import { randomLinesData, useEventLog, LogPanel } from './visualDemoUtils';

const COUNT_OPTIONS = [3, 6, 12];

export function FlyLineLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('FlyLineLayer');
  const [count, setCount] = useState(6);
  const [data, setData] = useState(() => randomLinesData(6));
  const [mode, setMode] = useState<'arc' | 'path'>('arc');
  const [strokeColor, setStrokeColor] = useState('rgba(255, 71, 26, 0.9)');
  const [strokeWeight, setStrokeWeight] = useState(4);
  const [arcHeight, setArcHeight] = useState(0.3);
  const [curvature, setCurvature] = useState(0.15);
  const [duration, setDuration] = useState(2);
  const [animation, setAnimation] = useState(true);
  const [trailLength, setTrailLength] = useState(0.6);
  const events = useEventLog();

  const regenerate = (n = count) => { setCount(n); setData(randomLinesData(n)); events.push(`重新生成 ${n} 条飞线`); };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}>
          {supported && (
            <FlyLineLayer
              data={data as any}
              mode={mode}
              strokeColor={strokeColor}
              strokeWeight={strokeWeight}
              arcHeight={arcHeight}
              curvature={curvature}
              duration={duration}
              animation={animation}
              trailLength={trailLength}
              onClick={(e: any) => events.push(`click ${e?.value?.properties?.name ?? ''}`)}
              onMouseOver={(e: any) => events.push(`mouseover ${e?.value?.properties?.name ?? ''}`)}
              onMouseOut={() => events.push('mouseout')}
              onMouseMove={() => events.push('mousemove')}
            />
          )}
        </Map>
        <LogPanel state={events} hint="点击 / 悬停飞线触发事件" />
      </div>
      <div className="test-controls">
        <h2>FlyLineLayer</h2>
        <section>
          <h3>能力 <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span></h3>
          <p className="muted small">@since 4.0。飞线图层，data 为 GeoJSON 线数据；mode "arc" 取首末两点生成流动弧线。</p>
        </section>
        <section>
          <h3>数据</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {COUNT_OPTIONS.map(n => <button key={n} style={{ fontSize: 11 }} className={count === n ? 'active' : ''} onClick={() => regenerate(n)}>{n} 条</button>)}
            <button style={{ fontSize: 11 }} onClick={() => regenerate()}>重新生成</button>
          </div>
        </section>
        <section>
          <h3>mode</h3>
          <div className="btn-group">
            {(['arc', 'path'] as const).map(m => <button key={m} style={{ fontSize: 11 }} className={mode === m ? 'active' : ''} onClick={() => setMode(m)}>{m}</button>)}
          </div>
        </section>
        <section>
          <h3>样式</h3>
          <label>线色 <input type="color" value="#ff471a" onChange={e => setStrokeColor(e.target.value)} /></label><br />
          <label>strokeWeight {strokeWeight} <input type="range" min={1} max={12} value={strokeWeight} onChange={e => setStrokeWeight(+e.target.value)} /></label>
        </section>
        <section>
          <h3>动画</h3>
          <label>arcHeight {arcHeight} <input type="range" min={0} max={1} step={0.05} value={arcHeight} onChange={e => setArcHeight(+e.target.value)} /></label><br />
          <label>curvature {curvature} <input type="range" min={0} max={1} step={0.05} value={curvature} onChange={e => setCurvature(+e.target.value)} /></label><br />
          <label>duration {duration}s <input type="range" min={0.5} max={8} step={0.5} value={duration} onChange={e => setDuration(+e.target.value)} /></label><br />
          <label>trailLength {trailLength} <input type="range" min={0} max={1} step={0.05} value={trailLength} onChange={e => setTrailLength(+e.target.value)} /></label><br />
          <label><input type="checkbox" checked={animation} onChange={e => setAnimation(e.target.checked)} /> 流动动画</label>
        </section>
        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`<FlyLineLayer data={geojson} strokeColor="rgba(255,71,26,0.9)"
  mode="${mode}" arcHeight={${arcHeight}} duration={${duration}} animation />`}</pre>
        </section>
      </div>
    </div>
  );
}
