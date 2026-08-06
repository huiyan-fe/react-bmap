/**
 * MVTLayer 测试页 — v4+。MVT 矢量瓦片图层。
 * 支持 tileUrlTemplate（[z]/[x]/[y] 占位符）、layers 配置、style 样式、事件回调。
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Map, MVTLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

export function MVTLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('MVTLayer');
  const [visible, setVisible] = useState(true);
  const [url, setUrl] = useState('https://your-mvt-server/[z]/[x]/[y].pbf');
  const [minZoom, setMinZoom] = useState<number | undefined>(3);
  const [maxZoom, setMaxZoom] = useState<number | undefined>(18);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = 0; }, [eventLog]);

  const log = useCallback((msg: string) => {
    setEventLog(s => [`${new Date().toLocaleTimeString()} ${msg}`, ...s].slice(0, 20));
  }, []);

  const rebuildKey = `${url}|${minZoom ?? ''}|${maxZoom ?? ''}`;

  const onclick = useCallback((e: unknown) => {
    log(`🖱️ click: ${JSON.stringify(e).slice(0, 120)}`);
  }, [log]);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={11} style={{ height: '100%' }}>
          {visible && supported && (
            <MVTLayer
              key={rebuildKey}
              tileUrlTemplate={url}
              minZoom={minZoom}
              maxZoom={maxZoom}
              onclick={onclick}
            />
          )}
        </Map>
        <div ref={logRef} style={{
          position: 'absolute', left: 8, bottom: 50,
          maxWidth: 340, maxHeight: 180,
          background: 'rgba(0,0,0,0.75)', color: '#0f0',
          borderRadius: 6, padding: '8px 8px 14px 8px',
          fontSize: 11, fontFamily: 'monospace',
          overflowY: 'auto', zIndex: 10,
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginBottom: 4, paddingBottom: 4,
            borderBottom: '1px solid rgba(255,255,255,0.15)',
          }}>
            <span>事件日志（{eventLog.length}）</span>
            <button onClick={() => setEventLog([])}
              style={{ background: 'transparent', border: '1px solid #555', color: '#aaa', cursor: 'pointer', fontSize: 10, borderRadius: 3, padding: '0 6px' }}
            >清空</button>
          </div>
          {eventLog.length === 0
            ? <div style={{ color: '#666' }}>点击 MVT 要素触发事件</div>
            : eventLog.map((line, i) => <div key={i} style={{ lineHeight: 1.6 }}>{line}</div>)}
        </div>
      </div>
      <div className="test-controls">
        <h2>MVTLayer</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span>
          <p className="muted small">@since 4.0。MVT 矢量瓦片图层。支持点/线/面样式配置和要素拾取事件。v3 不支持。</p>
        </section>

        <section>
          <h3>显示</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            显示图层（挂载 / 卸载）
          </label>
        </section>

        <section>
          <h3>tileUrlTemplate</h3>
          <textarea className="full-width" rows={2} value={url} onChange={e => setUrl(e.target.value)} />
          <p className="muted small">MVT 瓦片 URL 模板，占位符 [z]/[x]/[y]。变化时重建图层。</p>
        </section>

        <section>
          <h3>缩放范围</h3>
          <label className="checkbox-row">
            minZoom
            <input type="number" placeholder="3" value={minZoom ?? ''} onChange={e => setMinZoom(e.target.value === '' ? undefined : Number(e.target.value))} />
          </label>
          <label className="checkbox-row">
            maxZoom
            <input type="number" placeholder="18" value={maxZoom ?? ''} onChange={e => setMaxZoom(e.target.value === '' ? undefined : Number(e.target.value))} />
          </label>
        </section>

        <section>
          <h3>事件</h3>
          <p className="muted small">支持 click / dblclick / mousemove / mouseout 事件。onclick 已绑定，点击 MVT 要素查看日志。</p>
        </section>

        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => { setVisible(true); setUrl('https://your-mvt-server/[z]/[x]/[y].pbf'); setMinZoom(3); setMaxZoom(18); }}>reset all</button>
          </div>
        </section>

        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`<Map defaultCenter={center} defaultZoom={11}>
  <MVTLayer
    tileUrlTemplate="https://your-mvt-server/[z]/[x]/[y].pbf"
    minZoom={3}
    maxZoom={18}
    onclick={(e) => { /* MVT click event */ }}
    onmousemove={(e) => { /* MVT hover event */ }}
  />
</Map>`}
          </pre>
        </section>

        <section>
          <h3>高级配置</h3>
          <p className="muted small">
            MVTLayer 还支持 layers（多子图层配置）、style（点/线/面样式）、
            transform（坐标系转换）、noCollision（无碰撞）、useThumb（缩略图）等高级选项。
            详见 SDK dts MVTLayerOptions。
          </p>
        </section>
      </div>
    </div>
  );
}
