/** DeckglLayer 测试页 — v4+ deck.gl 接入图层（示例站自动从 CDN 加载 8.9.x）。 */
import React, { useEffect, useRef, useState } from 'react';
import { Map, DeckglLayer, useCapabilities } from '@baidumap/react-bmap';
import type { DeckglLayerRef } from '@baidumap/react-bmap';
import { BEIJING } from '../../TestProvider';
import { C, loadDeck, useEventLog, LogPanel } from './visualDemoUtils';

function buildData(deck: any, count: number) {
  const points = Array.from({ length: count }, (_, i) => ({
    id: i,
    lng: C.lng + (Math.random() - 0.5) * 0.14,
    lat: C.lat + (Math.random() - 0.5) * 0.09,
    radius: 40 + Math.random() * 60,
    color: [24 + Math.floor(Math.random() * 200), 90, 255],
  }));
  return {
    layers: [new deck.ScatterplotLayer({
      id: 'demo-scatter',
      data: points,
      getPosition: (d: any) => [d.lng, d.lat],
      getRadius: (d: any) => d.radius,
      getFillColor: (d: any) => d.color,
      stroked: true,
      getLineColor: [255, 255, 255],
      lineWidthMinPixels: 1,
      radiusMinPixels: 2,
      radiusMaxPixels: 60,
    })],
  };
}

export function DeckglLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('DeckglLayer');
  const [ready, setReady] = useState(!!(globalThis as any).deck?.Deck);
  const [error, setError] = useState('');
  const [count, setCount] = useState(50);
  const [animation, setAnimation] = useState(true);
  const [data, setData] = useState<any>(null);
  const layerRef = useRef<DeckglLayerRef>(null);
  const events = useEventLog();

  useEffect(() => {
    if (ready) return;
    loadDeck().then(() => setReady(true), (e: Error) => setError(e.message));
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    setData(buildData((globalThis as any).deck, count));
  }, [ready, count]);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}>
          {supported && ready && data && <DeckglLayer ref={layerRef} animation={animation} data={data} onError={(e) => events.push(`error ${String(e)}`)} />}
        </Map>
        <LogPanel state={events} hint="deck.gl 事件 / 错误" />
      </div>
      <div className="test-controls">
        <h2>DeckglLayer</h2>
        <section>
          <h3>能力 <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span></h3>
          <p className="muted small">@since 4.0。deck.gl 接入图层。deck.gl 需宿主引入 8.9.x 全量包并挂到 window.deck（9.x 不支持共享 GL 上下文；本组件不 import deck）。</p>
        </section>
        <section>
          <h3>依赖状态</h3>
          <p className="muted small">{error ? `加载失败：${error}` : ready ? 'window.deck 已就绪（8.9.36）' : '正在加载 deck.gl（CDN）…'}</p>
        </section>
        <section>
          <h3>数据</h3>
          <div className="btn-group">
            {[50, 200, 1000].map(n => <button key={n} style={{ fontSize: 11 }} className={count === n ? 'active' : ''} onClick={() => setCount(n)}>{n} 点</button>)}
            <button style={{ fontSize: 11 }} onClick={() => setData(buildData((globalThis as any).deck, count))}>重新生成</button>
          </div>
        </section>
        <section>
          <h3>选项</h3>
          <label><input type="checkbox" checked={animation} onChange={e => setAnimation(e.target.checked)} /> animation（逐帧重绘）</label>
        </section>
        <section>
          <h3>ref 句柄</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => events.push(`getStatus = ${layerRef.current?.getStatus()}`)}>getStatus</button>
            <button style={{ fontSize: 11 }} onClick={() => events.push(`getDeck = ${layerRef.current?.getDeck() ? 'Deck 实例' : 'null'}`)}>getDeck</button>
            <button style={{ fontSize: 11 }} onClick={() => { const d = buildData((globalThis as any).deck, count); layerRef.current?.setProps(d); events.push(`setProps(${count} 点)`); }}>setProps</button>
            <button style={{ fontSize: 11 }} onClick={() => { layerRef.current?.startAnimation(); events.push(`startAnimation → isAnimating=${layerRef.current?.isAnimating()}`); }}>startAnimation</button>
            <button style={{ fontSize: 11 }} onClick={() => { layerRef.current?.stopAnimation(); events.push(`stopAnimation → isAnimating=${layerRef.current?.isAnimating()}`); }}>stopAnimation</button>
          </div>
        </section>
        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`import * as deck from 'deck.gl';   // 8.9.x
window.deck = deck;

<DeckglLayer animation
  data={{ layers: [new deck.ScatterplotLayer({ ... })] }} />`}</pre>
        </section>
      </div>
    </div>
  );
}
