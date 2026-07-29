/**
 * BezierCurve 全量测试页 — 覆盖 BezierCurve.d.ts + BezierCurveOptions.d.ts 全部功能。
 * BezierCurve 整体 @since 4.0，v3 下 driver 返回 null（不渲染）。
 * 注意：SDK 无 enableEditing，BezierCurveEventMap 也不含编辑相关事件。
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Map, BezierCurve, Marker, useCapabilities } from 'react-bmap';
import type { Point } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

/** 预设路径点（2/3/4 点） */
const PATH_PRESETS: Record<string, Point[]> = {
  '2 点': [
    { lng: 116.385, lat: 39.905 },
    { lng: 116.425, lat: 39.925 },
  ],
  '3 点': [
    { lng: 116.380, lat: 39.900 },
    { lng: 116.405, lat: 39.930 },
    { lng: 116.430, lat: 39.905 },
  ],
  '4 点': [
    { lng: 116.375, lat: 39.905 },
    { lng: 116.395, lat: 39.930 },
    { lng: 116.415, lat: 39.900 },
    { lng: 116.435, lat: 39.925 },
  ],
};

export function BezierCurvePage() {
  const caps = useCapabilities();
  const supported = caps.has('BezierCurve');
  const [preset, setPreset] = useState<keyof typeof PATH_PRESETS>('3 点');
  const [cpPerSegment, setCpPerSegment] = useState<1 | 2>(1);
  const [curvature, setCurvature] = useState(0.015);
  const [showControlPoints, setShowControlPoints] = useState(true);
  const [strokeColor, setStrokeColor] = useState('#aa00ff');
  const [strokeWeight, setStrokeWeight] = useState(4);
  const [strokeOpacity, setStrokeOpacity] = useState(1);
  const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [enableMassClear, setEnableMassClear] = useState(true);
  const [enableClicking, setEnableClicking] = useState(true);
  const [dashArray, setDashArray] = useState<number[]>([]);
  const [zIndex, setZIndex] = useState<number | undefined>(undefined);
  const [visible, setVisible] = useState(true);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const path = PATH_PRESETS[preset];

  /**
   * 由 path + 曲率 + 每段控制点数推导 controlPoints。
   * 组数必须等于 path.length - 1，每组 1~2 个点。
   * 控制点取segment 上的等分点后沿法线方向偏移，便于直观看出曲率变化。
   */
  const controlPoints = useMemo<Point[][]>(() => {
    const groups: Point[][] = [];
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      const dx = b.lng - a.lng;
      const dy = b.lat - a.lat;
      const len = Math.hypot(dx, dy) || 1;
      // 法线方向（顺时针旋转 90°），交替翻转让多段曲线呈 S 形
      const sign = i % 2 === 0 ? 1 : -1;
      const nx = (-dy / len) * curvature * sign;
      const ny = (dx / len) * curvature * sign;
      if (cpPerSegment === 1) {
        groups.push([
          { lng: a.lng + dx / 2 + nx, lat: a.lat + dy / 2 + ny },
        ]);
      } else {
        groups.push([
          { lng: a.lng + dx / 3 + nx, lat: a.lat + dy / 3 + ny },
          { lng: a.lng + (dx * 2) / 3 + nx, lat: a.lat + (dy * 2) / 3 + ny },
        ]);
      }
    }
    return groups;
  }, [path, curvature, cpPerSegment]);

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
      log(`〰 bezier.${name}${pt ? ` @ ${fmtPt(pt)}` : ''}`),
    [log],
  );

  const v4Tag = (
    <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>
      {supported ? 'v4+' : 'v3 ✗'}
    </span>
  );

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={13} style={{ height: '100%' }}>
          <BezierCurve
            path={path}
            controlPoints={controlPoints}
            strokeColor={strokeColor}
            strokeWeight={strokeWeight}
            strokeOpacity={strokeOpacity}
            strokeStyle={strokeStyle}
            enableMassClear={enableMassClear}
            enableClicking={enableClicking}
            dashArray={dashArray.length ? dashArray : undefined}
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
            onLineUpdate={() => log('〰 bezier.lineupdate')}
          />
          {/* 路径点与控制点可视化，便于确认 controlPoints 是否生效 */}
          {showControlPoints && path.map((p, i) => (
            <Marker key={`p-${i}`} position={p} title={`path[${i}]`} />
          ))}
          {showControlPoints && controlPoints.flatMap((group, gi) =>
            group.map((cp, ci) => (
              <Marker key={`cp-${gi}-${ci}`} position={cp}
                title={`controlPoints[${gi}][${ci}]`} />
            )),
          )}
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
            ? <div style={{ color: '#666' }}>与曲线交互触发事件</div>
            : eventLog.map((line, i) => (
              <div key={i} style={{ lineHeight: 1.6 }}>{line}</div>
            ))}
        </div>
      </div>

      <div className="test-controls">
        <h2>BezierCurve（全量）</h2>

        <section>
          <h3>能力 {v4Tag}</h3>
          <div className="cap-grid">
            <div className={`cap-cell ${supported ? 'ok' : 'no'}`}>
              BezierCurve
            </div>
          </div>
          {!supported && (
            <p className="muted small">
              BezierCurve 是 4.0 新增覆盖物，当前为 v3，driver 返回 null，地图上不会渲染。
            </p>
          )}
        </section>

        {/* path */}
        <section>
          <h3>path（路径点，至少 2 个）</h3>
          <div className="btn-group">
            {(Object.keys(PATH_PRESETS) as Array<keyof typeof PATH_PRESETS>).map(k => (
              <button key={k}
                className={preset === k ? 'active' : ''}
                onClick={() => { setPreset(k); log(`〰 path → ${k}`); }}
              >{k}</button>
            ))}
          </div>
          <p className="muted small">当前 {path.length} 个路径点</p>
        </section>

        {/* controlPoints */}
        <section>
          <h3>controlPoints（控制点）</h3>
          <p className="muted small">
            组数必须 = path.length - 1，当前 {controlPoints.length} 组，
            每组 {cpPerSegment} 个点。
          </p>
          <div className="btn-group">
            {([1, 2] as const).map(n => (
              <button key={n}
                className={cpPerSegment === n ? 'active' : ''}
                onClick={() => { setCpPerSegment(n); log(`〰 每段 ${n} 个控制点`); }}
              >每段 {n} 个</button>
            ))}
          </div>
          <label className="checkbox-row">
            <input type="checkbox" checked={showControlPoints}
              onChange={e => setShowControlPoints(e.target.checked)} />
            用 Marker 标出路径点/控制点
          </label>
        </section>

        {/* 曲率 */}
        <section>
          <h3>曲率偏移: {curvature.toFixed(3)}°</h3>
          <input type="range" min={0} max={0.04} step={0.001} value={curvature}
            onChange={e => setCurvature(Number(e.target.value))}
            className="full-width" />
          <p className="muted small">
            控制点沿线段法线方向的偏移量，0 时退化为近似直线
          </p>
        </section>

        {/* strokeColor */}
        <section>
          <h3>strokeColor</h3>
          <input type="color" value={strokeColor}
            onChange={e => setStrokeColor(e.target.value)} />
          <span style={{ marginLeft: 8, fontFamily: 'monospace' }}>
            {strokeColor}
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
        </section>

        {/* 开关 */}
        <section>
          <h3>行为开关</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={enableMassClear}
              onChange={e => setEnableMassClear(e.target.checked)} />
            enableMassClear
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={enableClicking}
              onChange={e => setEnableClicking(e.target.checked)} />
            enableClicking（重建曲线）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible}
              onChange={e => setVisible(e.target.checked)} />
            visible（show/hide）
          </label>
          <p className="muted small">
            BezierCurve 无 enableEditing / fillColor / strokeLineCap / coordType
          </p>
        </section>

        {/* dashArray */}
        <section>
          <h3>dashArray</h3>
          <input type="text" placeholder="如 8,4"
            value={dashArray.join(',')}
            onChange={e => {
              const parts = e.target.value.split(',')
                .map(s => Number(s.trim()))
                .filter(n => !isNaN(n) && n > 0);
              setDashArray(parts);
            }} />
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

        {/* 动作 */}
        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPreset('3 点');
              setCpPerSegment(1);
              setCurvature(0.015);
              setShowControlPoints(true);
              setStrokeColor('#aa00ff');
              setStrokeWeight(4);
              setStrokeOpacity(1);
              setStrokeStyle('solid');
              setEnableMassClear(true);
              setEnableClicking(true);
              setDashArray([]);
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
              setStrokeWeight(6);
              setCurvature(0.03);
              log('🔴 红色大曲率');
            }}>红色大曲率</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setStrokeStyle('dashed');
              setDashArray([10, 6]);
              log('虚线 10,6');
            }}>虚线 10,6</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPreset('4 点');
              setCpPerSegment(2);
              setCurvature(0.02);
              log('〰 S 形多段曲线');
            }}>S 形多段</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setCurvature(0);
              log('〰 曲率归零（近似直线）');
            }}>曲率归零</button>
          </div>
        </section>

        <section>
          <h3>事件测试</h3>
          <p className="muted small">
            事件列表（BezierCurveEventMap = GraphEventMap 去掉编辑事件，整体 v4+）：
            click, dblclick, rightclick, rightdblclick,
            mousedown, mouseup, mouseover, mouseout, mousemove,
            remove, lineupdate
          </p>
        </section>
      </div>
    </div>
  );
}
