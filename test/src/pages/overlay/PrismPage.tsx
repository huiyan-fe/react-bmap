/**
 * Prism 全量测试页 — 覆盖 Prism.d.ts + PrismOptions.d.ts 全部功能。
 * Prism 整体 @since 4.0，v3 下 driver 返回 null（不渲染）。
 * 注意：SDK 无 enableEditing / 无任何 stroke 配置，PrismEventMap 也不含编辑相关事件。
 * 棱柱是 3D 覆盖物，需要地图倾斜（tilt）才能看出高度。
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Map, Prism, useCapabilities } from 'react-bmap';
import type { Point } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

/** 单坐标串预设（三角形 / 五边形） */
const TRIANGLE: Point[] = [
  { lng: 116.387112, lat: 39.920977 },
  { lng: 116.385243, lat: 39.913063 },
  { lng: 116.394226, lat: 39.917988 },
];
const PENTAGON: Point[] = [
  { lng: 116.404, lat: 39.925 },
  { lng: 116.416, lat: 39.918 },
  { lng: 116.412, lat: 39.906 },
  { lng: 116.396, lat: 39.906 },
  { lng: 116.392, lat: 39.918 },
];
/** 多坐标串预设：两个独立底面，仅 constructor 支持 */
const MULTI: Point[][] = [
  [
    { lng: 116.378, lat: 39.925 },
    { lng: 116.388, lat: 39.925 },
    { lng: 116.388, lat: 39.917 },
    { lng: 116.378, lat: 39.917 },
  ],
  [
    { lng: 116.398, lat: 39.925 },
    { lng: 116.408, lat: 39.925 },
    { lng: 116.408, lat: 39.917 },
    { lng: 116.398, lat: 39.917 },
  ],
];

const PATH_PRESETS = {
  '三角形': TRIANGLE,
  '五边形': PENTAGON,
  '多坐标串': MULTI,
} as const;

