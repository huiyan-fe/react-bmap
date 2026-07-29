/**
 * IconSequence 全量测试页 — 覆盖 IconSequence.d.ts 全部功能。
 * IconSequence 是值对象（非 Overlay），用于在 Polyline 上重复显示符号。
 * @deprecated 4.0 已废弃，请使用 PolylineOptions#strokeTexture 替代。
 * constructor: new BMap.IconSequence(symbol, offset, repeat, fixedRotation)。
 * 全部 4 个参数都是位置参数，无 setter — 变化时重建 IconSequence + Polyline。
 * 无事件（值对象）。
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Map, useMapContext } from 'react-bmap';
import type { OverlayHandle, Point } from 'react-bmap';
import {
  BMap_Symbol_SHAPE_FORWARD_CLOSED_ARROW,
  BMap_Symbol_SHAPE_CIRCLE,
  BMap_Symbol_SHAPE_STAR,
  BMap_Symbol_SHAPE_RHOMBUS,
} from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const SHAPES = [
  { label: '箭头→', value: BMap_Symbol_SHAPE_FORWARD_CLOSED_ARROW },
  { label: '圆', value: BMap_Symbol_SHAPE_CIRCLE },
  { label: '星', value: BMap_Symbol_SHAPE_STAR },
  { label: '菱形', value: BMap_Symbol_SHAPE_RHOMBUS },
];

const PATH: Point[] = [
  { lng: 116.38, lat: 39.92 },
  { lng: 116.40, lat: 39.91 },
  { lng: 116.42, lat: 39.92 },
  { lng: 116.44, lat: 39.91 },
  { lng: 116.46, lat: 39.92 },
];

/** IconSequence + Polyline 图层 — 必须在 <Map> 内部 */
function IconSequenceLayer(props: {
  shape: number;
  fillColor: string;
  scale: number;
  offset: string;
  repeat: string;
  fixedRotation: boolean;
  onLog: (msg: string) => void;
}) {
  const { map, driver } = useMapContext();
  const { shape, fillColor, scale, offset, repeat, fixedRotation, onLog } = props;
  const polylineRef = useRef<OverlayHandle | null>(null);

  // 任意参数变化都重建 Symbol + IconSequence + Polyline（无 setter）
  const paramKey = `${shape}|${fillColor}|${scale}|${offset}|${repeat}|${fixedRotation}`;

  // 用 useEffect + rAF 代替 useLayoutEffect：给 SDK 一帧时间清理旧 IconSequence 的视觉元素
  useEffect(() => {
    if (!driver || !map) return;
    let cancelled = false;

    const raf = requestAnimationFrame(() => {
      if (cancelled || !driver || !map) return;
      // 1. 创建 Symbol
      const sym = driver.createSymbol(shape, { fillColor, scale });
      if (!sym) { onLog('❌ Symbol 创建失败'); return; }

      // 2. 创建 IconSequence
      const seq = driver.createIconSequence(sym, offset, repeat, fixedRotation);
      if (!seq) { onLog('❌ IconSequence 创建失败'); return; }

      // 3. 创建 Polyline，icons 数组传入 IconSequence
      const pl = driver.createPolyline(PATH, {
        strokeColor: '#1890ff',
        strokeWeight: 4,
        icons: [seq],
      });
      if (!pl) { onLog('❌ Polyline 创建失败'); return; }
      polylineRef.current = pl;
      driver.addOverlay(map, pl);
      onLog(`✅ 重建 scale=${scale}`);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (polylineRef.current && map) {
        // SDK 的 map.removeOverlay 不清理 IconSequence 视觉元素，
        // 尝试 hide + setPath([]) + clearOverlays 三重清理
        try {
          const raw = (polylineRef.current as any).raw;
          raw?.hide?.();
          raw?.setPath?.([]);
        } catch { /* ignore */ }
        driver.removeOverlay(map, polylineRef.current);
        // 终极手段：clearOverlays 确保画面上没有残留
        try { (map as any).raw?.clearOverlays?.(); } catch { /* ignore */ }
      }
      polylineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, map, paramKey]);

  return null;
}

export function IconSequencePage() {
  const [shape, setShape] = useState(BMap_Symbol_SHAPE_FORWARD_CLOSED_ARROW);
  const [fillColor, setFillColor] = useState('#1890ff');
  const [scale, setScale] = useState(3);
  const [offset, setOffset] = useState('0');
  const [repeat, setRepeat] = useState('50px');
  const [fixedRotation, setFixedRotation] = useState(true);
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

  const deprecatedTag = (
    <span className="cap-tag no">@deprecated 4.0</span>
  );

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={13} style={{ height: '100%' }}>
          <IconSequenceLayer
            shape={shape}
            fillColor={fillColor}
            scale={scale}
            offset={offset}
            repeat={repeat}
            fixedRotation={fixedRotation}
            onLog={log}
          />
        </Map>
        {/* 操作日志 */}
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
            ? <div style={{ color: '#666' }}>IconSequence 无事件（值对象）；操作日志在此</div>
            : eventLog.map((line, i) => (
              <div key={i} style={{ lineHeight: 1.6 }}>{line}</div>
            ))}
        </div>
      </div>

      <div className="test-controls">
        <h2>IconSequence（全量）</h2>

        <section>
          <h3>说明 {deprecatedTag}</h3>
          <p className="muted small">
            IconSequence 是值对象（非 Overlay），用于在 Polyline 上重复显示符号。
            constructor: new BMap.IconSequence(symbol, offset, repeat, fixedRotation)。
            全部参数无 setter，变化时重建 IconSequence + Polyline。
            4.0 已废弃，建议用 PolylineOptions#strokeTexture 替代。
          </p>
          <p className="muted small" style={{ marginTop: 4 }}>
            <strong>已知限制：</strong>
            repeat 非空时 offset 被忽略（SDK 行为，非 bug）；
            v4 上 scale 变化需等 rAF 重建，旧图标可能短暂残留；
            v4 对废弃功能支持不完整，建议切 v3 测试。
          </p>
        </section>

        {/* symbol */}
        <section>
          <h3>symbol（符号形状）</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {SHAPES.map(s => (
              <button key={s.label} style={{ fontSize: 11 }}
                className={shape === s.value ? 'active' : ''}
                onClick={() => { setShape(s.value); log(`➤ symbol → ${s.label}`); }}
              >{s.label}</button>
            ))}
          </div>
          <p className="muted small">Symbol Handle，传给 IconSequence constructor</p>
        </section>

        {/* fillColor (for Symbol) */}
        <section>
          <h3>fillColor（符号填充色）</h3>
          <input type="text" className="full-width" value={fillColor}
            onChange={e => setFillColor(e.target.value)} />
          <p className="muted small">Symbol 的 fillColor，非 IconSequence 本身的属性</p>
        </section>

        {/* scale (for Symbol) */}
        <section>
          <h3>scale: {scale}</h3>
          <input type="range" min={1} max={10} step={1} value={scale}
            onChange={e => setScale(Number(e.target.value))}
            className="full-width" />
          <p className="muted small">Symbol 的 scale；v4 上变化时重建可能短暂残留旧图标</p>
        </section>

        {/* offset */}
        <section>
          <h3>offset（符号相对线起点的位置）</h3>
          <input type="text" className="full-width" value={offset}
            onChange={e => setOffset(e.target.value)} />
          <p className="muted small">百分比（如 '50%'）或像素值；repeat 非空时 offset 被忽略（以 repeat 为准）</p>
        </section>

        {/* repeat */}
        <section>
          <h3>repeat（重复间距）</h3>
          <input type="text" className="full-width" value={repeat}
            onChange={e => setRepeat(e.target.value)} />
          <p className="muted small">百分比或像素值；与 offset 同时设置时以 repeat 为准</p>
        </section>

        {/* fixedRotation */}
        <section>
          <h3>fixedRotation</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={fixedRotation}
              onChange={e => setFixedRotation(e.target.checked)} />
            图标旋转角度与线走向一致
          </label>
        </section>

        {/* 动作 */}
        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setShape(BMap_Symbol_SHAPE_FORWARD_CLOSED_ARROW);
              setFillColor('#1890ff');
              setScale(3);
              setOffset('0');
              setRepeat('50px');
              setFixedRotation(true);
              log('🔄 reset all');
            }}>reset all</button>
          </div>
        </section>

        {/* 预设 */}
        <section>
          <h3>预设</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setShape(BMap_Symbol_SHAPE_FORWARD_CLOSED_ARROW);
              setRepeat('80px');
              setFixedRotation(true);
              log('➤ 箭头沿线');
            }}>箭头沿线</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setShape(BMap_Symbol_SHAPE_CIRCLE);
              setRepeat('30px');
              setFillColor('#52c41a');
              log('➤ 绿色圆点');
            }}>绿色圆点</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setShape(BMap_Symbol_SHAPE_STAR);
              setRepeat('100px');
              setFillColor('#fa937e');
              setScale(4);
              log('➤ 星标点缀');
            }}>星标点缀</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setShape(BMap_Symbol_SHAPE_FORWARD_CLOSED_ARROW);
              setOffset('50%');
              setRepeat('');
              log('➤ 仅 offset（repeat 清空）');
            }}>仅 offset 测试</button>
          </div>
        </section>

        <section>
          <h3>事件说明</h3>
          <p className="muted small">
            IconSequence 是值对象（非 Overlay），SDK 的 IconSequence 类没有 addEventListener。
            无事件可测试。
          </p>
        </section>
      </div>
    </div>
  );
}
