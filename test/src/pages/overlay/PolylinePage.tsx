/**
 * Polyline 全量测试页 — 覆盖 bmap-jsapi-dts/src/overlay/Polyline.d.ts + PolylineOptions.d.ts 的全部功能。
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Map, Polyline, useCapabilities } from 'react-bmap';
import type { Point } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const DEFAULT_PATH: Point[] = [
  { lng: 116.399, lat: 39.910 },
  { lng: 116.405, lat: 39.920 },
  { lng: 116.415, lat: 39.915 },
  { lng: 116.422, lat: 39.925 },
];

export function PolylinePage() {
  const caps = useCapabilities();
  const [path, setPath] = useState<Point[]>(DEFAULT_PATH);
  const [strokeColor, setStrokeColor] = useState('#1890ff');
  const [strokeWeight, setStrokeWeight] = useState(4);
  const [strokeOpacity, setStrokeOpacity] = useState(1);
  const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [strokeLineCap, setStrokeLineCap] = useState<'round' | 'butt' | 'square'>('round');
  const [strokeLineJoin, setStrokeLineJoin] = useState<'round' | 'miter' | 'bevel'>('round');
  const [enableEditing, setEnableEditing] = useState(false);
  const [enableMassClear, setEnableMassClear] = useState(true);
  const [enableClicking, setEnableClicking] = useState(true);
  const [geodesic, setGeodesic] = useState(false);
  const [clip, setClip] = useState(true);
  const [dashArray, setDashArray] = useState<number[]>([]);
  const [zIndex, setZIndex] = useState<number | undefined>(undefined);
  const [visible, setVisible] = useState(true);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = 0; }, [eventLog]);

  const log = useCallback((msg: string) => {
    setEventLog(s => [`${new Date().toLocaleTimeString()} ${msg}`, ...s].slice(0, 20));
  }, []);

  const formatPt = (pt: { lng: number; lat: number } | null | undefined) =>
    pt ? `${pt.lng?.toFixed(4)},${pt.lat?.toFixed(4)}` : '';

  const handleEvent = useCallback((name: string) =>
    (pt: any) => log(`🟣 polyline.${name}${pt ? ` @ ${formatPt(pt)}` : ''}`), [log]);

  const dashArrayText = dashArray.length ? dashArray.join(',') : '';

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={14} style={{ height: '100%' }}>
          <Polyline
            path={path}
            strokeColor={strokeColor}
            strokeWeight={strokeWeight}
            strokeOpacity={strokeOpacity}
            strokeStyle={strokeStyle}
            strokeLineCap={strokeLineCap}
            strokeLineJoin={strokeLineJoin}
            enableEditing={enableEditing}
            enableMassClear={enableMassClear}
            enableClicking={enableClicking}
            geodesic={geodesic}
            clip={clip}
            dashArray={dashArray.length ? dashArray : undefined}
            zIndex={zIndex}
            visible={visible}
            onClick={handleEvent('click')}
            onDoubleClick={handleEvent('dblclick')}
            onRightClick={handleEvent('rightclick')}
            onMouseOver={handleEvent('mouseover')}
            onMouseOut={handleEvent('mouseout')}
            onMouseDown={handleEvent('mousedown')}
            onMouseUp={handleEvent('mouseup')}
            onMouseMove={handleEvent('mousemove')}
            onRemove={handleEvent('remove')}
            onLineUpdate={() => log('🟣 polyline.lineupdate')}
          />
        </Map>
        <div ref={logRef} style={{
          position: 'absolute', left: 8, bottom: 50, maxWidth: 340, maxHeight: 220,
          background: 'rgba(0,0,0,0.75)', color: '#0f0', borderRadius: 6,
          padding: '8px 8px 14px 8px', fontSize: 11, fontFamily: 'monospace',
          overflowY: 'auto', zIndex: 10, border: '1px solid rgba(255,255,255,0.15)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 4 }}>
            <span>事件日志（{eventLog.length}）</span>
            <button onClick={() => setEventLog([])} style={{ background: 'transparent', border: '1px solid #555', color: '#aaa', cursor: 'pointer', fontSize: 10, borderRadius: 3, padding: '0 6px' }}>清空</button>
          </div>
          {eventLog.length === 0 ? <div style={{ color: '#666' }}>与折线交互触发事件</div> : eventLog.map((line, i) => <div key={i} style={{ lineHeight: 1.6 }}>{line}</div>)}
        </div>
      </div>

      <div className="test-controls">
        <h2>Polyline（全量）</h2>

        <section>
          <h3>能力</h3>
          <div className="cap-grid">
            <div className={`cap-cell ${caps.has('Polyline') ? 'ok' : 'no'}`}>Polyline</div>
          </div>
        </section>

        <section>
          <h3>strokeColor</h3>
          <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} />
          <span style={{ marginLeft: 8, fontFamily: 'monospace' }}>{strokeColor}</span>
        </section>

        <section>
          <h3>strokeWeight: {strokeWeight}px</h3>
          <input type="range" min={1} max={20} value={strokeWeight} onChange={e => setStrokeWeight(Number(e.target.value))} className="full-width" />
        </section>

        <section>
          <h3>strokeOpacity: {strokeOpacity.toFixed(2)}</h3>
          <input type="range" min={0} max={1} step={0.05} value={strokeOpacity} onChange={e => setStrokeOpacity(Number(e.target.value))} className="full-width" />
        </section>

        <section>
          <h3>strokeStyle</h3>
          <div className="btn-group">
            {(['solid', 'dashed', 'dotted'] as const).map(s => (
              <button key={s} className={strokeStyle === s ? 'active' : ''} onClick={() => setStrokeStyle(s)}>{s}</button>
            ))}
          </div>
        </section>

        <section>
          <h3>strokeLineCap <span className={`cap-tag ${caps.has('Map.setHeading') ? 'ok' : 'no'}`}>{caps.has('Map.setHeading') ? 'v4+' : 'v3 ✗'}</span></h3>
          <div className="btn-group">
            {(['round', 'butt', 'square'] as const).map(s => (
              <button key={s} className={strokeLineCap === s ? 'active' : ''} onClick={() => setStrokeLineCap(s)}>{s}</button>
            ))}
          </div>
        </section>

        <section>
          <h3>strokeLineJoin <span className={`cap-tag ${caps.has('Map.setHeading') ? 'ok' : 'no'}`}>{caps.has('Map.setHeading') ? 'v4+' : 'v3 ✗'}</span></h3>
          <div className="btn-group">
            {(['round', 'miter', 'bevel'] as const).map(s => (
              <button key={s} className={strokeLineJoin === s ? 'active' : ''} onClick={() => setStrokeLineJoin(s)}>{s}</button>
            ))}
          </div>
        </section>

        <section>
          <h3>dashArray <span className={`cap-tag ${caps.has('Map.setHeading') ? 'ok' : 'no'}`}>{caps.has('Map.setHeading') ? 'v4+' : 'v3 ✗'}</span></h3>
          <input type="text" placeholder="如 8,4" value={dashArrayText} onChange={e => {
            const parts = e.target.value.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0);
            setDashArray(parts);
          }} />
          <span className="muted small" style={{ marginLeft: 8 }}>[实线长, 间隙长]</span>
        </section>

        <section>
          <h3>行为开关</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={enableEditing} onChange={e => setEnableEditing(e.target.checked)} />
            enableEditing（拖拽顶点编辑）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={enableMassClear} onChange={e => setEnableMassClear(e.target.checked)} />
            enableMassClear
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={enableClicking} onChange={e => setEnableClicking(e.target.checked)} />
            enableClicking（重建折线）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={geodesic} onChange={e => setGeodesic(e.target.checked)} />
            geodesic（大地线）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={clip} onChange={e => setClip(e.target.checked)} />
            clip（跨180°裁剪）<span className={`cap-tag ${caps.has('Map.setHeading') ? 'ok' : 'no'}`}>{caps.has('Map.setHeading') ? 'v4+' : 'v3 ✗'}</span>
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            visible（show/hide）
          </label>
        </section>

        <section>
          <h3>zIndex</h3>
          <input type="number" placeholder="未设置" value={zIndex ?? ''} onChange={e => setZIndex(e.target.value === '' ? undefined : Number(e.target.value))} />
        </section>

        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPath(DEFAULT_PATH); setStrokeColor('#1890ff'); setStrokeWeight(4); setStrokeOpacity(1);
              setStrokeStyle('solid'); setStrokeLineCap('round'); setStrokeLineJoin('round');
              setEnableEditing(false); setEnableMassClear(true); setEnableClicking(true);
              setGeodesic(false); setClip(true); setDashArray([]); setZIndex(undefined); setVisible(true);
              log('🔄 reset all');
            }}>reset all</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPath(p => [...p.reverse()]);
              log('🔄 反转路径');
            }}>反转路径</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPath(p => [...p, { lng: p[p.length - 1].lng + 0.005, lat: p[p.length - 1].lat + 0.003 }]);
              log('🔄 添加点');
            }}>添加点</button>
          </div>
        </section>

        <section>
          <h3>预设样式</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => { setStrokeColor('#ff0000'); setStrokeWeight(6); setStrokeStyle('solid'); log('🔴 红色实线'); }}>红色实线</button>
            <button style={{ fontSize: 11 }} onClick={() => { setStrokeColor('#00aa00'); setStrokeWeight(3); setStrokeStyle('dashed'); log('🟢 绿色虚线'); }}>绿色虚线</button>
            <button style={{ fontSize: 11 }} onClick={() => { setStrokeColor('#ff8800'); setStrokeWeight(2); setStrokeStyle('dotted'); log('🟠 橙色点线'); }}>橙色点线</button>
            <button style={{ fontSize: 11 }} onClick={() => { setStrokeColor('#1890ff'); setStrokeWeight(8); setStrokeOpacity(0.5); log('🔵 半透明粗线'); }}>半透明粗线</button>
          </div>
        </section>

        <section>
          <h3>事件测试</h3>
          <p className="muted small">
            点击 / 双击 / 右键 / 鼠标移入 / 移出 / 移动 折线查看事件日志。<br />
            事件列表：click, dblclick, rightclick, rightdblclick(v4+), mousedown, mouseup, mouseover, mouseout, mousemove, remove, lineupdate
          </p>
        </section>
      </div>
    </div>
  );
}
