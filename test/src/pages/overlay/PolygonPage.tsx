/**
 * Polygon 全量测试页 — 覆盖 Polygon.d.ts + PolygonOptions.d.ts 全部功能。
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Map, Polygon, useCapabilities } from 'react-bmap';
import type { Point, MapRef } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const DEFAULT_PATH: Point[] = [
  { lng: 116.387, lat: 39.921 },
  { lng: 116.385, lat: 39.913 },
  { lng: 116.394, lat: 39.918 },
  { lng: 116.402, lat: 39.921 },
  { lng: 116.400, lat: 39.927 },
];

export function PolygonPage() {
  const caps = useCapabilities();
  const [path, setPath] = useState<Point[]>(DEFAULT_PATH);
  const [strokeColor, setStrokeColor] = useState('#1890ff');
  const [fillColor, setFillColor] = useState('#1890ff');
  const [strokeWeight, setStrokeWeight] = useState(4);
  const [strokeOpacity, setStrokeOpacity] = useState(1);
  const [fillOpacity, setFillOpacity] = useState(0.3);
  const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [enableEditing, setEnableEditing] = useState(false);
  const [enableMassClear, setEnableMassClear] = useState(true);
  const [enableClicking, setEnableClicking] = useState(true);
  const [strokeLineCap, setStrokeLineCap] = useState<'round' | 'butt' | 'square'>('round');
  const [strokeLineJoin, setStrokeLineJoin] = useState<'round' | 'miter' | 'bevel'>('round');
  const [linkRight, setLinkRight] = useState(false);
  const [zIndex, setZIndex] = useState<number | undefined>(undefined);
  const [visible, setVisible] = useState(true);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [mapRef, setMapRef] = useState<MapRef | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const editedPathRef = useRef<Point[]>(DEFAULT_PATH);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [eventLog]);

  const log = useCallback((msg: string) => {
    setEventLog(s =>
      [`${new Date().toLocaleTimeString()} ${msg}`, ...s].slice(0, 20),
    );
  }, []);

  const fmtPt = (pt: any) =>
    pt ? `${pt.lng?.toFixed(4)},${pt.lat?.toFixed(4)}` : '';

  const onEvt = useCallback(
    (name: string) => (pt: any) =>
      log(`🟦 polygon.${name}${pt ? ` @ ${fmtPt(pt)}` : ''}`),
    [log],
  );

  const v4Tag = (
    <span className={`cap-tag ${caps.has('Map.setHeading') ? 'ok' : 'no'}`}>
      {caps.has('Map.setHeading') ? 'v4+' : 'v3 ✗'}
    </span>
  );

  return (
    <div className="test-page">
      <div className="test-map">
        <Map ref={setMapRef} defaultCenter={BEIJING} defaultZoom={14} style={{ height: '100%' }}>
          <Polygon
            path={path}
            strokeColor={strokeColor}
            fillColor={fillColor}
            strokeWeight={strokeWeight}
            strokeOpacity={strokeOpacity}
            fillOpacity={fillOpacity}
            strokeStyle={strokeStyle}
            enableEditing={enableEditing}
            enableMassClear={enableMassClear}
            zIndex={zIndex}
            visible={visible}
            onClick={onEvt('click')}
            onDoubleClick={onEvt('dblclick')}
            onRightClick={onEvt('rightclick')}
            onRightDoubleClick={onEvt('rightdblclick')}
            onMouseOver={onEvt('mouseover')}
            onMouseOut={onEvt('mouseout')}
            onMouseDown={onEvt('mousedown')}
            onMouseUp={onEvt('mouseup')}
            onMouseMove={onEvt('mousemove')}
            onRemove={onEvt('remove')}
            onLineUpdate={(e: any) => {
              log('🟦 polygon.lineupdate');
              // 编辑后把当前路径存入 ref，切换 enableEditing 前同步到 state
              const raw = e?.target;
              if (raw?.getPath) {
                try {
                  let pts = raw.getPath();
                  if (Array.isArray(pts)) {
                    pts = pts.map((p: any) => ({ lng: p.lng, lat: p.lat }));
                    // SDK 闭合多边形会重复首尾点，去掉重复的末尾点避免 setPath 时多出一条线
                    if (pts.length > 1 && pts[0].lng === pts[pts.length - 1].lng && pts[0].lat === pts[pts.length - 1].lat) {
                      pts = pts.slice(0, -1);
                    }
                    editedPathRef.current = pts;
                  }
                } catch { /* ignore */ }
              }
            }}
            onEditStart={() => log('🟦 polygon.editstart')}
            onEditEnd={() => log('🟦 polygon.editend')}
            onLineVertexDragStart={() => log('🟦 vertex.dragstart')}
            onLineVertexDragging={() => log('🟦 vertex.dragging')}
            onLineVertexDragEnd={() => log('🟦 vertex.dragend')}
            onLineVertexDel={() => log('🟦 vertex.del')}
          />
        </Map>
        {/* 事件日志 */}
        <div ref={logRef} style={{
          position: 'absolute', left: 8, bottom: 50,
          maxWidth: 340, maxHeight: 220,
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
              style={{
                background: 'transparent', border: '1px solid #555',
                color: '#aaa', cursor: 'pointer', fontSize: 10,
                borderRadius: 3, padding: '0 6px',
              }}
            >清空</button>
          </div>
          {eventLog.length === 0
            ? <div style={{ color: '#666' }}>与多边形交互触发事件</div>
            : eventLog.map((line, i) => (
              <div key={i} style={{ lineHeight: 1.6 }}>{line}</div>
            ))}
        </div>
      </div>

      <div className="test-controls">
        <h2>Polygon（全量）</h2>

        <section>
          <h3>能力</h3>
          <div className="cap-grid">
            <div className={`cap-cell ${caps.has('Polygon') ? 'ok' : 'no'}`}>
              Polygon
            </div>
          </div>
        </section>

        {/* strokeColor */}
        <section>
          <h3>strokeColor</h3>
          <input type="color" value={strokeColor || '#1890ff'}
            onChange={e => setStrokeColor(e.target.value)} />
          <span style={{ marginLeft: 8, fontFamily: 'monospace' }}>
            {strokeColor}
          </span>
        </section>

        {/* fillColor */}
        <section>
          <h3>fillColor</h3>
          <input type="color" value={fillColor || '#ffffff'}
            onChange={e => setFillColor(e.target.value)} />
          <span style={{ marginLeft: 8, fontFamily: 'monospace' }}>
            {fillColor}
          </span>
        </section>

        {/* strokeWeight */}
        <section>
          <h3>strokeWeight: {strokeWeight}px</h3>
          <input type="range" min={1} max={20} value={strokeWeight}
            onChange={e => setStrokeWeight(Number(e.target.value))}
            className="full-width" />
        </section>

        {/* strokeOpacity */}
        <section>
          <h3>strokeOpacity: {strokeOpacity.toFixed(2)}</h3>
          <input type="range" min={0} max={1} step={0.05}
            value={strokeOpacity}
            onChange={e => setStrokeOpacity(Number(e.target.value))}
            className="full-width" />
        </section>

        {/* fillOpacity */}
        <section>
          <h3>fillOpacity: {fillOpacity.toFixed(2)}</h3>
          <input type="range" min={0} max={1} step={0.05}
            value={fillOpacity}
            onChange={e => setFillOpacity(Number(e.target.value))}
            className="full-width" />
        </section>

        {/* strokeStyle */}
        <section>
          <h3>strokeStyle</h3>
          <div className="btn-group">
            {(['solid', 'dashed', 'dotted'] as const).map(s => (
              <button key={s}
                className={strokeStyle === s ? 'active' : ''}
                onClick={() => setStrokeStyle(s)}
              >{s}</button>
            ))}
          </div>
          <p className="muted small">dotted 仅 v4+ 支持，v3 无效</p>
        </section>

        {/* 开关 */}
        <section>
          <h3>行为开关</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={enableEditing}
              onChange={e => {
                // 切换前同步编辑后的路径，避免丢失
                setPath(editedPathRef.current);
                setEnableEditing(e.target.checked);
              }} />
            enableEditing（拖拽顶点编辑）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={enableMassClear}
              onChange={e => setEnableMassClear(e.target.checked)} />
            enableMassClear
          </label>
          <div className="btn-group" style={{ marginTop: 4 }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              const before = mapRef?.getOverlays() ?? [];
              mapRef?.clearOverlays();
              const after = mapRef?.getOverlays() ?? [];
              log(`🧹 clearOverlays: ${before.length} → ${after.length}（massClear=${enableMassClear ? 'on' : 'off'}）`);
            }}>clearOverlays 测试</button>
          </div>
          <p className="muted small">enableMassClear=true 时 clearOverlays 会清除；false 时不受影响。</p>
          <label className="checkbox-row">
            <input type="checkbox" checked={enableClicking}
              onChange={e => setEnableClicking(e.target.checked)} />
            enableClicking（重建多边形）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible}
              onChange={e => setVisible(e.target.checked)} />
            visible（show/hide）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={linkRight}
              onChange={e => setLinkRight(e.target.checked)} />
            linkRight（跨180°最短路径）
          </label>
        </section>

        {/* ctorOnlyProps — 重建生效 */}
        <section>
          <h3>strokeLineCap {v4Tag}</h3>
          <div className="btn-group">
            {(['round', 'butt', 'square'] as const).map(s => (
              <button key={s}
                className={strokeLineCap === s ? 'active' : ''}
                onClick={() => setStrokeLineCap(s)}
              >{s}</button>
            ))}
          </div>
        </section>

        <section>
          <h3>strokeLineJoin {v4Tag}</h3>
          <div className="btn-group">
            {(['round', 'miter', 'bevel'] as const).map(s => (
              <button key={s}
                className={strokeLineJoin === s ? 'active' : ''}
                onClick={() => setStrokeLineJoin(s)}
              >{s}</button>
            ))}
          </div>
        </section>

        {/* zIndex */}
        <section>
          <h3>zIndex</h3>
          <input type="number" placeholder="未设置"
            value={zIndex ?? ''}
            onChange={e =>
              setZIndex(e.target.value === '' ? undefined : Number(e.target.value))
            } />
        </section>

        {/* 路径操作 */}
        <section>
          <h3>路径操作（path 变更触发 setPath）</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPath(p => [...p, { lng: p[p.length - 1].lng + 0.005, lat: p[p.length - 1].lat + 0.003 }]);
              log('➕ 添加顶点');
            }}>添加顶点</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPath(p => p.length > 3 ? p.slice(0, -1) : p);
              log('➖ 删除末尾顶点');
            }}>删除末尾顶点</button>
          </div>
        </section>

        {/* 动作 */}
        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPath(DEFAULT_PATH);
              setStrokeColor('#1890ff');
              setFillColor('#1890ff');
              setStrokeWeight(4);
              setStrokeOpacity(1);
              setFillOpacity(0.3);
              setStrokeStyle('solid');
              setEnableEditing(false);
              setEnableMassClear(true);
              setEnableClicking(true);
              setStrokeLineCap('round');
              setStrokeLineJoin('round');
              setLinkRight(false);
              setZIndex(undefined);
              setVisible(true);
              log('🔄 reset all');
            }}>reset all</button>
          </div>
        </section>

        {/* 预设样式 */}
        <section>
          <h3>预设样式</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setStrokeColor('#ff0000');
              setFillColor('#ff0000');
              setFillOpacity(0.2);
              log('🔴 红色半透明');
            }}>红色半透明</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setStrokeColor('#00aa00');
              setFillColor('#00aa00');
              setStrokeStyle('dashed');
              log('🟢 绿色虚线边');
            }}>绿色虚线边</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setStrokeColor('#1890ff');
              setFillColor('');
              setStrokeWeight(2);
              log('🔵 无填充线框');
            }}>无填充线框</button>
          </div>
        </section>

        <section>
          <h3>事件测试</h3>
          <p className="muted small">
            事件列表：click, dblclick, rightclick, rightdblclick(v4+),
            mousedown, mouseup, mouseover, mouseout, mousemove,
            remove, lineupdate
          </p>
        </section>
      </div>
    </div>
  );
}
