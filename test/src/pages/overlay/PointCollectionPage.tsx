/**
 * PointCollection 全量测试页 — 覆盖 PointCollection.d.ts + PointCollectionOptions.d.ts 全部功能。
 * 整体 @removed 4.0，仅 v3 可用；v4 上类不存在，createOverlayFactory 会捕获并报告不支持。
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Map, PointCollection, useCapabilities } from 'react-bmap';
import type { Point } from 'react-bmap';
import {
  BMAP_POINT_SHAPE_STAR,
  BMAP_POINT_SHAPE_WATERDROP,
  BMAP_POINT_SHAPE_CIRCLE,
  BMAP_POINT_SHAPE_SQUARE,
  BMAP_POINT_SHAPE_RHOMBUS,
  BMAP_POINT_SIZE_TINY,
  BMAP_POINT_SIZE_SMALLER,
  BMAP_POINT_SIZE_SMALL,
  BMAP_POINT_SIZE_NORMAL,
  BMAP_POINT_SIZE_BIG,
  BMAP_POINT_SIZE_BIGGER,
  BMAP_POINT_SIZE_HUGE,
} from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const SHAPES: { label: string; value: number }[] = [
  { label: 'STAR', value: BMAP_POINT_SHAPE_STAR },
  { label: 'WATERDROP', value: BMAP_POINT_SHAPE_WATERDROP },
  { label: 'CIRCLE', value: BMAP_POINT_SHAPE_CIRCLE },
  { label: 'SQUARE', value: BMAP_POINT_SHAPE_SQUARE },
  { label: 'RHOMBUS', value: BMAP_POINT_SHAPE_RHOMBUS },
];

const SIZES: { label: string; value: number }[] = [
  { label: 'TINY', value: BMAP_POINT_SIZE_TINY },
  { label: 'SMALLER', value: BMAP_POINT_SIZE_SMALLER },
  { label: 'SMALL', value: BMAP_POINT_SIZE_SMALL },
  { label: 'NORMAL', value: BMAP_POINT_SIZE_NORMAL },
  { label: 'BIG', value: BMAP_POINT_SIZE_BIG },
  { label: 'BIGGER', value: BMAP_POINT_SIZE_BIGGER },
  { label: 'HUGE', value: BMAP_POINT_SIZE_HUGE },
];

const COLOR_PRESETS = ['#fa937e', '#ff0000', '#1890ff', '#52c41a', '#722ed1'];

/** 生成以中心点为圆心、随机散布的点集合 */
function genPoints(center: Point, count: number, radius: number): Point[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * radius;
    return {
      lng: center.lng + r * Math.cos(angle) * 0.01,
      lat: center.lat + r * Math.sin(angle) * 0.008,
    };
  });
}

