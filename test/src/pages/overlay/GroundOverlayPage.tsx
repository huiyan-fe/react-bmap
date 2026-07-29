/**
 * GroundOverlay 全量测试页 — 覆盖 GroundOverlay.d.ts + GroundOverlayOptions.d.ts 全部功能。
 * GroundOverlay 类本身 v3 起就有，但 url / type / top / isReDraw / drawHook / enableClicking
 * 以及除 click/dblclick/remove 之外的事件都是 @since 4.0；stretch 反过来是 @removed 4.0（仅 v3）。
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Map, GroundOverlay, useCapabilities } from 'react-bmap';
import type { Bounds } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const DEFAULT_BOUNDS: Bounds = {
  sw: { lng: 116.390, lat: 39.910 },
  ne: { lng: 116.420, lat: 39.925 },
};

/** 来自 SDK dts 示例的图片地址 */
const IMAGE_PRESETS = [
  'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_all.png',
  'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_9.png',
];

type ContentType = 'image' | 'video' | 'canvas';

/** 视频示例源（云层动画） */
const VIDEO_PRESET = 'https://jsapi-demo.bj.bcebos.com/images/layers/cloud.mov';

export function GroundOverlayPage() {
  const caps = useCapabilities();
  const isV4 = caps.has('Map.setHeading');

  const [bounds, setBounds] = useState<Bounds>(DEFAULT_BOUNDS);
  const [type, setType] = useState<ContentType>('image');
  const [imageUrl, setImageUrl] = useState(IMAGE_PRESETS[0]);
  const [videoUrl, setVideoUrl] = useState(VIDEO_PRESET);
  const [legacyImageURL, setLegacyImageURL] = useState('');
  const [opacity, setOpacity] = useState(0.8);
  const [displayOnMinLevel, setDisplayOnMinLevel] = useState<number | undefined>(undefined);
  const [displayOnMaxLevel, setDisplayOnMaxLevel] = useState<number | undefined>(undefined);
  const [top, setTop] = useState(false);
  const [stretch, setStretch] = useState(false);
  const [isReDraw, setIsReDraw] = useState(true);
  const [enableClicking, setEnableClicking] = useState(true);
  const [enableMassClear, setEnableMassClear] = useState(true);
  const [zIndex, setZIndex] = useState<number | undefined>(undefined);
  const [visible, setVisible] = useState(true);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  /** canvas 内容源：整个生命周期保持同一个元素，内容变化靠 isReDraw + drawHook 每帧重采集 */
  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    return c;
  }, []);
  const angleRef = useRef(0);

  /**
   * drawHook 走 ctorOnlyProps，stableStringify 比对的是函数源码文本，
   * 所以这里必须保持稳定引用、把可变状态放进 ref，否则闭包更新不会被 SDK 感知。
   */
  const drawHook = useCallback(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    angleRef.current += 0.03;
    // 雷达扫描效果
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grad.addColorStop(0, 'rgba(0, 200, 255, 0.65)');
    grad.addColorStop(1, 'rgba(0, 200, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 2);
    ctx.arc(w / 2, h / 2, w / 2, angleRef.current, angleRef.current + Math.PI / 3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();
  }, [canvas]);

  /** type 决定 url 传什么：图片/视频传地址，canvas 直接传元素 */
  const url = type === 'canvas' ? canvas : type === 'video' ? videoUrl : imageUrl;
  /** url 为空时不渲染：SDK 在 addOverlay 阶段会因取不到内容而抛错 */
  const hasContent = type === 'canvas' || !!url || !!legacyImageURL;

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
      log(`🗺 ground.${name}${pt ? ` @ ${fmtPt(pt)}` : ''}`),
    [log],
  );

  const setCorner = (corner: 'sw' | 'ne', key: 'lng' | 'lat', v: number) =>
    setBounds(b => ({ ...b, [corner]: { ...b[corner], [key]: v } }));

  const v4Tag = (
    <span className={`cap-tag ${isV4 ? 'ok' : 'no'}`}>
      {isV4 ? 'v4+' : 'v3 ✗'}
    </span>
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
          {hasContent && <GroundOverlay
            bounds={bounds}
            url={url}
            imageURL={legacyImageURL || undefined}
            type={type}
            opacity={opacity}
            displayOnMinLevel={displayOnMinLevel}
            displayOnMaxLevel={displayOnMaxLevel}
            top={top}
            stretch={stretch}
            isReDraw={type === 'canvas' ? isReDraw : undefined}
            drawHook={type === 'canvas' ? drawHook : undefined}
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
            onLineUpdate={() => log('🗺 ground.lineupdate')}
          />}
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
            ? <div style={{ color: '#666' }}>与叠加层交互触发事件</div>
            : eventLog.map((line, i) => (
              <div key={i} style={{ lineHeight: 1.6 }}>{line}</div>
            ))}
        </div>
      </div>

      <div className="test-controls">
        <h2>GroundOverlay（全量）</h2>

        <section>
          <h3>能力</h3>
          <div className="cap-grid">
            <div className={`cap-cell ${caps.has('GroundOverlay') ? 'ok' : 'no'}`}>
              GroundOverlay
            </div>
          </div>
          <p className="muted small">
            类本身 v3 起就有；url/type/top/isReDraw/drawHook/enableClicking 及
            除 click/dblclick/remove 外的事件均 v4+
          </p>
        </section>

        {/* type */}
        <section>
          <h3>type（内容类型）{v4Tag}</h3>
          <div className="btn-group">
            {(['image', 'video', 'canvas'] as const).map(t => (
              <button key={t}
                className={type === t ? 'active' : ''}
                onClick={() => { setType(t); log(`🗺 type → ${t}`); }}
              >{t}</button>
            ))}
          </div>
          <p className="muted small">ctorOnlyProps，切换时重建叠加层</p>
        </section>

        {/* url */}
        <section>
          <h3>url（内容来源）{v4Tag}</h3>
          {type === 'image' && (
            <>
              <input type="text" className="full-width" value={imageUrl}
                onChange={e => setImageUrl(e.target.value)} />
              <div className="btn-group" style={{ flexWrap: 'wrap', marginTop: 4 }}>
                {IMAGE_PRESETS.map((u, i) => (
                  <button key={u} style={{ fontSize: 11 }}
                    className={imageUrl === u ? 'active' : ''}
                    onClick={() => { setImageUrl(u); log(`🗺 图片 ${i + 1}`); }}
                  >图片 {i + 1}</button>
                ))}
              </div>
              <p className="muted small">走 setImage()，改地址即时生效</p>
            </>
          )}
          {type === 'video' && (
            <>
              <input type="text" className="full-width" value={videoUrl}
                placeholder="填入可跨域访问的视频地址"
                onChange={e => setVideoUrl(e.target.value)} />
              <div className="btn-group" style={{ flexWrap: 'wrap', marginTop: 4 }}>
                <button style={{ fontSize: 11 }}
                  onClick={() => { setVideoUrl(VIDEO_PRESET); log('🗺 video → cloud.mov'); }}
                >云层示例</button>
              </div>
              <p className="muted small">
                改地址走 setImage()（SDK 没有单独的 setVideo）
                {!videoUrl && '；当前为空，叠加层未渲染'}
              </p>
            </>
          )}
          {type === 'canvas' && (
            <p className="muted small">
              直接传 canvas 元素（256×256，雷达扫描动画）。
              canvas 场景保持同一元素引用，内容更新靠 isReDraw + drawHook。
            </p>
          )}
        </section>

        {/* imageURL（deprecated） */}
        <section>
          <h3>imageURL（已废弃）</h3>
          <input type="text" className="full-width" value={legacyImageURL}
            placeholder="留空则不使用；填入走 setImageURL()"
            onChange={e => setLegacyImageURL(e.target.value)} />
          <p className="muted small">
            4.0 已 deprecated，建议用 url；v3 上只有这条路可用
          </p>
        </section>

        {/* bounds */}
        <section>
          <h3>bounds（西南角 / 东北角）</h3>
          <label className="checkbox-row">
            sw.lng
            <input type="number" step={0.001} value={bounds.sw.lng}
              onChange={e => setCorner('sw', 'lng', Number(e.target.value))} />
          </label>
          <label className="checkbox-row">
            sw.lat
            <input type="number" step={0.001} value={bounds.sw.lat}
              onChange={e => setCorner('sw', 'lat', Number(e.target.value))} />
          </label>
          <label className="checkbox-row">
            ne.lng
            <input type="number" step={0.001} value={bounds.ne.lng}
              onChange={e => setCorner('ne', 'lng', Number(e.target.value))} />
          </label>
          <label className="checkbox-row">
            ne.lat
            <input type="number" step={0.001} value={bounds.ne.lat}
              onChange={e => setCorner('ne', 'lat', Number(e.target.value))} />
          </label>
          <div className="btn-group" style={{ flexWrap: 'wrap', marginTop: 4 }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setBounds(b => ({
                sw: { lng: b.sw.lng - 0.005, lat: b.sw.lat - 0.003 },
                ne: { lng: b.ne.lng + 0.005, lat: b.ne.lat + 0.003 },
              }));
              log('🗺 放大范围');
            }}>放大范围</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setBounds(b => ({
                sw: { lng: b.sw.lng + 0.005, lat: b.sw.lat + 0.003 },
                ne: { lng: b.ne.lng - 0.005, lat: b.ne.lat - 0.003 },
              }));
              log('🗺 缩小范围');
            }}>缩小范围</button>
          </div>
        </section>

        {/* opacity */}
        <section>
          <h3>opacity: {opacity.toFixed(2)}</h3>
          <input type="range" min={0} max={1} step={0.05} value={opacity}
            onChange={e => setOpacity(Number(e.target.value))}
            className="full-width" />
        </section>

        {/* display levels */}
        <section>
          <h3>显示级别范围</h3>
          <label className="checkbox-row">
            displayOnMinLevel
            <input type="number" placeholder={isV4 ? '默认 3' : '默认 1'}
              value={displayOnMinLevel ?? ''}
              onChange={e => setDisplayOnMinLevel(
                e.target.value === '' ? undefined : Number(e.target.value),
              )} />
          </label>
          <label className="checkbox-row">
            displayOnMaxLevel
            <input type="number" placeholder={isV4 ? '默认 21' : '默认 19'}
              value={displayOnMaxLevel ?? ''}
              onChange={e => setDisplayOnMaxLevel(
                e.target.value === '' ? undefined : Number(e.target.value),
              )} />
          </label>
          <p className="muted small">缩放地图越过范围时叠加层会隐藏</p>
        </section>

        {/* 开关 */}
        <section>
          <h3>行为开关</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={top}
              onChange={e => setTop(e.target.checked)} />
            top（绘制在普通覆盖物之上，重建）{v4Tag}
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={isReDraw}
              disabled={type !== 'canvas'}
              onChange={e => setIsReDraw(e.target.checked)} />
            isReDraw（canvas 循环重绘，重建）{v4Tag}
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={stretch}
              onChange={e => setStretch(e.target.checked)} />
            stretch（拉伸填满，重建）{v3OnlyTag}
          </label>
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
            SDK 的 GroundOverlayOptions 没有此字段，只能通过 setZIndex() 设置；
            v4 想始终压在普通覆盖物之上请用 top
          </p>
        </section>

        {/* 动作 */}
        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setBounds(DEFAULT_BOUNDS);
              setType('image');
              setImageUrl(IMAGE_PRESETS[0]);
              setVideoUrl('');
              setLegacyImageURL('');
              setOpacity(0.8);
              setDisplayOnMinLevel(undefined);
              setDisplayOnMaxLevel(undefined);
              setTop(false);
              setStretch(false);
              setIsReDraw(true);
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
              setType('canvas');
              setIsReDraw(true);
              setOpacity(1);
              log('🗺 canvas 雷达动画');
            }}>canvas 雷达动画</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setType('canvas');
              setIsReDraw(false);
              log('🗺 canvas 静态贴图');
            }}>canvas 静态贴图</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setOpacity(0.3);
              log('🗺 半透明');
            }}>半透明</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setDisplayOnMinLevel(15);
              setDisplayOnMaxLevel(18);
              log('🗺 仅 15~18 级显示');
            }}>仅 15~18 级</button>
          </div>
        </section>

        <section>
          <h3>事件测试</h3>
          <p className="muted small">
            事件列表（GroundOverlayEventMap）：click, dblclick, remove 为 v3+；
            rightclick, rightdblclick, mousedown, mouseup, mouseover, mouseout,
            mousemove, lineupdate 为 v4+
          </p>
        </section>
      </div>
    </div>
  );
}
