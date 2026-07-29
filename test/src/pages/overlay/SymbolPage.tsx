/**
 * Symbol 全量测试页 — 覆盖 Symbol.d.ts + SymbolOptions.d.ts 全部功能。
 * Symbol 是值对象（非 Overlay），用作 Marker 的 icon。
 * 预定义符号常量：BMap_Symbol_SHAPE_*（CIRCLE/STAR/RECTANGLE 等）。
 * 无事件（Symbol 不是 Overlay，没有 addEventListener）。
 */
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Map, useMapContext } from 'react-bmap';
import type { OverlayHandle, Point, Size } from 'react-bmap';
import {
  BMap_Symbol_SHAPE_CIRCLE,
  BMap_Symbol_SHAPE_RECTANGLE,
  BMap_Symbol_SHAPE_RHOMBUS,
  BMap_Symbol_SHAPE_STAR,
  BMap_Symbol_SHAPE_BACKWARD_CLOSED_ARROW,
  BMap_Symbol_SHAPE_FORWARD_CLOSED_ARROW,
  BMap_Symbol_SHAPE_POINT,
  BMap_Symbol_SHAPE_PLANE,
  BMap_Symbol_SHAPE_CAMERA,
  BMap_Symbol_SHAPE_WARNING,
  BMap_Symbol_SHAPE_SMILE,
  BMap_Symbol_SHAPE_CLOCK,
} from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const SHAPES: { label: string; value: number }[] = [
  { label: 'CIRCLE', value: BMap_Symbol_SHAPE_CIRCLE },
  { label: 'RECTANGLE', value: BMap_Symbol_SHAPE_RECTANGLE },
  { label: 'RHOMBUS', value: BMap_Symbol_SHAPE_RHOMBUS },
  { label: 'STAR', value: BMap_Symbol_SHAPE_STAR },
  { label: 'ARROW←', value: BMap_Symbol_SHAPE_BACKWARD_CLOSED_ARROW },
  { label: 'ARROW→', value: BMap_Symbol_SHAPE_FORWARD_CLOSED_ARROW },
  { label: 'POINT', value: BMap_Symbol_SHAPE_POINT },
  { label: 'PLANE', value: BMap_Symbol_SHAPE_PLANE },
  { label: 'CAMERA', value: BMap_Symbol_SHAPE_CAMERA },
  { label: 'WARNING', value: BMap_Symbol_SHAPE_WARNING },
  { label: 'SMILE', value: BMap_Symbol_SHAPE_SMILE },
  { label: 'CLOCK', value: BMap_Symbol_SHAPE_CLOCK },
];

const COLOR_PRESETS = ['#ff0000', '#1890ff', '#52c41a', '#722ed1', '#fa937e', '#fff'];

const DEFAULT_POINT: Point = { lng: 116.404, lat: 39.915 };