export function PrismPage() {
  const caps = useCapabilities();
  const supported = caps.has('Prism');
  const [preset, setPreset] = useState<keyof typeof PATH_PRESETS>('三角形');
  const [altitude, setAltitude] = useState(500);
  const [topFillColor, setTopFillColor] = useState('#4682b4');
  const [topFillOpacity, setTopFillOpacity] = useState(0.6);
  const [sideFillColor, setSideFillColor] = useState('#87ceeb');
  const [sideFillOpacity, setSideFillOpacity] = useState(0.8);
  const [enableMassClear, setEnableMassClear] = useState(true);
  const [enableClicking, setEnableClicking] = useState(true);
  const [zIndex, setZIndex] = useState<number | undefined>(undefined);
  const [visible, setVisible] = useState(true);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const path = PATH_PRESETS[preset];
  const isMulti = preset === '多坐标串';

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
      log(`🧊 prism.${name}${pt ? ` @ ${fmtPt(pt)}` : ''}`),
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
        <Map defaultCenter={BEIJING} defaultZoom={13}
          defaultTilt={45} style={{ height: '100%' }}>
          {/* 多坐标串无法通过 setPath 更新，用 key 强制重建 */}
          <Prism
            key={preset}
            path={path}
            altitude={altitude}
            topFillColor={topFillColor}
            topFillOpacity={topFillOpacity}
            sideFillColor={sideFillColor}
            sideFillOpacity={sideFillOpacity}
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
            onLineUpdate={() => log('🧊 prism.lineupdate')}
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
            ? <div style={{ color: '#666' }}>与棱柱交互触发事件</div>
            : eventLog.map((line, i) => (
              <div key={i} style={{ lineHeight: 1.6 }}>{line}</div>
            ))}
        </div>
      </div>

      <div className="test-controls">
        <h2>Prism（全量）</h2>

        <section>
          <h3>能力 {v4Tag}</h3>
          <div className="cap-grid">
            <div className={`cap-cell ${supported ? 'ok' : 'no'}`}>
              Prism
            </div>
          </div>
          {!supported && (
            <p className="muted small">
              Prism 是 4.0 新增覆盖物，当前为 v3，driver 返回 null，地图上不会渲染。
            </p>
          )}
          <p className="muted small">
            地图已设 defaultTilt=45，倾斜视角下才能看出棱柱高度
          </p>
        </section>

        {/* path */}
        <section>
          <h3>path（底面坐标）</h3>
          <div className="btn-group">
            {(Object.keys(PATH_PRESETS) as Array<keyof typeof PATH_PRESETS>).map(k => (
              <button key={k}
                className={preset === k ? 'active' : ''}
                onClick={() => { setPreset(k); log(`🧊 path → ${k}`); }}
              >{k}</button>
            ))}
          </div>
          {isMulti && (
            <p className="muted small">
              多坐标串（Point[][]）只有 constructor 支持，SDK 的 setPath() 不接受，
              driver 会跳过 setPath，本页用 key 强制重建实例。
            </p>
          )}
        </section>

        {/* altitude */}
        <section>
          <h3>altitude: {altitude}m</h3>
          <input type="range" min={0} max={3000} step={50} value={altitude}
            onChange={e => setAltitude(Number(e.target.value))}
            className="full-width" />
          <p className="muted small">SDK 必填参数，走 setAltitude()</p>
        </section>

        {/* topFillColor */}
        <section>
          <h3>topFillColor（顶面）</h3>
          <input type="color" value={topFillColor}
            onChange={e => setTopFillColor(e.target.value)} />
          <span style={{ marginLeft: 8, fontFamily: 'monospace' }}>
            {topFillColor}
          </span>
          <p className="muted small">传空字符串时顶面无填充</p>
        </section>

        {/* topFillOpacity */}
        <section>
          <h3>topFillOpacity: {topFillOpacity.toFixed(2)}</h3>
          <input type="range" min={0} max={1} step={0.05}
            value={topFillOpacity}
            onChange={e => setTopFillOpacity(Number(e.target.value))}
            className="full-width" />
        </section>

        {/* sideFillColor */}
        <section>
          <h3>sideFillColor（侧面）</h3>
          <input type="color" value={sideFillColor}
            onChange={e => setSideFillColor(e.target.value)} />
          <span style={{ marginLeft: 8, fontFamily: 'monospace' }}>
            {sideFillColor}
          </span>
          <p className="muted small">传空字符串时侧面无填充</p>
        </section>

        {/* sideFillOpacity */}
        <section>
          <h3>sideFillOpacity: {sideFillOpacity.toFixed(2)}</h3>
          <input type="range" min={0} max={1} step={0.05}
            value={sideFillOpacity}
            onChange={e => setSideFillOpacity(Number(e.target.value))}
            className="full-width" />
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
            enableClicking（重建棱柱）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible}
              onChange={e => setVisible(e.target.checked)} />
            visible（show/hide）
          </label>
          <p className="muted small">
            Prism 无 enableEditing，也没有任何 stroke / dashArray 配置
          </p>
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
              setPreset('三角形');
              setAltitude(500);
              setTopFillColor('#4682b4');
              setTopFillOpacity(0.6);
              setSideFillColor('#87ceeb');
              setSideFillOpacity(0.8);
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
              setAltitude(2000);
              log('🧊 高塔 2000m');
            }}>高塔 2000m</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setAltitude(100);
              log('🧊 矮台 100m');
            }}>矮台 100m</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setTopFillColor('#ff6600');
              setSideFillColor('#ffaa66');
              log('🟠 橙色');
            }}>橙色</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setTopFillColor('');
              log('🧊 顶面无填充');
            }}>顶面无填充</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setSideFillColor('');
              log('🧊 侧面无填充');
            }}>侧面无填充</button>
          </div>
        </section>

        <section>
          <h3>事件测试</h3>
          <p className="muted small">
            事件列表（PrismEventMap = GraphEventMap 去掉编辑事件，整体 v4+）：
            click, dblclick, rightclick, rightdblclick,
            mousedown, mouseup, mouseover, mouseout, mousemove,
            remove, lineupdate
          </p>
        </section>
      </div>
    </div>
  );
}