export function PointCollectionPage() {
  const caps = useCapabilities();
  const isV4 = caps.has('Map.setHeading');

  const [points, setPoints] = useState<Point[]>(() => genPoints(BEIJING, 200, 5));
  const [pointCount, setPointCount] = useState(200);
  const [shape, setShape] = useState(BMAP_POINT_SHAPE_CIRCLE);
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [size, setSize] = useState(BMAP_POINT_SIZE_NORMAL);
  const [enableMassClear, setEnableMassClear] = useState(true);
  const [visible, setVisible] = useState(true);
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

  const fmtPt = (pt: any) =>
    pt ? `${pt.lng?.toFixed(4)},${pt.lat?.toFixed(4)}` : '';

  const onEvt = useCallback(
    (name: string) => (pt: any) =>
      log(`Ⓧ pc.${name}${pt ? ` @ ${fmtPt(pt)}` : ''}`),
    [log],
  );

  const v3OnlyTag = (
    <span className={`cap-tag ${isV4 ? 'no' : 'ok'}`}>
      {isV4 ? 'v4 已移除' : 'v3 only'}
    </span>
  );

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}>
          <PointCollection
            points={points}
            shape={shape}
            color={color}
            size={size}
            enableMassClear={enableMassClear}
            visible={visible}
            onClick={onEvt('click')}
            onMouseOver={onEvt('mouseover')}
            onMouseOut={onEvt('mouseout')}
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
            ? <div style={{ color: '#666' }}>点击/悬停海量点触发事件</div>
            : eventLog.map((line, i) => (
              <div key={i} style={{ lineHeight: 1.6 }}>{line}</div>
            ))}
        </div>
      </div>

      <div className="test-controls">
        <h2>PointCollection（全量）</h2>

        <section>
          <h3>能力</h3>
          <div className="cap-grid">
            <div className={`cap-cell ${!isV4 ? 'ok' : 'no'}`}>
              PointCollection {v3OnlyTag}
            </div>
          </div>
          <p className="muted small">
            整体 @removed 4.0，仅 v3 可用。v4 上 PointCollection 类不存在，
            createOverlayFactory 会捕获并报告不支持。
          </p>
        </section>

        {/* points */}
        <section>
          <h3>points（坐标集合，pathProp）</h3>
          <label className="checkbox-row">
            点数量
            <input type="number" min={1} max={10000} value={pointCount}
              onChange={e => {
                const n = Math.max(1, Math.min(10000, Number(e.target.value)));
                setPointCount(n);
                setPoints(genPoints(BEIJING, n, 5));
                log(`Ⓧ 重新生成 ${n} 个点`);
              }} />
          </label>
          <div className="btn-group" style={{ flexWrap: 'wrap', marginTop: 4 }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPoints(genPoints(BEIJING, pointCount, 5));
              log('Ⓧ 重新随机分布');
            }}>重新随机分布</button>
          </div>
          <p className="muted small">走 setPoints()，实时更新</p>
        </section>

        {/* shape */}
        <section>
          <h3>shape（预设形状）</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {SHAPES.map(s => (
              <button key={s.label} style={{ fontSize: 11 }}
                className={shape === s.value ? 'active' : ''}
                onClick={() => { setShape(s.value); log(`Ⓧ shape → ${s.label}`); }}
              >{s.label}</button>
            ))}
          </div>
          <p className="muted small">走 setStyles()，批量更新 shape/color/size</p>
        </section>

        {/* color */}
        <section>
          <h3>color</h3>
          <input type="text" className="full-width" value={color}
            onChange={e => setColor(e.target.value)} />
          <div className="btn-group" style={{ flexWrap: 'wrap', marginTop: 4 }}>
            {COLOR_PRESETS.map(c => (
              <button key={c} style={{
                fontSize: 11, background: c,
                color: c === '#fa937e' || c === '#722ed1' ? '#fff' : '#000',
              }}
                className={color === c ? 'active' : ''}
                onClick={() => { setColor(c); log(`Ⓧ color → ${c}`); }}
              >{c}</button>
            ))}
          </div>
          <p className="muted small">支持十六进制/RGB/RGBA/HSL/HSLA</p>
        </section>

        {/* size */}
        <section>
          <h3>size（预设尺寸）</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {SIZES.map(s => (
              <button key={s.label} style={{ fontSize: 11 }}
                className={size === s.value ? 'active' : ''}
                onClick={() => { setSize(s.value); log(`Ⓧ size → ${s.label}`); }}
              >{s.label}</button>
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
            <input type="checkbox" checked={visible}
              onChange={e => setVisible(e.target.checked)} />
            visible（show/hide）
          </label>
        </section>

        {/* 动作 */}
        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPointCount(200);
              setPoints(genPoints(BEIJING, 200, 5));
              setShape(BMAP_POINT_SHAPE_CIRCLE);
              setColor(COLOR_PRESETS[0]);
              setSize(BMAP_POINT_SIZE_NORMAL);
              setEnableMassClear(true);
              setVisible(true);
              log('🔄 reset all');
            }}>reset all</button>
          </div>
        </section>

        {/* 预设 */}
        <section>
          <h3>预设</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setShape(BMAP_POINT_SHAPE_WATERDROP);
              setColor('#1890ff');
              setSize(BMAP_POINT_SIZE_SMALL);
              log('Ⓧ 蓝色水滴');
            }}>蓝色水滴</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setShape(BMAP_POINT_SHAPE_STAR);
              setColor('#fa937e');
              setSize(BMAP_POINT_SIZE_BIG);
              log('Ⓧ 橙色大星');
            }}>橙色大星</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPointCount(1000);
              setPoints(genPoints(BEIJING, 1000, 8));
              setShape(BMAP_POINT_SHAPE_CIRCLE);
              setColor('#52c41a');
              setSize(BMAP_POINT_SIZE_TINY);
              log('Ⓧ 1000 个绿色小点');
            }}>1000 点压测</button>
          </div>
        </section>

        <section>
          <h3>事件测试</h3>
          <p className="muted small">
            事件列表（PointCollectionEventMap，整体 @removed 4.0）：
            click, mouseover, mouseout。
            事件对象仅含 type / target / point 三个字段。
          </p>
        </section>
      </div>
    </div>
  );
}