/** Symbol + Marker 图层 — 必须在 <Map> 内部，才能调用 useMapContext */
function SymbolMarkerLayer(props: {
  path: number | string;
  fillColor: string;
  fillOpacity: number;
  scale: number;
  rotation: number;
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
  anchor: Size;
  markerPosition: Point;
  onLog: (msg: string) => void;
}) {
  const { map, driver } = useMapContext();
  const { path, fillColor, fillOpacity, scale, rotation,
    strokeColor, strokeOpacity, strokeWeight, anchor,
    markerPosition, onLog } = props;

  const symbolRef = useRef<OverlayHandle | null>(null);
  const markerRef = useRef<OverlayHandle | null>(null);

  // ─── 创建 Symbol + Marker（path 变化时重建）───
  const pathKey = String(path);
  useLayoutEffect(() => {
    if (!driver || !map) return;
    const sym = driver.createSymbol(path, {
      fillColor, fillOpacity, scale, rotation,
      strokeColor, strokeOpacity, strokeWeight, anchor,
    });
    if (!sym) { onLog('❌ Symbol 创建失败'); return; }
    symbolRef.current = sym;

    // 用 Symbol 作为 Marker 的 icon：toRawIcon 识别 Handle.raw
    const mk = driver.createMarker(markerPosition, { icon: sym });
    if (!mk) { onLog('❌ Marker 创建失败'); return; }
    markerRef.current = mk;
    driver.addOverlay(map, mk);
    onLog('✅ Symbol + Marker 创建');

    return () => {
      if (markerRef.current && map) driver.removeOverlay(map, markerRef.current);
      symbolRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, map, pathKey]);

  // ─── 响应式更新 Symbol 选项（走 setOverlayOptions → 各 setter）───
  useEffect(() => {
    if (!driver || !symbolRef.current) return;
    driver.setOverlayOptions(symbolRef.current, {
      fillColor, fillOpacity, scale, rotation,
      strokeColor, strokeOpacity, strokeWeight, anchor,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, fillColor, fillOpacity, scale, rotation, strokeColor, strokeOpacity, strokeWeight, anchor]);

  // ─── 更新 Marker 位置 ───
  useEffect(() => {
    if (!driver || !markerRef.current) return;
    driver.setOverlayPosition(markerRef.current, markerPosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, markerPosition.lng, markerPosition.lat]);

  return null;
}

export function SymbolPage() {
  const [path, setPath] = useState<number | string>(BMap_Symbol_SHAPE_STAR);
  const [fillColor, setFillColor] = useState('#ff0000');
  const [fillOpacity, setFillOpacity] = useState(0.8);
  const [scale, setScale] = useState(5);
  const [rotation, setRotation] = useState(0);
  const [strokeColor, setStrokeColor] = useState('#333');
  const [strokeOpacity, setStrokeOpacity] = useState(1);
  const [strokeWeight, setStrokeWeight] = useState(2);
  const [anchor, setAnchor] = useState<Size>({ width: 0, height: 0 });
  const [markerPosition, setMarkerPosition] = useState<Point>(DEFAULT_POINT);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [eventLog]);

  const log = useCallback((msg: string) => {
    setEventLog(s =>
      [`${new Date().toLocaleTimeString()} ${msg}`, ...s].slice(0, 20),
    );
  }, []);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={14} style={{ height: '100%' }}>
          <SymbolMarkerLayer
            path={path}
            fillColor={fillColor}
            fillOpacity={fillOpacity}
            scale={scale}
            rotation={rotation}
            strokeColor={strokeColor}
            strokeOpacity={strokeOpacity}
            strokeWeight={strokeWeight}
            anchor={anchor}
            markerPosition={markerPosition}
            onLog={log}
          />
        </Map>
        {/* 操作日志（Symbol 无事件，仅记录操作日志） */}
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
            <span>操作日志（{eventLog.length}）</span>
            <button onClick={() => setEventLog([])}
              style={{
                background: 'transparent', border: '1px solid #555',
                color: '#aaa', cursor: 'pointer', fontSize: 10,
                borderRadius: 3, padding: '0 6px',
              }}
            >清空</button>
          </div>
          {eventLog.length === 0
            ? <div style={{ color: '#666' }}>Symbol 无事件（值对象）；操作日志在此</div>
            : eventLog.map((line, i) => (
              <div key={i} style={{ lineHeight: 1.6 }}>{line}</div>
            ))}
        </div>
      </div>

      <div className="test-controls">
        <h2>Symbol（全量）</h2>

        <section>
          <h3>说明</h3>
          <p className="muted small">
            Symbol 是值对象（非 Overlay），用作 Marker 的 icon。
            创建 Symbol 实例后传给 Marker 的 icon 参数（toRawIcon 识别 Handle.raw）。
            无事件 — SDK 的 Symbol 没有 addEventListener。
          </p>
        </section>

        {/* path（shape） */}
        <section>
          <h3>path（预定义符号常量）</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {SHAPES.map(s => (
              <button key={s.label} style={{ fontSize: 10 }}
                className={path === s.value ? 'active' : ''}
                onClick={() => { setPath(s.value); log(`★ path → ${s.label}`); }}
              >{s.label}</button>
            ))}
          </div>
          <p className="muted small">
            path 变化时重建 Symbol + Marker（构造函数第一参数）。
            SDK 也有 setPath()，走 setOverlayOptions 响应式更新。
          </p>
        </section>

        {/* fillColor */}
        <section>
          <h3>fillColor</h3>
          <input type="text" className="full-width" value={fillColor}
            onChange={e => setFillColor(e.target.value)} />
          <div className="btn-group" style={{ flexWrap: 'wrap', marginTop: 4 }}>
            {COLOR_PRESETS.map(c => (
              <button key={c} style={{
                fontSize: 10, background: c,
                color: c === '#fff' ? '#000' : '#fff',
              }}
                className={fillColor === c ? 'active' : ''}
                onClick={() => { setFillColor(c); log(`★ fillColor → ${c}`); }}
              >{c}</button>
            ))}
          </div>
          <p className="muted small">走 setFillColor()</p>
        </section>

        {/* fillOpacity */}
        <section>
          <h3>fillOpacity: {fillOpacity.toFixed(2)}</h3>
          <input type="range" min={0} max={1} step={0.05} value={fillOpacity}
            onChange={e => setFillOpacity(Number(e.target.value))}
            className="full-width" />
          <p className="muted small">走 setFillOpacity()</p>
        </section>

        {/* scale */}
        <section>
          <h3>scale: {scale}</h3>
          <input type="range" min={1} max={20} step={1} value={scale}
            onChange={e => setScale(Number(e.target.value))}
            className="full-width" />
          <p className="muted small">走 setScale()</p>
        </section>

        {/* rotation */}
        <section>
          <h3>rotation: {rotation}°</h3>
          <input type="range" min={0} max={360} step={1} value={rotation}
            onChange={e => setRotation(Number(e.target.value))}
            className="full-width" />
          <p className="muted small">走 setRotation()，rotation=0 安全（不像 Marker 会塌缩）</p>
        </section>

        {/* strokeColor */}
        <section>
          <h3>strokeColor</h3>
          <input type="text" className="full-width" value={strokeColor}
            onChange={e => setStrokeColor(e.target.value)} />
          <p className="muted small">走 setStrokeColor()</p>
        </section>

        {/* strokeOpacity */}
        <section>
          <h3>strokeOpacity: {strokeOpacity.toFixed(2)}</h3>
          <input type="range" min={0} max={1} step={0.05} value={strokeOpacity}
            onChange={e => setStrokeOpacity(Number(e.target.value))}
            className="full-width" />
          <p className="muted small">走 setStrokeOpacity()</p>
        </section>

        {/* strokeWeight */}
        <section>
          <h3>strokeWeight: {strokeWeight}</h3>
          <input type="range" min={0} max={10} step={1} value={strokeWeight}
            onChange={e => setStrokeWeight(Number(e.target.value))}
            className="full-width" />
          <p className="muted small">走 setStrokeWeight()，未指定时与 scale 相同</p>
        </section>

        {/* anchor */}
        <section>
          <h3>anchor（锚点偏移）</h3>
          <label className="checkbox-row">
            width
            <input type="number" value={anchor.width}
              onChange={e => setAnchor(a => ({ ...a, width: Number(e.target.value) }))} />
          </label>
          <label className="checkbox-row">
            height
            <input type="number" value={anchor.height}
              onChange={e => setAnchor(a => ({ ...a, height: Number(e.target.value) }))} />
          </label>
          <p className="muted small">走 setAnchor()（Size 类型，非 Marker 的 number 枚举）</p>
        </section>

        {/* Marker 位置 */}
        <section>
          <h3>Marker 位置</h3>
          <label className="checkbox-row">
            lng
            <input type="number" step={0.001} value={markerPosition.lng}
              onChange={e => setMarkerPosition(p => ({ ...p, lng: Number(e.target.value) }))} />
          </label>
          <label className="checkbox-row">
            lat
            <input type="number" step={0.001} value={markerPosition.lat}
              onChange={e => setMarkerPosition(p => ({ ...p, lat: Number(e.target.value) }))} />
          </label>
        </section>

        {/* 动作 */}
        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPath(BMap_Symbol_SHAPE_STAR);
              setFillColor('#ff0000');
              setFillOpacity(0.8);
              setScale(5);
              setRotation(0);
              setStrokeColor('#333');
              setStrokeOpacity(1);
              setStrokeWeight(2);
              setAnchor({ width: 0, height: 0 });
              setMarkerPosition(DEFAULT_POINT);
              log('🔄 reset all');
            }}>reset all</button>
          </div>
        </section>

        {/* 预设 */}
        <section>
          <h3>预设</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPath(BMap_Symbol_SHAPE_STAR);
              setFillColor('#ff0000');
              setStrokeColor('#333');
              setScale(5);
              log('★ 红色五角星');
            }}>红色五角星</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPath(BMap_Symbol_SHAPE_CIRCLE);
              setFillColor('#1890ff');
              setFillOpacity(0.6);
              setStrokeColor('#096dd9');
              setScale(8);
              log('★ 蓝色圆');
            }}>蓝色圆</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPath(BMap_Symbol_SHAPE_SMILE);
              setFillColor('#faad14');
              setScale(6);
              log('★ 笑脸');
            }}>笑脸</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPath(BMap_Symbol_SHAPE_PLANE);
              setFillColor('#333');
              setScale(5);
              setRotation(45);
              log('★ 旋转飞机');
            }}>旋转飞机</button>
          </div>
        </section>

        <section>
          <h3>事件说明</h3>
          <p className="muted small">
            Symbol 是值对象（非 Overlay），SDK 的 Symbol 类没有 addEventListener。
            无事件可测试。
          </p>
        </section>
      </div>
    </div>
  );
}
