/** PointLayer 测试页 — v4+ 点图层（形状 / 图标）。 */
import React, { useState } from 'react';
import { Map, PointLayer, useCapabilities } from '@baidumap/react-bmap';
import { BEIJING } from '../../TestProvider';
import { randomPointsData, useEventLog, LogPanel } from './visualDemoUtils';

const COUNT_OPTIONS = [100, 200, 500];
type Shape = 'circle' | 'square' | 'triangle' | 'diamond';

export function PointLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('PointLayer');
  const [count, setCount] = useState(200);
  const [data, setData] = useState(() => randomPointsData(200, false));
  const [shape, setShape] = useState<Shape>('circle');
  const [size, setSize] = useState(18);
  const [fillColor, setFillColor] = useState('#1890ff');
  const [fillOpacity, setFillOpacity] = useState(0.8);
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [strokeWeight, setStrokeWeight] = useState(2);
  const [isFlat, setIsFlat] = useState(false);
  const events = useEventLog();

  const regenerate = (n = count) => { setCount(n); setData(randomPointsData(n, false)); events.push(`重新生成 ${n} 个点`); };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}>
          {supported && (
            <PointLayer
              data={data as any}
              shape={shape}
              size={size}
              fillColor={fillColor}
              fillOpacity={fillOpacity}
              strokeColor={strokeColor}
              strokeWeight={strokeWeight}
              isFlat={isFlat}
              onClick={(e: any) => events.push(`click ${e?.value?.properties?.name ?? ''}`)}
              onMouseOver={(e: any) => events.push(`mouseover ${e?.value?.properties?.name ?? ''}`)}
              onMouseOut={() => events.push('mouseout')}
              onMouseMove={(e: any) => events.push(`mousemove ${e?.value?.properties?.id ?? ''}`)}
            />
          )}
        </Map>
        <LogPanel state={events} hint="点击 / 悬停点触发事件" />
      </div>
      <div className="test-controls">
        <h2>PointLayer</h2>
        <section>
          <h3>能力 <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span></h3>
          <p className="muted small">@since 4.0。点图层，data 为 GeoJSON 点数据，支持形状 / 图标两种渲染方式。</p>
        </section>
        <section>
          <h3>数据</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {COUNT_OPTIONS.map(n => <button key={n} style={{ fontSize: 11 }} className={count === n ? 'active' : ''} onClick={() => regenerate(n)}>{n} 点</button>)}
            <button style={{ fontSize: 11 }} onClick={() => regenerate()}>重新生成</button>
          </div>
          <p className="muted small">当前 {data.features.length} 个点。</p>
        </section>
        <section>
          <h3>shape（点形状）</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {(['circle', 'square', 'triangle', 'diamond'] as Shape[]).map(s => <button key={s} style={{ fontSize: 11 }} className={shape === s ? 'active' : ''} onClick={() => setShape(s)}>{s}</button>)}
          </div>
        </section>
        <section>
          <h3>size: {size}</h3>
          <input type="range" min={4} max={30} value={size} onChange={e => setSize(+e.target.value)} className="full-width" />
        </section>
        <section>
          <h3>样式</h3>
          <label>填充色 <input type="color" value={fillColor} onChange={e => setFillColor(e.target.value)} /></label><br />
          <label>fillOpacity {fillOpacity} <input type="range" min={0} max={1} step={0.05} value={fillOpacity} onChange={e => setFillOpacity(+e.target.value)} /></label><br />
          <label>描边色 <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} /></label><br />
          <label>strokeWeight {strokeWeight} <input type="range" min={0} max={6} value={strokeWeight} onChange={e => setStrokeWeight(+e.target.value)} /></label><br />
          <label><input type="checkbox" checked={isFlat} onChange={e => setIsFlat(e.target.checked)} /> isFlat（贴合地面）</label>
        </section>
        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`<PointLayer data={geojson} shape="${shape}" size={18}
  fillColor="#1890ff" fillOpacity={0.8}
  strokeColor="#ffffff" strokeWeight={2} />`}</pre>
        </section>
      </div>
    </div>
  );
}
