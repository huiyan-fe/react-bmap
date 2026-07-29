/**
 * Hotspot 全量测试页 — 覆盖 Hotspot.d.ts + HotspotOptions.d.ts 全部功能。
 * Hotspot 整体 @removed 4.0，仅 v3 可用。
 * 不走 addOverlay，通过 map.addHotspot/removeHotspot 管理。
 * 无事件（SDK 未定义 HotspotEventMap）。
 * Setter：setPosition / setText / setUserData。
 * 无 setter：offsets / minZoom / maxZoom → ctorOnlyProps。
 */
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Map, Marker, useMapContext, useCapabilities } from 'react-bmap';
import type { OverlayHandle, Point } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const DEFAULT_POINT: Point = { lng: 116.380, lat: 39.930 };

/** Hotspot 图层 — 必须在 <Map> 内部 */
function HotspotLayer(props: {
  position: Point;
  text: string;
  offsets: number[];
  userData: string;
  minZoom: number | undefined;
  maxZoom: number | undefined;
  onLog: (msg: string) => void;
}) {
  const { map, driver } = useMapContext();
  const { position, text, offsets, userData, minZoom, maxZoom, onLog } = props;
  const hotspotRef = useRef<OverlayHandle | null>(null);

  // Hotspot 加到地图后 setText/setPosition 都不刷新，任意属性变化时整体重建
  const rebuildKey = `${position.lng},${position.lat}|${text}|${offsets.join(',')}|${userData}|${minZoom ?? ''}|${maxZoom ?? ''}`;

  useLayoutEffect(() => {
    if (!driver || !map) return;
    const opts: Record<string, unknown> = {};
    if (text) opts.text = text;
    if (offsets.length) opts.offsets = offsets;
    if (userData) opts.userData = userData;
    if (minZoom !== undefined) opts.minZoom = minZoom;
    if (maxZoom !== undefined) opts.maxZoom = maxZoom;

    const h = driver.createHotspot(position, opts);
    if (!h) { onLog('❌ Hotspot 创建失败'); return; }
    hotspotRef.current = h;

    // 显式调 setText/setUserData：v3 constructor 可能不读 options 里的 text
    driver.setOverlayOptions(h, { text, userData });
    driver.addHotspot(map, h);
    onLog(`✅ Hotspot 创建 text="${text}" pos=${position.lng},${position.lat}`);
    console.log('[Hotspot] rebuild', { text, position, raw: h });

    return () => {
      // removeHotspot 可能不生效，用 clearHotspots 确保清空
      if (map) driver.clearHotspots(map);
      hotspotRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, map, rebuildKey]);

  return null;
}

export function HotspotPage() {
  const caps = useCapabilities();
  const isV4 = caps.has('Map.setHeading');

  const [position, setPosition] = useState<Point>(DEFAULT_POINT);
  const [text, setText] = useState('text');
  const [offsets, setOffsets] = useState<number[]>([50, 50, 50, 50]);
  const [userData, setUserData] = useState('自定义数据');
  const [minZoom, setMinZoom] = useState<number | undefined>(undefined);
  const [maxZoom, setMaxZoom] = useState<number | undefined>(undefined);
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

  const v3OnlyTag = (
    <span className={`cap-tag ${isV4 ? 'no' : 'ok'}`}>
      {isV4 ? 'v4 已移除' : 'v3 only'}
    </span>
  );

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={14} style={{ height: '100%' }}>
          {!isV4 && <>
            <Marker position={position} />
            <HotspotLayer
              position={position}
              text={text}
              offsets={offsets}
              userData={userData}
              minZoom={minZoom}
              maxZoom={maxZoom}
              onLog={log}
            />
          </>}
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
            ? <div style={{ color: '#666' }}>Hotspot 无事件；操作日志在此</div>
            : eventLog.map((line, i) => (
              <div key={i} style={{ lineHeight: 1.6 }}>{line}</div>
            ))}
        </div>
      </div>

      <div className="test-controls">
        <h2>Hotspot（全量）</h2>

        <section>
          <h3>能力 {v3OnlyTag}</h3>
          <p className="muted small">
            整体 @removed 4.0，仅 v3 可用。不走 addOverlay，
            通过 map.addHotspot/removeHotspot 管理。
            <strong>Hotspot 本身不可见</strong>——鼠标悬停到 Marker 附近时显示 text 提示。
            offsets 控制热区范围（像素），默认 30px 方便触发。
          </p>
        </section>

        {/* position */}
        <section>
          <h3>position（位置，positionProp）</h3>
          <label className="checkbox-row">
            lng
            <input type="number" step={0.001} value={position.lng}
              onChange={e => setPosition(p => ({ ...p, lng: Number(e.target.value) }))} />
          </label>
          <label className="checkbox-row">
            lat
            <input type="number" step={0.001} value={position.lat}
              onChange={e => setPosition(p => ({ ...p, lat: Number(e.target.value) }))} />
          </label>
          <p className="muted small">走 setPosition()</p>
        </section>

        {/* text */}
        <section>
          <h3>text（提示文本）</h3>
          <input type="text" className="full-width" value={text}
            onChange={e => setText(e.target.value)} />
          <p className="muted small">走 setText()</p>
        </section>

        {/* offsets */}
        <section>
          <h3>offsets（扩展偏移 [top, right, bottom, left]）</h3>
          {[0, 1, 2, 3].map(i => (
            <label key={i} className="checkbox-row">
              {['top', 'right', 'bottom', 'left'][i]}
              <input type="number" value={offsets[i] ?? 5}
                onChange={e => {
                  const next = [...offsets];
                  next[i] = Number(e.target.value);
                  setOffsets(next);
                }} />
            </label>
          ))}
          <p className="muted small">ctorOnlyProps（无 setter），改值重建 Hotspot @default [5,5,5,5]</p>
        </section>

        {/* userData */}
        <section>
          <h3>userData（自定义数据）</h3>
          <input type="text" className="full-width" value={userData}
            onChange={e => setUserData(e.target.value)} />
          <p className="muted small">走 setUserData()；SDK 类型为 any</p>
        </section>

        {/* minZoom / maxZoom */}
        <section>
          <h3>缩放级别范围</h3>
          <label className="checkbox-row">
            minZoom
            <input type="number" placeholder="未设置" value={minZoom ?? ''}
              onChange={e => setMinZoom(e.target.value === '' ? undefined : Number(e.target.value))} />
          </label>
          <label className="checkbox-row">
            maxZoom
            <input type="number" placeholder="未设置" value={maxZoom ?? ''}
              onChange={e => setMaxZoom(e.target.value === '' ? undefined : Number(e.target.value))} />
          </label>
          <p className="muted small">ctorOnlyProps（无 setter），改值重建 Hotspot</p>
        </section>

        {/* 动作 */}
        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPosition(DEFAULT_POINT);
              setText('天安门');
              setOffsets([50, 50, 50, 50]);
              setUserData('自定义数据');
              setMinZoom(undefined);
              setMaxZoom(undefined);
              log('🔄 reset all');
            }}>reset all</button>
          </div>
        </section>

        <section>
          <h3>事件说明</h3>
          <p className="muted small">
            Hotspot 是值对象（非 Overlay），SDK 未定义 HotspotEventMap。
            无事件可测试。
          </p>
        </section>
      </div>
    </div>
  );
}
