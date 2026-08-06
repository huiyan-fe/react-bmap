import React, { useState } from 'react';
import { Panorama, PanoramaLabel, useCapabilities } from 'react-bmap';
import { BEIJING } from '../TestProvider';

const PRESET_POINTS = [
  { label: '北京天安门', lng: 116.404, lat: 39.915 },
  { label: '上海外滩', lng: 121.490, lat: 31.236 },
  { label: '杭州西湖', lng: 120.155, lat: 30.274 },
  { label: '成都春熙路', lng: 104.083, lat: 30.658 },
];

export function PanoramaTestPage() {
  const caps = useCapabilities();
  const supported = caps.has('Panorama');
  const [point, setPoint] = useState(BEIJING);
  const [altitude, setAltitude] = useState(5);
  const [labelText, setLabelText] = useState('天安门');
  const [log, setLog] = useState<string[]>([]);
  const [posInfo, setPosInfo] = useState('');

  const addLog = (msg: string) => setLog(s => [`${new Date().toLocaleTimeString()} ${msg}`, ...s].slice(0, 10));

  return (
    <div className="test-page">
      <div className="test-map">
        <Panorama
          point={point}
          style={{ height: '100%', width: '100%' }}
          onPositionChange={(pt) => {
            setPosInfo(`${pt.lng.toFixed(4)}, ${pt.lat.toFixed(4)}`);
            addLog('📍 position_changed');
          }}
          onPovChange={() => addLog('🔄 pov_changed')}
        >
          <PanoramaLabel
            position={point}
            altitude={altitude}
            content={labelText}
          />
        </Panorama>
      </div>
      <div className="test-controls">
        <h2>Panorama + PanoramaLabel</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? '支持' : '不支持'}</span>
          <p className="muted small">全景视图独立于 &lt;Map&gt;，有自己的 DOM 容器。需要 AK 全景服务权限。</p>
        </section>

        <section>
          <h3>预设位置</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {PRESET_POINTS.map(p => (
              <button
                key={p.label}
                className={point.lng === p.lng && point.lat === p.lat ? 'active' : ''}
                onClick={() => { setPoint({ lng: p.lng, lat: p.lat }); setLabelText(p.label); }}
                disabled={!supported}
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>坐标</h3>
          <div className="input-row">
            <input type="number" step="0.001" value={point.lng} onChange={e => setPoint(p => ({ ...p, lng: Number(e.target.value) }))} style={{ width: 100 }} />
            <input type="number" step="0.001" value={point.lat} onChange={e => setPoint(p => ({ ...p, lat: Number(e.target.value) }))} style={{ width: 100 }} />
          </div>
        </section>

        <section>
          <h3>标注</h3>
          <div className="input-row">
            <input type="text" value={labelText} onChange={e => setLabelText(e.target.value)} placeholder="标注文字" />
          </div>
          <div className="input-row" style={{ marginTop: 4 }}>
            <label style={{ fontSize: 12 }}>altitude: {altitude}</label>
            <input type="range" min="0" max="50" value={altitude} onChange={e => setAltitude(Number(e.target.value))} />
          </div>
        </section>

        <section>
          <h3>状态</h3>
          <ul className="state-list">
            <li>当前位置: <code>{posInfo || '—'}</code></li>
            <li>标注: <code>{labelText}</code> (alt={altitude})</li>
          </ul>
        </section>

        <section>
          <h3>事件日志</h3>
          <div style={{ maxHeight: 150, overflow: 'auto', fontSize: 12 }}>
            {log.length === 0 ? (
              <p className="muted small">拖动/缩放全景后显示事件</p>
            ) : (
              log.map((line, i) => <div key={i} className="code" style={{ marginBottom: 2 }}>{line}</div>)
            )}
          </div>
          <button style={{ fontSize: 11, marginTop: 4 }} onClick={() => setLog([])}>清空</button>
        </section>
      </div>
    </div>
  );
}
