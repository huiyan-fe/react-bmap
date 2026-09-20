import React, { useRef, useState } from 'react';
import { Panorama, PanoramaLabel, useCapabilities } from '@baidumap/react-bmap';
import type { PanoramaRef } from '@baidumap/react-bmap';
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
  const [heading, setHeading] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [navigationControl, setNavigationControl] = useState(true);
  const [linksControl, setLinksControl] = useState(true);
  const [displayDistance, setDisplayDistance] = useState(true);
  const [labelColor, setLabelColor] = useState('#ff4d4f');
  const [visible, setVisible] = useState(true);
  const [scrollZoom, setScrollZoom] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const [posInfo, setPosInfo] = useState('');
  const panoRef = useRef<PanoramaRef | null>(null);

  const readState = () => {
    const r = panoRef.current;
    if (!r) { addLog('⚠️ ref 未就绪'); return; }
    const pos = r.getPosition();
    const pv = r.getPov();
    addLog(`📖 id=${r.getId()} pos=${pos ? `${pos.lng.toFixed(4)},${pos.lat.toFixed(4)}` : '—'} pov=${pv ? `${Math.round(pv.heading)}/${Math.round(pv.pitch ?? 0)}` : '—'} zoom=${r.getZoom()} scene=${r.getSceneType()}`);
  };

  const addLog = (msg: string) => setLog(s => [`${new Date().toLocaleTimeString()} ${msg}`, ...s].slice(0, 10));

  return (
    <div className="test-page">
      <div className="test-map">
        <Panorama
          ref={panoRef}
          point={point}
          pov={{ heading, pitch }}
          zoom={zoom}
          visible={visible}
          enableScrollWheelZoom={scrollZoom}
          options={{ navigationControl, linksControl }}
          style={{ height: '100%', width: '100%' }}
          onPositionChange={(pt) => {
            setPosInfo(`${pt.lng.toFixed(4)}, ${pt.lat.toFixed(4)}`);
            addLog('📍 position_changed');
          }}
          onPovChange={() => addLog('🔄 pov_changed')}
          onLinksChange={() => addLog('🛣️ links_changed')}
          onZoomChange={(z) => addLog(`🔍 zoom_changed: ${z}`)}
        >
          <PanoramaLabel
            position={point}
            altitude={altitude}
            content={labelText}
            displayDistance={displayDistance}
            customStyle={{ color: labelColor }}
            onClick={() => addLog(`🏷️ label click: ${labelText}`)}
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
          <div className="input-row" style={{ marginTop: 4, gap: 8 }}>
            <label style={{ fontSize: 12 }}><input type="checkbox" checked={displayDistance} onChange={e => setDisplayDistance(e.target.checked)} /> displayDistance</label>
            <label style={{ fontSize: 12 }}>color <input type="color" value={labelColor} onChange={e => setLabelColor(e.target.value)} /></label>
          </div>
          <p className="muted small">点击全景内的标注会触发 onClick（见事件日志）</p>
        </section>

        <section>
          <h3>视角 / 缩放（pov / zoom）</h3>
          <div className="input-row" style={{ marginTop: 4 }}>
            <label style={{ fontSize: 12 }}>heading: {heading}</label>
            <input type="range" min="0" max="360" value={heading} onChange={e => setHeading(Number(e.target.value))} />
          </div>
          <div className="input-row" style={{ marginTop: 4 }}>
            <label style={{ fontSize: 12 }}>pitch: {pitch}</label>
            <input type="range" min="-90" max="90" value={pitch} onChange={e => setPitch(Number(e.target.value))} />
          </div>
          <div className="input-row" style={{ marginTop: 4 }}>
            <label style={{ fontSize: 12 }}>zoom: {zoom}</label>
            <input type="range" min="0" max="5" step="0.5" value={zoom} onChange={e => setZoom(Number(e.target.value))} />
          </div>
        </section>

        <section>
          <h3>控件配置（options）</h3>
          <div className="input-row" style={{ gap: 8 }}>
            <label style={{ fontSize: 12 }}><input type="checkbox" checked={navigationControl} onChange={e => setNavigationControl(e.target.checked)} /> navigationControl</label>
            <label style={{ fontSize: 12 }}><input type="checkbox" checked={linksControl} onChange={e => setLinksControl(e.target.checked)} /> linksControl</label>
          </div>
          <div className="input-row" style={{ gap: 8, marginTop: 4 }}>
            <label style={{ fontSize: 12 }}><input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} /> visible</label>
            <label style={{ fontSize: 12 }}><input type="checkbox" checked={scrollZoom} onChange={e => setScrollZoom(e.target.checked)} /> scrollWheelZoom</label>
          </div>
        </section>

        <section>
          <h3>命令式句柄（ref）</h3>
          <button onClick={readState} disabled={!supported}>读取当前 id / 位置 / 视角 / zoom / 场景类型</button>
        </section>

        <section>
          <h3>状态</h3>
          <ul className="state-list">
            <li>当前位置: <code>{posInfo || '—'}</code></li>
            <li>标注: <code>{labelText}</code> (alt={altitude})</li>
            <li>视角: <code>heading={heading} pitch={pitch}</code> zoom={zoom}</li>
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
