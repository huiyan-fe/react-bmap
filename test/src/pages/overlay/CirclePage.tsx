/**
 * Circle 全量测试页 — 覆盖 Circle.d.ts + CircleOptions.d.ts 全部功能。
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Map, Circle, useCapabilities } from 'react-bmap';
import type { Point, MapRef } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const DEFAULT_CENTER: Point = { lng: 116.404, lat: 39.915 };

export function CirclePage() {
  const caps = useCapabilities();
  const [center, setCenter] = useState<Point>(DEFAULT_CENTER);
  const [radius, setRadius] = useState(1000);
  const [strokeColor, setStrokeColor] = useState('#1890ff');
  const [fillColor, setFillColor] = useState('#1890ff');
  const [strokeWeight, setStrokeWeight] = useState(4);
  const [strokeOpacity, setStrokeOpacity] = useState(1);
  const [fillOpacity, setFillOpacity] = useState(0.3);
  const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [enableEditing, setEnableEditing] = useState(false);
  const [enableMassClear, setEnableMassClear] = useState(true);
  const [enableClicking, setEnableClicking] = useState(true);
  const [zIndex, setZIndex] = useState<number | undefined>(undefined);
  const [visible, setVisible] = useState(true);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [mapRef, setMapRef] = useState<MapRef | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const editedCenterRef = useRef<Point>(DEFAULT_CENTER);
  const editedRadiusRef = useRef(1000);

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
      log(`⭕ circle.${name}${pt ? ` @ ${fmtPt(pt)}` : ''}`),
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
          <Circle
            center={center}
            radius={radius}
            strokeColor={strokeColor}
            fillColor={fillColor}
            strokeWeight={strokeWeight}
            strokeOpacity={strokeOpacity}
            fillOpacity={fillOpacity}
            strokeStyle={strokeStyle}
            enableEditing={enableEditing}
            enableMassClear={enableMassClear}
            enableClicking={enableClicking}
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
              log('⭕ circle.lineupdate');
              // 编辑后把当前 center/radius 存入 ref，切换 enableEditing 前同步到 state
              const raw = e?.target;
              if (raw) {
                try {
                  const c = raw.getCenter?.();
                  if (c) editedCenterRef.current = { lng: c.lng, lat: c.lat };
                  const r = raw.getRadius?.();
                  if (typeof r === 'number') editedRadiusRef.current = r;
                } catch { /* ignore */ }
              }
            }}
            onEditStart={() => log('⭕ circle.editstart')}
            onEditEnd={() => log('⭕ circle.editend')}
            onLineVertexDragStart={() => log('⭕ vertex.dragstart')}
            onLineVertexDragging={() => log('⭕ vertex.dragging')}
            onLineVertexDragEnd={() => log('⭕ vertex.dragend')}
            onLineVertexDel={() => log('⭕ vertex.del')}
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
            ? <div style={{ color: '#666' }}>与圆形交互触发事件</div>
            : eventLog.map((line, i) => (
              <div key={i} style={{ lineHeight: 1.6 }}>{line}</div>
            ))}
        </div>
      </div>

      <div className="test-controls">
        <h2>Circle（全量）</h2>

        <section>
          <h3>能力</h3>
          <div className="cap-grid">
            <div className={`cap-cell ${caps.has('Circle') ? 'ok' : 'no'}`}>
              Circle
            </div>
          </div>
        </section>

        {/* center */}
        <section>
          <h3>center（圆心）</h3>
          <label className="checkbox-row">
            lng
            <input type="number" step={0.001} value={center.lng}
              onChange={e => setCenter(c => ({ ...c, lng: Number(e.target.value) }))} />
          </label>
          <label className="checkbox-row">
            lat
            <input type="number" step={0.001} value={center.lat}
              onChange={e => setCenter(c => ({ ...c, lat: Number(e.target.value) }))} />
          </label>
        </section>

        {/* radius */}
        <section>
          <h3>radius: {radius}m</h3>
          <input type="range" min={100} max={10000} step={100} value={radius}
            onChange={e => setRadius(Number(e.target.value))}
            className="full-width" />
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
                // 切换前同步编辑后的 center/radius，避免重建时丢失
                setCenter(editedCenterRef.current);
                setRadius(editedRadiusRef.current);
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
            enableClicking（重建圆形）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible}
              onChange={e => setVisible(e.target.checked)} />
            visible（show/hide）
          </label>
        </section>

        {/* zIndex */}
        <section>
          <h3>zIndex {v4Tag}</h3>
          <input type="number" placeholder="未设置"
            value={zIndex ?? ''}
            onChange={e =>
              setZIndex(e.target.value === '' ? undefined : Number(e.target.value))
            } />
        </section>

        {/* 动作 */}
        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setCenter(DEFAULT_CENTER);
              setRadius(1000);
              setStrokeColor('#1890ff');
              setFillColor('#1890ff');
              setStrokeWeight(4);
              setStrokeOpacity(1);
              setFillOpacity(0.3);
              setStrokeStyle('solid');
              setEnableEditing(false);
              setEnableMassClear(true);
              setEnableClicking(true);
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
            <button style={{ fontSize: 11 }} onClick={() => {
              setRadius(3000);
              log('⭕ 大圆 3km');
            }}>大圆 3km</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setRadius(500);
              log('⭕ 小圆 500m');
            }}>小圆 500m</button>
          </div>
        </section>

        <section>
          <h3>事件测试</h3>
          <p className="muted small">
            事件列表：click, dblclick, rightclick, rightdblclick(v4+),
            mousedown, mouseup, mouseover, mouseout, mousemove,
            remove, lineupdate, editstart(v4+), editend(v4+),
            linevertexdragstart(v4+), linevertexdragging(v4+),
            linevertexdragend(v4+), linevertexdel(v4+)
          </p>
        </section>
      </div>
    </div>
  );
}
