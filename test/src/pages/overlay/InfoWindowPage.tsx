/**
 * InfoWindow 全量测试页 — 覆盖 InfoWindow.d.ts + InfoWindowOptions.d.ts 全部功能。
 * InfoWindow 不走 addOverlay，而是 openInfoWindow/closeInfoWindow。
 * enableMessage / message 为 @removed 4.0（仅 v3）。
 * 事件：InfoWindowEventMap（open/close/clickclose/maximize/restore/resize）。
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Map, InfoWindow, Marker, useCapabilities } from 'react-bmap';
import type { Point } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const DEFAULT_POINT: Point = { lng: 116.404, lat: 39.915 };

export function InfoWindowPage() {
  const caps = useCapabilities();
  const isV4 = caps.has('Map.setHeading');

  const [position, setPosition] = useState<Point>(DEFAULT_POINT);
  const [open, setOpen] = useState(true);
  const [content, setContent] = useState('<p style="margin:0">北京天安门</p>');
  const [title, setTitle] = useState('地标信息');
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [maxWidth, setMaxWidth] = useState<number>(730);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [enableAutoPan, setEnableAutoPan] = useState(true);
  const [enableCloseOnClick, setEnableCloseOnClick] = useState(true);
  const [enableMessage, setEnableMessage] = useState(false);
  const [message, setMessage] = useState('我在天安门');
  const [maxContent, setMaxContent] = useState('<div>详细内容区域</div>');
  const [enableMaximize, setEnableMaximize] = useState(false);
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

  const onEvt = useCallback(
    (name: string) => () => log(`🪟 iw.${name}`),
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
        <Map defaultCenter={BEIJING} defaultZoom={14} style={{ height: '100%' }}>
          <Marker position={position}>
            <InfoWindow
              open={open}
              content={content}
              title={title}
              width={width || undefined}
              height={height || undefined}
              maxWidth={maxWidth || undefined}
              offset={{ width: offsetX, height: offsetY }}
              enableAutoPan={enableAutoPan}
              enableCloseOnClick={enableCloseOnClick}
              enableMessage={enableMessage || undefined}
              message={message || undefined}
              maxContent={maxContent || undefined}
              enableMaximize={enableMaximize || undefined}
              onOpen={onEvt('open')}
              onClose={onEvt('close')}
              onClickClose={onEvt('clickclose')}
              onMaximize={onEvt('maximize')}
              onRestore={onEvt('restore')}
              onResize={onEvt('resize')}
            />
          </Marker>
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
            ? <div style={{ color: '#666' }}>打开/关闭/最大化信息窗口触发事件</div>
            : eventLog.map((line, i) => (
              <div key={i} style={{ lineHeight: 1.6 }}>{line}</div>
            ))}
        </div>
      </div>

      <div className="test-controls">
        <h2>InfoWindow（全量）</h2>

        <section>
          <h3>能力</h3>
          <div className="cap-grid">
            <div className={`cap-cell ${caps.has('InfoWindow') ? 'ok' : 'no'}`}>
              InfoWindow
            </div>
          </div>
          <p className="muted small">
            不走 addOverlay，通过 openInfoWindow/closeInfoWindow 控制。
            v4 上 map.openInfoWindow 已移除，必须嵌套在 Marker 内用 marker.openInfoWindow 打开。
            enableMessage / message 为 @removed 4.0。
          </p>
        </section>

        {/* open/close */}
        <section>
          <h3>open（受控开关）</h3>
          <div className="btn-group">
            <button className={open ? 'active' : ''}
              onClick={() => { setOpen(true); log('🪟 open → true'); }}
            >打开</button>
            <button className={!open ? 'active' : ''}
              onClick={() => { setOpen(false); log('🪟 open → false'); }}
            >关闭</button>
          </div>
        </section>

        {/* position */}
        <section>
          <h3>position（Marker 位置 = InfoWindow 锚点）</h3>
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
          <p className="muted small">
            v4 上 InfoWindow 嵌套在 Marker 内，position 同时驱动 Marker 和 InfoWindow
          </p>
        </section>

        {/* content */}
        <section>
          <h3>content（内容，支持 HTML）</h3>
          <textarea className="full-width" rows={3} value={content}
            onChange={e => setContent(e.target.value)} />
          <p className="muted small">变化时重建 InfoWindow 实例</p>
        </section>

        {/* title */}
        <section>
          <h3>title（标题，支持 HTML）</h3>
          <input type="text" className="full-width" value={title}
            onChange={e => setTitle(e.target.value)} />
        </section>

        {/* width / height / maxWidth */}
        <section>
          <h3>尺寸（0 = 自适应）</h3>
          <label className="checkbox-row">
            width (220-730)
            <input type="number" min={0} max={730} value={width}
              onChange={e => setWidth(Number(e.target.value))} />
          </label>
          <label className="checkbox-row">
            height (60-650)
            <input type="number" min={0} max={650} value={height}
              onChange={e => setHeight(Number(e.target.value))} />
          </label>
          <label className="checkbox-row">
            maxWidth (220-730)
            <input type="number" min={0} max={730} value={maxWidth}
              onChange={e => setMaxWidth(Number(e.target.value))} />
          </label>
        </section>

        {/* offset */}
        <section>
          <h3>offset（位置偏移）</h3>
          <label className="checkbox-row">
            width
            <input type="number" value={offsetX}
              onChange={e => setOffsetX(Number(e.target.value))} />
          </label>
          <label className="checkbox-row">
            height
            <input type="number" value={offsetY}
              onChange={e => setOffsetY(Number(e.target.value))} />
          </label>
        </section>

        {/* maxContent */}
        <section>
          <h3>maxContent（最大化时内容）</h3>
          <textarea className="full-width" rows={2} value={maxContent}
            onChange={e => setMaxContent(e.target.value)} />
        </section>

        {/* 开关 */}
        <section>
          <h3>行为开关</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={enableAutoPan}
              onChange={e => setEnableAutoPan(e.target.checked)} />
            enableAutoPan（打开时地图自动平移）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={enableCloseOnClick}
              onChange={e => setEnableCloseOnClick(e.target.checked)} />
            enableCloseOnClick（点击地图关闭）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={enableMaximize}
              onChange={e => setEnableMaximize(e.target.checked)} />
            enableMaximize（最大化功能）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={enableMessage}
              onChange={e => setEnableMessage(e.target.checked)} />
            enableMessage {v3OnlyTag}
          </label>
          <label className="checkbox-row">
            message
            <input type="text" value={message}
              onChange={e => setMessage(e.target.value)} />
            {v3OnlyTag}
          </label>
        </section>

        {/* 动作 */}
        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setPosition(DEFAULT_POINT);
              setOpen(true);
              setContent('<p style="margin:0">北京天安门</p>');
              setTitle('地标信息');
              setWidth(0);
              setHeight(0);
              setMaxWidth(730);
              setOffsetX(0);
              setOffsetY(0);
              setEnableAutoPan(true);
              setEnableCloseOnClick(true);
              setEnableMessage(false);
              setMessage('我在天安门');
              setMaxContent('<div>详细内容区域</div>');
              setEnableMaximize(false);
              log('🔄 reset all');
            }}>reset all</button>
          </div>
        </section>

        {/* 预设 */}
        <section>
          <h3>预设</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setWidth(400);
              setHeight(200);
              log('🪟 固定 400×200');
            }}>固定 400×200</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setWidth(0);
              setHeight(0);
              log('🪟 自适应尺寸');
            }}>自适应尺寸</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setEnableMaximize(true);
              setMaxContent('<div style="padding:20px"><h3>详细内容</h3><p>这是最大化时的完整内容</p></div>');
              log('🪟 开启最大化');
            }}>开启最大化</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setContent('<div style="padding:8px"><h4>自定义 HTML</h4><ul><li>项目一</li><li>项目二</li></ul></div>');
              log('🪟 富文本内容');
            }}>富文本内容</button>
          </div>
        </section>

        <section>
          <h3>事件测试</h3>
          <p className="muted small">
            事件列表（InfoWindowEventMap）：
            open, close, clickclose, maximize, restore, resize。
            全部为 OverlayBaseEvent（仅含 type/target/currentTarget）。
          </p>
        </section>
      </div>
    </div>
  );
}
