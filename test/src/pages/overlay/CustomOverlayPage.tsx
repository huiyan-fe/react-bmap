/**
 * CustomOverlay 全量测试页 — 覆盖 CustomOverlay.d.ts + CustomOverlayOptions.d.ts 全部功能。
 * CustomOverlay @since 4.0，通过 React children 控制 DOM 内容。
 * 事件：CustomOverlayEventMap（click / mouseover / mouseout）。
 * Setter：setPoint / setRotation / setRotationOrigin / setProperties。
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Map, CustomOverlay, useCapabilities } from 'react-bmap';
import type { Point } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const DEFAULT_POINT: Point = { lng: 116.404, lat: 39.915 };

const COLOR_PRESETS = ['#1890ff', '#52c41a', '#fa937e', '#722ed1', '#ff4d4f'];

export function CustomOverlayPage() {
  const caps = useCapabilities();
  const isV4 = caps.has('Map.setHeading');

  const [point, setPoint] = useState<Point>(DEFAULT_POINT);
  const [rotation, setRotation] = useState(0);
  const [rotationInit, setRotationInit] = useState(0);
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [label, setLabel] = useState('自定义覆盖物');
  const [anchorsX, setAnchorsX] = useState(0.5);
  const [anchorsY, setAnchorsY] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [minZoom, setMinZoom] = useState<number | undefined>(undefined);
  const [maxZoom, setMaxZoom] = useState<number | undefined>(undefined);
  const [fixBottom, setFixBottom] = useState(false);
  const [useTranslate, setUseTranslate] = useState(false);
  const [autoFollow, setAutoFollow] = useState(false);
  const [enableMassClear, setEnableMassClear] = useState(true);
  const [enableDraggingMap, setEnableDraggingMap] = useState(false);
  const [zIndex, setZIndex] = useState<number | undefined>(undefined);
  const [visible, setVisible] = useState(true);
  const [properties, setProperties] = useState('{"id":1}');
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
      log(`🎯 co.${name}${pt ? ` @ ${fmtPt(pt)}` : ''} props=${properties}`),
    [log, properties],
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
          {isV4 && <CustomOverlay
            point={point}
            anchors={[anchorsX, anchorsY]}
            offsetX={offsetX}
            offsetY={offsetY}
            rotation={rotation}
            rotationInit={rotationInit}
            minZoom={minZoom}
            maxZoom={maxZoom}
            properties={properties}
            fixBottom={fixBottom}
            useTranslate={useTranslate}
            autoFollowHeadingChanged={autoFollow}
            enableMassClear={enableMassClear}
            enableDraggingMap={enableDraggingMap}
            zIndex={zIndex}
            visible={visible}
            onClick={onEvt('click')}
            onMouseOver={onEvt('mouseover')}
            onMouseOut={onEvt('mouseout')}
          >
            <div style={{
              padding: '4px 12px',
              borderRadius: 4,
              fontSize: 13,
              color: '#fff',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              transition: 'all 0.2s',
              cursor: 'pointer',
              background: color,
            }}>
              {label}
            </div>
          </CustomOverlay>}
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
            ? <div style={{ color: '#666' }}>点击/悬停自定义覆盖物触发事件</div>
            : eventLog.map((line, i) => (
              <div key={i} style={{ lineHeight: 1.6 }}>{line}</div>
            ))}
        </div>
      </div>

      <div className="test-controls">
        <h2>CustomOverlay（全量）</h2>

        <section>
          <h3>能力 {v4Tag}</h3>
          <p className="muted small">
            @since 4.0。通过 React children 完全控制 DOM 内容。
            v3 上不可用。
          </p>
        </section>

        {/* children 预览 */}
        <section>
          <h3>children（DOM 内容）</h3>
          <label className="checkbox-row">
            label
            <input type="text" value={label}
              onChange={e => setLabel(e.target.value)} />
          </label>
          <div className="btn-group" style={{ flexWrap: 'wrap', marginTop: 4 }}>
            {COLOR_PRESETS.map(c => (
              <button key={c} style={{
                fontSize: 10, background: c,
                color: '#fff',
              }}
                className={color === c ? 'active' : ''}
                onClick={() => setColor(c)}
              >{c}</button>
            ))}
          </div>
          <p className="muted small">children 渲染进覆盖物 DOM；改 label/color 走 React 更新，不重建覆盖物</p>
        </section>

        {/* point */}
        <section>
          <h3>point（位置）</h3>
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
          <p className="muted small">走 setPoint()</p>
        </section>

        {/* rotation */}
        <section>
          <h3>rotation: {rotation}°</h3>
          <input type="range" min={0} max={360} step={1} value={rotation}
            onChange={e => setRotation(Number(e.target.value))}
            className="full-width" />
          <p className="muted small">走 setRotation()</p>
        </section>

        {/* rotationInit */}
        <section>
          <h3>rotationInit: {rotationInit}°</h3>
          <input type="range" min={0} max={360} step={1} value={rotationInit}
            onChange={e => setRotationInit(Number(e.target.value))}
            className="full-width" />
          <p className="muted small">走 setRotationOrigin()；最终角度 = rotationOrigin + 地图朝向</p>
        </section>

        {/* anchors */}
        <section>
          <h3>anchors [x, y]（0-1）</h3>
          <label className="checkbox-row">
            x
            <input type="number" min={0} max={1} step={0.1} value={anchorsX}
              onChange={e => setAnchorsX(Number(e.target.value))} />
          </label>
          <label className="checkbox-row">
            y
            <input type="number" min={0} max={1} step={0.1} value={anchorsY}
              onChange={e => setAnchorsY(Number(e.target.value))} />
          </label>
          <p className="muted small">ctorOnlyProps；[0.5, 1] = 底边中心 @default [0.5, 1]</p>
        </section>

        {/* offset */}
        <section>
          <h3>offset（像素偏移）</h3>
          <label className="checkbox-row">
            offsetX
            <input type="number" value={offsetX}
              onChange={e => setOffsetX(Number(e.target.value))} />
          </label>
          <label className="checkbox-row">
            offsetY
            <input type="number" value={offsetY}
              onChange={e => setOffsetY(Number(e.target.value))} />
          </label>
          <p className="muted small">ctorOnlyProps @default 0</p>
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
          <p className="muted small">ctorOnlyProps；缩放地图越过范围时隐藏</p>
        </section>

        {/* properties */}
        <section>
          <h3>properties（自定义属性）</h3>
          <input type="text" className="full-width" value={properties}
            onChange={e => setProperties(e.target.value)} />
          <p className="muted small">走 setProperties()；SDK 类型为 any</p>
        </section>

        {/* zIndex */}
        <section>
          <h3>zIndex</h3>
          <input type="number" placeholder="未设置" value={zIndex ?? ''}
            onChange={e => setZIndex(e.target.value === '' ? undefined : Number(e.target.value))} />
        </section>

        {/* 开关 */}
        <section>
          <h3>行为开关</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={fixBottom}
              onChange={e => setFixBottom(e.target.checked)} />
            fixBottom（DOM 固定底部，重建）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={useTranslate}
              onChange={e => setUseTranslate(e.target.checked)} />
            useTranslate（translate3d 优化，重建）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={autoFollow}
              onChange={e => setAutoFollow(e.target.checked)} />
            autoFollowHeadingChanged（随地图旋转，重建）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={enableMassClear}
              onChange={e => setEnableMassClear(e.target.checked)} />
            enableMassClear
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={enableDraggingMap}
              onChange={e => setEnableDraggingMap(e.target.checked)} />
            enableDraggingMap（覆盖物上允许拖拽地图，重建）
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
              setPoint(DEFAULT_POINT);
              setRotation(0);
              setRotationInit(0);
              setColor(COLOR_PRESETS[0]);
              setLabel('自定义覆盖物');
              setAnchorsX(0.5);
              setAnchorsY(1);
              setOffsetX(0);
              setOffsetY(0);
              setMinZoom(undefined);
              setMaxZoom(undefined);
              setFixBottom(false);
              setUseTranslate(false);
              setAutoFollow(false);
              setEnableMassClear(true);
              setEnableDraggingMap(false);
              setZIndex(undefined);
              setVisible(true);
              setProperties('{"id":1}');
              log('🔄 reset all');
            }}>reset all</button>
          </div>
        </section>

        {/* 预设 */}
        <section>
          <h3>预设</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setColor('#1890ff');
              setLabel('蓝色标签');
              setRotation(0);
              log('🎯 蓝色标签');
            }}>蓝色标签</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setColor('#52c41a');
              setLabel('绿色标签');
              setRotation(-15);
              log('🎯 旋转绿色标签');
            }}>旋转标签</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setMinZoom(12);
              setMaxZoom(16);
              log('🎯 仅 12~16 级显示');
            }}>仅 12~16 级</button>
          </div>
        </section>

        <section>
          <h3>事件测试</h3>
          <p className="muted small">
            事件列表（CustomOverlayEventMap）：
            click, mouseover, mouseout
          </p>
        </section>
      </div>
    </div>
  );
}
