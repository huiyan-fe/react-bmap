/** TextLayer 测试页 — v4+ 文本图层。 */
import React, { useState } from 'react';
import { Map, TextLayer, useCapabilities } from '@baidumap/react-bmap';
import { BEIJING } from '../../TestProvider';
import { randomPointsData, useEventLog, LogPanel } from './visualDemoUtils';

const COUNT_OPTIONS = [50, 150, 300];

export function TextLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('TextLayer');
  const [count, setCount] = useState(150);
  const [data, setData] = useState(() => randomPointsData(150, false));
  const [useName, setUseName] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [color, setColor] = useState('#1890ff');
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [strokeWeight, setStrokeWeight] = useState(2);
  const [bold, setBold] = useState(true);
  const [collides, setCollides] = useState(true);
  const [waitTime, setWaitTime] = useState(100);
  const events = useEventLog();

  const regenerate = (n = count) => { setCount(n); setData(randomPointsData(n, false)); events.push(`重新生成 ${n} 个点`); };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}>
          {supported && (
            <TextLayer
              data={data as any}
              text={useName ? ((p: any) => String(p?.name ?? '')) : '文本'}
              fontSize={fontSize}
              color={color}
              strokeColor={strokeColor}
              strokeWeight={strokeWeight}
              fontWeight={bold ? 'bold' : 'normal'}
              collides={collides}
              waitTime={waitTime}
              onClick={(e: any) => events.push(`click ${e?.value?.properties?.name ?? ''}`)}
              onMouseOver={(e: any) => events.push(`mouseover ${e?.value?.properties?.name ?? ''}`)}
              onMouseOut={() => events.push('mouseout')}
              onMouseMove={() => events.push('mousemove')}
            />
          )}
        </Map>
        <LogPanel state={events} hint="点击 / 悬停文本触发事件" />
      </div>
      <div className="test-controls">
        <h2>TextLayer</h2>
        <section>
          <h3>能力 <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span></h3>
          <p className="muted small">@since 4.0。文本图层。text 可传字符串或 (properties) =&gt; string；不传时默认读 properties.text。</p>
        </section>
        <section>
          <h3>数据</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {COUNT_OPTIONS.map(n => <button key={n} style={{ fontSize: 11 }} className={count === n ? 'active' : ''} onClick={() => regenerate(n)}>{n} 点</button>)}
            <button style={{ fontSize: 11 }} onClick={() => regenerate()}>重新生成</button>
          </div>
          <label style={{ marginTop: 6, display: 'block' }}><input type="checkbox" checked={useName} onChange={e => setUseName(e.target.checked)} /> text 取 properties.name（否则固定字符串）</label>
        </section>
        <section>
          <h3>样式</h3>
          <label>fontSize {fontSize} <input type="range" min={8} max={30} value={fontSize} onChange={e => setFontSize(+e.target.value)} /></label><br />
          <label>文字色 <input type="color" value={color} onChange={e => setColor(e.target.value)} /></label><br />
          <label>描边色 <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} /></label><br />
          <label>strokeWeight {strokeWeight} <input type="range" min={0} max={5} value={strokeWeight} onChange={e => setStrokeWeight(+e.target.value)} /></label><br />
          <label><input type="checkbox" checked={bold} onChange={e => setBold(e.target.checked)} /> 粗体</label><br />
          <label><input type="checkbox" checked={collides} onChange={e => setCollides(e.target.checked)} /> 碰撞避让（collides）</label><br />
          <label>waitTime {waitTime} <input type="range" min={0} max={500} step={50} value={waitTime} onChange={e => setWaitTime(+e.target.value)} /></label>
        </section>
        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`<TextLayer data={geojson} text={(p) => p.name}
  fontSize={14} color="#1890ff" strokeColor="#ffffff" strokeWeight={2}
  fontWeight="bold" collides waitTime={100} />`}</pre>
        </section>
      </div>
    </div>
  );
}
