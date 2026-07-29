/**
 * GroundPoint 全量测试页 — 覆盖 GroundPoint.d.ts + GroundPointOptions.d.ts 全部功能。
 * GroundPoint 整体 @since 4.0（类、Options、全部事件都是 v4+）；
 * 继承 GroundOverlay，因此 GroundOverlayOptions 的字段（opacity/enableMassClear 等）也生效。
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Map, GroundPoint, useCapabilities } from 'react-bmap';
import type { Point, Size } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

/** 来自 SDK dts 示例的车辆图标 */
const CAR_URL = 'https://jsapi-demo.bj.bcebos.com/images/markers/car.png';
const IMAGE_PRESETS = [
  CAR_URL,
  'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_all.png',
  'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_9.png',
];

const DEFAULT_POINT: Point = { lng: 116.404, lat: 39.915 };
const DEFAULT_SIZE: Size = { width: 30, height: 60 };

export function GroundPointPage() {
  const caps = useCapabilities();
  const isV4 = caps.has('Map.setHeading');

  const [point, setPoint] = useState<Point>(DEFAULT_POINT);
  const [url, setUrl] = useState(CAR_URL);
  const [size, setSize] = useState<Size>(DEFAULT_SIZE);
  const [anchor, setAnchor] = useState<Size>({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState<Size>({ width: 0, height: 0 });
  const [level, setLevel] = useState<number | undefined>(14);
  const [opacity, setOpacity] = useState(1);
  const [legacyImageURL, setLegacyImageURL] = useState('');
  const [displayOnMinLevel, setDisplayOnMinLevel] = useState<number | undefined>(undefined);
  const [displayOnMaxLevel, setDisplayOnMaxLevel] = useState<number | undefined>(undefined);
  const [enableClicking, setEnableClicking] = useState(true);
  const [enableMassClear, setEnableMassClear] = useState(true);
  const [zIndex, setZIndex] = useState<number | undefined>(undefined);
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
      log(`🚗 gp.${name}${pt ? ` @ ${fmtPt(pt)}` : ''}`),
    [log],
  );

  const v4Tag = (
    <span className={`cap-tag ${isV4 ? 'ok' : 'no'}`}>
      {isV4 ? 'v4+' : 'v3 ✗'}
    </span>
  );

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={14} style={{ height: '100%' }}>
          <GroundPoint
            point={point}
            url={url}
            size={size}
            anchor={anchor}
            scale={scale}
            rotation={rotation}
            offset={offset}
            level={level}
            opacity={opacity}
            imageURL={legacyImageURL || undefined}
            displayOnMinLevel={displayOnMinLevel}
            displayOnMaxLevel={displayOnMaxLevel}
            enableClicking={enableClicking}
            enableMassClear={enableMassClear}
            zIndex={zIndex}
            visible={visible}
            onClick={onEvt('click')}
            onDoubleClick={onEvt('dblclick')}
            onRightClick={onEvt('rightclick')}
            onRightDoubleClick={onEvt('rightdblclick')}
            onMouseDown={onEvt('mousedown')}
            onMouseUp={onEvt('mouseup')}
            onMouseOver={onEvt('mouseover')}
            onMouseOut={onEvt('mouseout')}
            onMouseMove={onEvt('mousemove')}
            onRemove={onEvt('remove')}
            onLineUpdate={() => log('🚗 gp.lineupdate')}
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
            ? <div style={{ color: '#666' }}>点击/悬停贴地点触发事件</div>
            : eventLog.map((line, i) => (
              <div key={i} style={{ lineHeight: 1.6 }}>{line}</div>
            ))}
        </div>
      </div>

      <div className="test-controls">
        <h2>GroundPoint（全量）</h2>

        <section>
          <h3>能力</h3>
          <div className="cap-grid">
            <div className={`cap-cell ${caps.has('GroundPoint') ? 'ok' : 'no'}`}>
              GroundPoint
            </div>
          </div>
          <p className="muted small">
            整体 @since 4.0；v3Driver 显式返回 null，v3 上不可用。
            继承 GroundOverlay，事件沿用 GroundOverlayEventMap。
          </p>
        </section>

        {/* point */}
        <section>
          <h3>point（地理坐标，positionProp）</h3>
          <label className="checkbox-row">
            lng
            <input type="number" step={0.001} value={point.lng}
              onChange={e => setPoint(p => ({ ...p, lng: Number(e.target.value) }))} />
          </label>
          <label className="checkbox-row">
            lat
            <input type="number" step={0.001} value={point.lat}
              onChange={e => setPoint(p => ({ ...p, lat: Number(e.target.value) }))} />
          </label>
          <p className="muted small">走 setPoint()，实时更新</p>
        </section>

        {/* url */}
        <section>
          <h3>url（图标地址）{v4Tag}</h3>
          <input type="text" className="full-width" value={url}
            onChange={e => setUrl(e.target.value)} />
          <div className="btn-group" style={{ flexWrap: 'wrap', marginTop: 4 }}>
            {IMAGE_PRESETS.map((u, i) => (
              <button key={u} style={{ fontSize: 11 }}
                className={url === u ? 'active' : ''}
                onClick={() => { setUrl(u); log(`🚗 图标 ${i + 1}`); }}
              >图标 {i + 1}</button>
            ))}
          </div>
          <p className="muted small">
            走 setImage()（继承自 GroundOverlay），改地址即时生效
          </p>
        </section>

        {/* size */}
        <section>
          <h3>size（图标尺寸，px）</h3>
          <label className="checkbox-row">
            width
            <input type="number" value={size.width}
              onChange={e => setSize(s => ({ ...s, width: Number(e.target.value) }))} />
          </label>
          <label className="checkbox-row">
            height
            <input type="number" value={size.height}
              onChange={e => setSize(s => ({ ...s, height: Number(e.target.value) }))} />
          </label>
          <p className="muted small">走 setSize()；屏幕大小随缩放级别变化</p>
        </section>

        {/* anchor */}
        <section>
          <h3>anchor（锚点，左上角为原点）</h3>
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
          <p className="muted small">
            走 setAnchor()（Size 类型，与 Marker 的 number 枚举不同）
          </p>
        </section>

        {/* scale */}
        <section>
          <h3>scale: {scale.toFixed(2)}</h3>
          <input type="range" min={0.1} max={3} step={0.1} value={scale}
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
          <p className="muted small">
            走 setRotation()；GroundPoint 的 rotation=0 安全（不像 Marker 会塌缩命中区）
          </p>
        </section>

        {/* offset */}
        <section>
          <h3>offset（偏移量）</h3>
          <label className="checkbox-row">
            width
            <input type="number" value={offset.width}
              onChange={e => setOffset(o => ({ ...o, width: Number(e.target.value) }))} />
          </label>
          <label className="checkbox-row">
            height
            <input type="number" value={offset.height}
              onChange={e => setOffset(o => ({ ...o, height: Number(e.target.value) }))} />
          </label>
          <p className="muted small">走 setOffset()</p>
        </section>

        {/* level */}
        <section>
          <h3>level（尺寸参考缩放级别）{v4Tag}</h3>
          <input type="number" placeholder="默认 18"
            value={level ?? ''}
            onChange={e =>
              setLevel(e.target.value === '' ? undefined : Number(e.target.value))
            } />
          <p className="muted small">
            ctorOnlyProps（无 setter），改值会重建覆盖物。
            屏幕 size = size × 2^(zoom-level)；level 对齐 zoom 时图标为原始像素尺寸
          </p>
        </section>

        {/* opacity */}
        <section>
          <h3>opacity: {opacity.toFixed(2)}</h3>
          <input type="range" min={0} max={1} step={0.05} value={opacity}
            onChange={e => setOpacity(Number(e.target.value))}
            className="full-width" />
          <p className="muted small">继承自 GroundOverlayOptions，走 setOpacity()</p>
        </section>

        {/* imageURL（deprecated） */}
        <section>
          <h3>imageURL（已废弃）</h3>
          <input type="text" className="full-width" value={legacyImageURL}
            placeholder="留空则不使用；填入走 setImageURL()"
            onChange={e => setLegacyImageURL(e.target.value)} />
          <p className="muted small">4.0 已 deprecated，建议用 url</p>
        </section>

        {/* display levels */}
        <section>
          <h3>显示级别范围</h3>
          <label className="checkbox-row">
            displayOnMinLevel
            <input type="number" placeholder="默认 3"
              value={displayOnMinLevel ?? ''}
              onChange={e => setDisplayOnMinLevel(
                e.target.value === '' ? undefined : Number(e.target.value),
              )} />
          </label>
          <label className="checkbox-row">
            displayOnMaxLevel
            <input type="number" placeholder="默认 21"
              value={displayOnMaxLevel ?? ''}
              onChange={e => setDisplayOnMaxLevel(
                e.target.value === '' ? undefined : Number(e.target.value),
              )} />
          </label>
          <p className="muted small">继承自 GroundOverlayOptions，缩放越过范围时隐藏</p>
        </section>

        {/* 开关 */}
        <section>
          <h3>行为开关</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={enableClicking}
              onChange={e => setEnableClicking(e.target.checked)} />
            enableClicking（重建）{v4Tag}
          </label>
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

        {/* zIndex */}
        <section>
          <h3>zIndex</h3>
          <input type="number" placeholder="未设置"
            value={zIndex ?? ''}
            onChange={e =>
              setZIndex(e.target.value === '' ? undefined : Number(e.target.value))
            } />
          <p className="muted small">
            继承自 GroundOverlayOptions（setter-only，非 constructor 字段）
          </p>
        </section>

        {/* 动作 */}
        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPoint(DEFAULT_POINT);
              setUrl(CAR_URL);
              setSize(DEFAULT_SIZE);
              setAnchor({ width: 0, height: 0 });
              setScale(1);
              setRotation(0);
              setOffset({ width: 0, height: 0 });
              setLevel(14);
              setOpacity(1);
              setLegacyImageURL('');
              setDisplayOnMinLevel(undefined);
              setDisplayOnMaxLevel(undefined);
              setEnableClicking(true);
              setEnableMassClear(true);
              setZIndex(undefined);
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
              setUrl(CAR_URL);
              setSize({ width: 30, height: 60 });
              setScale(1);
              setRotation(0);
              log('🚗 车辆默认');
            }}>车辆默认</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setScale(2);
              log('🚗 放大 2×');
            }}>放大 2×</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setRotation(90);
              log('🚗 旋转 90°');
            }}>旋转 90°</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setOpacity(0.5);
              log('🚗 半透明');
            }}>半透明</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setDisplayOnMinLevel(12);
              setDisplayOnMaxLevel(16);
              log('🚗 仅 12~16 级');
            }}>仅 12~16 级</button>
          </div>
        </section>

        <section>
          <h3>事件测试</h3>
          <p className="muted small">
            事件列表（GroundOverlayEventMap，整体 v4+）：
            click, dblclick, rightclick, rightdblclick, mousedown, mouseup,
            mouseover, mouseout, mousemove, remove, lineupdate
          </p>
        </section>
      </div>
    </div>
  );
}
