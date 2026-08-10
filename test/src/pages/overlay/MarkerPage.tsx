/**
 * Marker 全量测试页 — 覆盖 dts src/overlay/Marker.d.ts 的全部方法/属性/事件。
 *
 * 覆盖项：
 * 1. 构造选项：position / rotation / title / enableDragging / enableMassClear / enableClicking / offset / zIndex
 * 2. Icon：默认 / 自定义 URL / SVG dataURL / CSS Sprites（imageOffset + imageSize + anchor）
 * 3. Anchor（v4）：BMAP_ANCHOR_* 枚举
 * 4. Label：附加文本标注
 * 5. 事件：click / dblclick / mousedown / mouseup / mouseover / mouseout / dragstart / dragging / dragend / remove
 * 6. 拖拽交互：enableDragging + onDragEnd 回调同步 position
 * 7. Animation（v3 @removed 4.0）：BMAP_ANIMATION_DROP / BMAP_ANIMATION_BOUNCE
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Map, Marker, Label, InfoWindow, ContextMenu, MenuItem, PlaceDetail,
  useMapEvent, useMapContext, useOverlayTarget, useCapabilities,
  type PlainIcon,
  BMAP_ANCHOR_TOP_LEFT, BMAP_ANCHOR_TOP_RIGHT, BMAP_ANCHOR_BOTTOM_LEFT,
  BMAP_ANCHOR_BOTTOM_RIGHT, BMAP_ANCHOR_TOP_CENTER, BMAP_ANCHOR_BOTTOM_CENTER,
  BMAP_ANCHOR_CENTER,
  BMAP_ANIMATION_DROP, BMAP_ANIMATION_BOUNCE,
} from 'react-bmap';
import type { Point, MapRef } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const ICON_URL = 'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_1.png';
const ICON_SPRITE = 'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_all.png';
const SVG_CIRCLE = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">' +
  '<circle cx="16" cy="16" r="14" fill="#2563eb" stroke="#fff" stroke-width="2"/></svg>'
);

const ANCHORS = [
  { val: undefined, label: '默认' },
  { val: BMAP_ANCHOR_TOP_LEFT, label: 'TOP_LEFT' },
  { val: BMAP_ANCHOR_TOP_RIGHT, label: 'TOP_RIGHT' },
  { val: BMAP_ANCHOR_TOP_CENTER, label: 'TOP_CENTER (v4)' },
  { val: BMAP_ANCHOR_BOTTOM_LEFT, label: 'BOTTOM_LEFT' },
  { val: BMAP_ANCHOR_BOTTOM_RIGHT, label: 'BOTTOM_RIGHT' },
  { val: BMAP_ANCHOR_BOTTOM_CENTER, label: 'BOTTOM_CENTER (v4)' },
  { val: BMAP_ANCHOR_CENTER, label: 'CENTER (v4)' },
];

const ICON_MODES = ['默认', '自定义URL', 'SVG', 'CSS Sprites'] as const;

export function MarkerPage() {
  const caps = useCapabilities();
  const [position, setPosition] = useState<Point>(BEIJING);
  const [rotation, setRotation] = useState(0);
  const [title, setTitle] = useState('天安门');
  const [draggable, setDraggable] = useState(true);
  const [massClear, setMassClear] = useState(true);
  const [clicking, setClicking] = useState(true);
  const [zIndex, setZIndex] = useState<number | undefined>(undefined);
  const [anchor, setAnchor] = useState<number | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>(undefined);
  const [rank, setRank] = useState<number | undefined>(undefined);
  const [iconMode, setIconMode] = useState<typeof ICON_MODES[number]>('默认');
  const [showLabel, setShowLabel] = useState(false);
  const [labelText, setLabelText] = useState('标注文字');
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [raiseOnDrag, setRaiseOnDrag] = useState(false);
  const [draggingCursor, setDraggingCursor] = useState<string>('');
  const [visible, setVisible] = useState(true);
  const [enableCollisionDetection, setEnableCollisionDetection] = useState(false);
  const [collisionTest, setCollisionTest] = useState(false);
  const [showPlaceDetail, setShowPlaceDetail] = useState(false);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [iwNonce, setIwNonce] = useState(0);
  const [mapRef, setMapRef] = useState<MapRef | null>(null);
  const [markerCount, setMarkerCount] = useState(0);
  const rawMarkerRef = useRef<any>(null);
  const rawMapRef = useRef<any>(null);

  // Map 级事件订阅开关
  const [mapEvents, setMapEvents] = useState<Record<string, boolean>>({
    click: true, addoverlay: true, removeoverlay: true,
  });
  const toggleMapEvent = (evt: string) => setMapEvents(s => ({ ...s, [evt]: !s[evt] }));
  const [contextMenuOpen, setContextMenuOpen] = useState(false);

  // 每次日志更新后滚到顶部，确保最新条目可见
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = 0; }, [eventLog]);

  const log = useCallback((msg: string) => {
    setEventLog(s => [`${new Date().toLocaleTimeString()} ${msg}`, ...s].slice(0, 20));
  }, []);

  const enabledMapEvents = useMemo(
    () => Object.entries(mapEvents).filter(([, v]) => v).map(([k]) => k),
    [mapEvents],
  );

  // Icon 构建 — plain object 即可，driver 的 toRawIcon 会自动转成 SDK.Icon 实例
  const iconProps = useMemo<{ icon?: PlainIcon }>(() => {
    switch (iconMode) {
      case '自定义URL':
        return { icon: { url: ICON_URL, size: { width: 30, height: 30 }, imageSize: { width: 30, height: 30 } } };
      case 'SVG':
        return { icon: { url: SVG_CIRCLE, size: { width: 32, height: 32 }, imageSize: { width: 32, height: 32 } } };
      case 'CSS Sprites':
        return { icon: { url: ICON_SPRITE, size: { width: 30, height: 30 },
          imageOffset: { width: 60, height: 0 }, imageSize: { width: 300, height: 300 }, anchor: { width: 15, height: 30 } } };
      default:
        return {};
    }
  }, [iconMode]);

  // Marker 事件回调 — 用 useCallback 保持引用稳定，避免 Marker memo 失效导致不必要重渲染
  const formatPt = (pt: { lng: number; lat: number } | null | undefined) =>
    pt ? `${pt.lng?.toFixed(4)},${pt.lat?.toFixed(4)}` : '';
  const handleDragEnd = useCallback((pt: any) => {
    if (pt) setPosition({ lng: pt.lng, lat: pt.lat });
    log(`🟢 marker.dragend @ ${formatPt(pt)}`);
  }, [log]);
  const handleClick = useCallback((pt: any) => log(`🟢 marker.click @ ${formatPt(pt)}`), [log]);
  const handleDoubleClick = useCallback(() => log('🟢 marker.dblclick'), [log]);
  const handleRightClick = useCallback((pt: any) => log(`🟢 marker.rightclick @ ${formatPt(pt)}`), [log]);
  const handleDragStart = useCallback((pt: any) => log(`🟢 marker.dragstart @ ${formatPt(pt)}`), [log]);
  const handleDragging = useCallback((pt: any) => log(`🟢 marker.dragging @ ${formatPt(pt)}`), [log]);
  const handleMouseOver = useCallback(() => log('🟢 marker.mouseover'), [log]);
  const handleMouseOut = useCallback(() => log('🟢 marker.mouseout'), [log]);
  const handleMouseDown = useCallback(() => log('🟢 marker.mousedown'), [log]);
  const handleMouseUp = useCallback(() => log('🟢 marker.mouseup'), [log]);
  const handleRemove = useCallback(() => log('🟢 marker.remove'), [log]);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map ref={setMapRef} defaultCenter={BEIJING} defaultZoom={13} style={{ height: '100%' }}>
          {/* Map 级 Marker 相关事件探针（必须在 MapContext 内） */}
          <MapMarkerEventProbe enabledEvents={enabledMapEvents} onLog={log} />

          <Marker
            position={position}
            rotation={rotation}
            title={title}
            enableDragging={draggable}
            enableMassClear={massClear}
            enableClicking={clicking}
            visible={visible}
            raiseOnDrag={raiseOnDrag}
            draggingCursor={draggingCursor || undefined}
            enableCollisionDetection={enableCollisionDetection}
            zIndex={zIndex}
            anchor={anchor as any}
            color={color}
            rank={rank}
            offset={offsetX || offsetY ? { width: offsetX, height: offsetY } : undefined}
            {...iconProps}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onRightClick={handleRightClick}
            onDragStart={handleDragStart}
            onDragging={handleDragging}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onRemove={handleRemove}
          >
            {/* 暴露 raw Marker 实例给 v3-only 按钮调用 */}
            <MarkerActionProbe onReady={(m, rawMap) => { rawMarkerRef.current = m; rawMapRef.current = rawMap; }} />
            {showLabel && (
              <Label content={labelText} position={position} offset={{ width: 20, height: -10 }} />
            )}
            {showInfoWindow && (
              <InfoWindow
                open={true}
                content={`<div style="padding:8px"><b>${title}</b><br/>${position.lng.toFixed(4)}, ${position.lat.toFixed(4)}</div>`}
                title={title}
                enableAutoPan
                enableCloseOnClick
                onClose={() => { setShowInfoWindow(false); log('🪟 InfoWindow closed by SDK'); }}
              />
            )}
            {contextMenuOpen && (
              <ContextMenu>
                <MenuItem text="放大一级" callback={() => log('📎 SDK 菜单：放大')} />
                <MenuItem text="缩小一级" callback={() => log('📎 SDK 菜单：缩小')} />
                <MenuItem text="重置位置" callback={() => { setPosition(BEIJING); log('📎 SDK 菜单：重置'); }} />
              </ContextMenu>
            )}
            {showPlaceDetail && (
              <PlaceDetail uid="06d2dffda107b0ef89f15db6" open={true} />
            )}
          </Marker>
          {/* 碰撞检测测试：3 个相近 marker，rank 越小优先级越高 */}
          {collisionTest && [
            { rank: 0, color: '#ff0000', label: 'rank=0(红)', offset: 0.0005 },
            { rank: 1, color: '#00bb00', label: 'rank=1(绿)', offset: 0.0007 },
            { rank: 2, color: '#0066ff', label: 'rank=2(蓝)', offset: 0.0009 },
          ].map((m) => (
            <Marker
              key={`collision-${m.rank}`}
              position={{ lng: BEIJING.lng + m.offset, lat: BEIJING.lat + m.offset }}
              enableCollisionDetection
              rank={m.rank}
              color={m.color}
              title={m.label}
            />
          ))}
          {/* 临时 markers（Map 级 addOverlay 测试） */}
          {Array.from({ length: markerCount }, (_, i) => (
            <Marker key={`temp-${i}`} position={{ lng: position.lng + (i + 1) * 0.005, lat: position.lat + (i + 1) * 0.003 }} title={`临时 #${i + 1}`} />
          ))}
        </Map>
        {/* 事件日志浮层 — 地图左下角 */}
        <div ref={logRef} style={{
          position: 'absolute', left: 8, bottom: 50, maxWidth: 340, maxHeight: 220,
          background: 'rgba(0,0,0,0.75)', color: '#0f0', borderRadius: 6,
          padding: '8px 8px 14px 8px',
          fontSize: 11, fontFamily: 'monospace', overflowY: 'auto', zIndex: 10,
          border: '1px solid rgba(255,255,255,0.15)',
          scrollbarWidth: 'thin',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 4 }}>
            <span>事件日志（{eventLog.length}）</span>
            <button onClick={() => setEventLog([])} style={{ background: 'transparent', border: '1px solid #555', color: '#aaa', cursor: 'pointer', fontSize: 10, borderRadius: 3, padding: '0 6px' }}>清空</button>
          </div>
          {eventLog.length === 0 ? (
            <div style={{ color: '#666' }}>与 marker 交互触发事件</div>
          ) : eventLog.map((line, i) => <div key={i} style={{ lineHeight: 1.6 }}>{line}</div>)}
        </div>
      </div>

      <div className="test-controls">
        <h2>Marker（全量）</h2>

        {/* ─── 能力 ─── */}
        <section>
          <h3>能力</h3>
          <div className="cap-grid">
            <div className={`cap-cell ${caps.has('Marker') ? 'ok' : 'no'}`}>Marker</div>
            <div className={`cap-cell ${caps.has('Map.setMapStyle') ? 'ok' : 'no'}`}>3.0 (shadow/animation)</div>
          </div>
        </section>

        {/* ─── Position ─── */}
        <section>
          <h3>position</h3>
          <div className="input-row">
            <label>lng</label>
            <input type="number" step={0.001} value={position.lng} onChange={e => setPosition(p => ({ ...p, lng: Number(e.target.value) }))} />
            <label>lat</label>
            <input type="number" step={0.001} value={position.lat} onChange={e => setPosition(p => ({ ...p, lat: Number(e.target.value) }))} />
          </div>
          <div className="btn-group">
            <button onClick={() => setPosition({ lng: 116.404, lat: 39.915 })}>天安门</button>
            <button onClick={() => setPosition({ lng: 116.415, lat: 39.910 })}>故宫</button>
            <button onClick={() => setPosition({ lng: 116.397, lat: 39.913 })}>中山公园</button>
          </div>
        </section>

        {/* ─── Rotation ─── */}
        <section>
          <h3>rotation: {rotation}°</h3>
          <input type="range" min={0} max={360} value={rotation} onChange={e => setRotation(Number(e.target.value))} className="full-width" />
          <div className="btn-group">
            <button onClick={() => setRotation(0)}>0°</button>
            <button onClick={() => setRotation(90)}>90°</button>
            <button onClick={() => setRotation(180)}>180°</button>
            <button onClick={() => setRotation(270)}>270°</button>
          </div>
        </section>

        {/* ─── Title ─── */}
        <section>
          <h3>title（鼠标悬停显示）</h3>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="full-width" />
        </section>

        {/* ─── 开关 ─── */}
        <section>
          <h3>行为开关</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={draggable} onChange={e => setDraggable(e.target.checked)} />
            enableDragging（拖拽 marker 看 position 变化）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={massClear} onChange={e => setMassClear(e.target.checked)} />
            enableMassClear
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={clicking} onChange={e => setClicking(e.target.checked)} />
            enableClicking
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            visible（show/hide）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={raiseOnDrag} onChange={e => setRaiseOnDrag(e.target.checked)} />
            raiseOnDrag（拖拽时标注离开地图表面，仅3.0生效）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={enableCollisionDetection} onChange={e => setEnableCollisionDetection(e.target.checked)} />
            enableCollisionDetection
          </label>
          <label className="checkbox-row">
            draggingCursor（拖拽光标样式，仅3.0）
            <input type="text" value={draggingCursor} onChange={e => setDraggingCursor(e.target.value)} placeholder="如: move, grabbing" style={{ width: 120, marginLeft: 8 }} />
          </label>
        </section>

        {/* ─── ZIndex ─── */}
        <section>
          <h3>zIndex</h3>
          <input type="number" placeholder="未设置" value={zIndex ?? ''} onChange={e => setZIndex(e.target.value === '' ? undefined : Number(e.target.value))} />
        </section>

        {/* ─── v4 视觉属性 ─── */}
        <section>
          <h3>v4+ 视觉属性 <span className={`cap-tag ${caps.has('Map.setHeading') ? 'ok' : 'no'}`}>{caps.has('Map.setHeading') ? 'v4+' : 'v3 ✗'}</span></h3>
          <div className="input-row">
            <label>color</label>
            <input type="text" placeholder="如 #ff0000" value={color ?? ''} onChange={e => setColor(e.target.value || undefined)} />
            <input type="color" value={color ?? '#ff0000'} onChange={e => setColor(e.target.value)} style={{ width: 40, padding: 0 }} />
          </div>
          <div className="input-row" style={{ marginTop: 8 }}>
            <label>rank（碰撞优先级）</label>
            <input type="number" placeholder="未设置" value={rank ?? ''} onChange={e => setRank(e.target.value === '' ? undefined : Number(e.target.value))} style={{ width: 80 }} />
            <button onClick={() => setRank(undefined)}>清除</button>
          </div>
        </section>

        {/* ─── 碰撞检测测试 ─── */}
        <section>
          <h3>碰撞检测测试 <span className={`cap-tag ${caps.has('Map.setHeading') ? 'ok' : 'no'}`}>{caps.has('Map.setHeading') ? 'v4+' : 'v3 ✗'}</span></h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={collisionTest} onChange={e => {
              const v = e.target.checked;
              setCollisionTest(v);
              if (v) setEnableCollisionDetection(true);
            }} />
            显示 3 个重叠 marker（rank=0红 / rank=1绿 / rank=2蓝）
          </label>
          <p className="muted small">
            框架层面实现了碰撞检测：缩小地图让 marker 重叠时，rank 值大的被隐藏，小的优先显示。
          </p>
        </section>

        {/* ─── Offset ─── */}
        <section>
          <h3>offset（像素偏移）</h3>
          <div className="input-row">
            <label>X</label>
            <input type="number" value={offsetX} onChange={e => setOffsetX(Number(e.target.value))} />
            <label>Y</label>
            <input type="number" value={offsetY} onChange={e => setOffsetY(Number(e.target.value))} />
          </div>
        </section>

        {/* ─── Anchor ─── */}
        <section>
          <h3>anchor <span className={`cap-tag ${caps.has('Map.setHeading') ? 'ok' : 'no'}`}>{caps.has('Map.setHeading') ? 'v4+' : 'v3 ✗'}</span></h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {ANCHORS.map(a => (
              <button key={a.label} className={anchor === a.val ? 'active' : ''} onClick={() => setAnchor(a.val)} style={{ fontSize: 11 }}>
                {a.label}
              </button>
            ))}
          </div>
        </section>

        {/* ─── Icon ─── */}
        <section>
          <h3>Icon 模式</h3>
          <div className="btn-group">
            {ICON_MODES.map(m => (
              <button key={m} className={iconMode === m ? 'active' : ''} onClick={() => setIconMode(m)}>{m}</button>
            ))}
          </div>
          <p className="muted small">
            • 默认：红色水滴标注<br />
            • 自定义URL：远程图片<br />
            • SVG：SVG dataURL 矢量图标<br />
            • CSS Sprites：九宫格切图（imageOffset + imageSize + anchor）
          </p>
        </section>

        {/* ─── Label ─── */}
        <section>
          <h3>Label（附加文本标注）</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={showLabel} onChange={e => setShowLabel(e.target.checked)} />
            显示 Label
          </label>
          {showLabel && (
            <input type="text" value={labelText} onChange={e => setLabelText(e.target.value)} className="full-width" placeholder="Label 文字" />
          )}
        </section>

        {/* ─── Map 级事件开关 ─── */}
        <section>
          <h3>🗺️ Map 级事件订阅</h3>
          <p className="muted small">勾选后在日志中查看 map 级事件（与 marker 交互触发）</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ALL_MAP_EVENTS.map(e => (
              <button
                key={e.name}
                className={mapEvents[e.name] ? 'active' : ''}
                onClick={() => toggleMapEvent(e.name)}
                style={{ fontSize: 11, padding: '3px 8px', borderRadius: 3, border: '1px solid #ccc',
                  background: mapEvents[e.name] ? '#1890ff' : '#fff', color: mapEvents[e.name] ? '#fff' : '#333',
                }}
              >
                {e.label}
              </button>
            ))}
          </div>
        </section>

        {/* ─── Marker 操作按钮（查询 + 动作） ─── */}
        <section>
          <h3>Marker 操作</h3>

          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>查询</div>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => log(`📊 getPosition = ${position.lng.toFixed(6)},${position.lat.toFixed(6)}`)}>getPosition</button>
            <button style={{ fontSize: 11 }} onClick={() => log(`📊 getRotation = ${rotation}°`)}>getRotation</button>
            <button style={{ fontSize: 11 }} onClick={() => log(`📊 getTitle = "${title}"`)}>getTitle</button>
            <button style={{ fontSize: 11 }} onClick={() => log(`📊 getOffset = ${offsetX},${offsetY}`)}>getOffset</button>
            <button style={{ fontSize: 11 }} onClick={() => log(`📊 zIndex = ${zIndex ?? '未设置'}`)}>getZIndex</button>
            <button style={{ fontSize: 11 }} onClick={() => log(`📊 anchor = ${anchor ?? '默认'}`)}>getAnchor</button>
            <button style={{ fontSize: 11 }} onClick={() => log(`📊 iconMode = ${iconMode}`)}>getIcon</button>
            <button style={{ fontSize: 11 }} onClick={() => log(`📊 draggable=${draggable} massClear=${massClear} clicking=${clicking}`)}>getOptions</button>
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>动作</div>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => { setPosition({ lng: 116.404, lat: 39.915 }); setRotation(0); setTitle('天安门'); setZIndex(undefined); setAnchor(undefined); setIconMode('默认'); setOffsetX(0); setOffsetY(0); setRaiseOnDrag(false); setDraggingCursor(''); setColor(undefined); setRank(undefined); setEnableCollisionDetection(false); setCollisionTest(false); log('🔄 reset all'); }}>reset all</button>
            <button style={{ fontSize: 11 }} onClick={() => setRotation(r => (r + 45) % 360)}>rotate +45°</button>
            <button style={{ fontSize: 11 }} onClick={() => setRotation(r => (r + 360 - 45) % 360)}>rotate -45°</button>
            <button style={{ fontSize: 11 }} onClick={() => setZIndex(z => (z ?? 0) + 1)}>zIndex +1</button>
            <button style={{ fontSize: 11 }} onClick={() => setZIndex(z => (z ?? 1) - 1)}>zIndex -1</button>
            <button style={{ fontSize: 11 }} onClick={() => { setDraggable(d => !d); log(`🔄 enableDragging → ${!draggable}`); }}>toggle drag</button>
            <button style={{ fontSize: 11 }} onClick={() => { setMassClear(m => !m); log(`🔄 enableMassClear → ${!massClear}`); }}>toggle massClear</button>
            <button style={{ fontSize: 11 }} onClick={() => { setClicking(c => !c); log(`🔄 enableClicking → ${!clicking} (重建 marker)`); }}>toggle clicking</button>
          </div>
        </section>

        {/* ─── v3-only（@removed 4.0） ─── */}
        <section>
          <h3>3.0-only 方法 <span className={`cap-tag ${!caps.has('Map.setHeading') ? 'ok' : 'no'}`}>{!caps.has('Map.setHeading') ? '3.0' : 'v4 移除'}</span></h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => { setShowInfoWindow(true); log('🪟 openInfoWindow'); }}>openInfoWindow</button>
            <button style={{ fontSize: 11 }} onClick={() => { setShowInfoWindow(false); log('🪟 closeInfoWindow'); }}>closeInfoWindow</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              const m = rawMarkerRef.current;
              if (typeof m?.setAnimation === 'function') { m.setAnimation(BMAP_ANIMATION_DROP); log('🎬 setAnimation(DROP)'); }
              else log('❌ setAnimation 不支持（v4 已移除）');
            }}>setAnimation(DROP)</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              const m = rawMarkerRef.current;
              if (typeof m?.setAnimation === 'function') { m.setAnimation(BMAP_ANIMATION_BOUNCE); log('🎬 setAnimation(BOUNCE)'); }
              else log('❌ setAnimation 不支持（v4 已移除）');
            }}>setAnimation(BOUNCE)</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              const m = rawMarkerRef.current;
              if (typeof m?.setAnimation === 'function') { m.setAnimation(null); log('🎬 setAnimation(null)'); }
              else log('❌ setAnimation 不支持（v4 已移除）');
            }}>setAnimation(null)</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              const m = rawMarkerRef.current;
              if (typeof m?.setTop === 'function') { m.setTop(true); log('🔺 setTop(true)'); }
              else log('❌ setTop 不支持（v4 已移除）');
            }}>setTop(true)</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setContextMenuOpen(o => !o);
              log(`📎 ${contextMenuOpen ? 'remove' : 'add'}ContextMenu（右键 marker）`);
            }}>{contextMenuOpen ? 'remove' : 'add'}ContextMenu</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              const m = rawMarkerRef.current;
              if (typeof m?.setShadow === 'function') {
                const SDK = (window as any).BMap;
                const shadowUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25">' +
                  '<ellipse cx="12" cy="20" rx="11" ry="4" fill="rgba(0,0,0,0.35)"/></svg>'
                );
                const shadow = new SDK.Icon(shadowUrl, new SDK.Size(25, 25));
                m.setShadow(shadow);
                log('🌑 setShadow（SVG 阴影）');
              } else log('❌ setShadow 不支持（v4 已移除）');
            }}>setShadow</button>
          </div>
          <p className="muted small">以上方法在 v4 中已移除（@removed 4.0）。setAnimation 方法存在但动画不生效（WebGL 渲染器不实现 DOM 动画）。</p>
        </section>

        {/* ─── v4+ only ─── */}
        <section>
          <h3>4.0+ 方法 <span className={`cap-tag ${caps.has('Map.setHeading') ? 'ok' : 'no'}`}>{caps.has('Map.setHeading') ? '4.0+' : 'v3 ✗'}</span></h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setShowPlaceDetail(o => !o);
              log(`📍 ${showPlaceDetail ? 'close' : 'open'}PlaceDetail`);
            }}>{showPlaceDetail ? 'close' : 'open'}PlaceDetail</button>
          </div>
          <p className="muted small">PlaceDetail 需要 v4+ JSAPI 支持。</p>
        </section>

        {/* ─── Map 级 Marker 相关操作 ─── */}
        <section>
          <h3>🗺️ Map 级 Marker 操作</h3>

          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Overlay 管理</div>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              const list = mapRef?.getOverlays() ?? [];
              log(`📊 getOverlays: ${list.length} 个 overlay（${list.map((o: any) => o.type).join(', ')}）`);
            }}>getOverlays</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              if (confirm('确认清空所有 overlay？')) {
                mapRef?.clearOverlays();
                log('🧹 clearOverlays');
              }
            }}>clearOverlays</button>
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>InfoWindow（Map 级）</div>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              const iw = mapRef?.getInfoWindow();
              log(`📊 getInfoWindow: ${iw ? '有打开的 InfoWindow' : '无'}`);
            }}>getInfoWindow</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              mapRef?.closeInfoWindow();
              log('🪟 map.closeInfoWindow');
            }}>closeInfoWindow</button>
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>添加 Marker（Map.addOverlay）</div>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setMarkerCount(c => c + 1);
              log(`➕ addOverlay: 新增临时 marker #${markerCount + 1}（通过 state 驱动）`);
            }}>addMarker (state)</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setMarkerCount(0);
              log('🔄 清除临时 markers');
            }}>clearTempMarkers</button>
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * Map 级事件探针 — 根据 enabledEvents 动态订阅 Map 事件。
 * 嵌入 <Map> 内，通过 driver.addEventListener 订阅。
 */
const ALL_MAP_EVENTS: Array<{ name: string; label: string }> = [
  { name: 'click', label: 'click' },
  { name: 'dblclick', label: 'dblclick' },
  { name: 'rightclick', label: 'rightclick' },
  { name: 'mousedown', label: 'mousedown' },
  { name: 'mouseup', label: 'mouseup' },
  { name: 'mouseover', label: 'mouseover' },
  { name: 'mouseout', label: 'mouseout' },
  { name: 'addoverlay', label: 'addoverlay' },
  { name: 'removeoverlay', label: 'removeoverlay' },
  { name: 'clearoverlays', label: 'clearoverlays' },
  { name: 'beforeaddoverlay', label: 'beforeaddoverlay' },
];

function MapMarkerEventProbe({
  enabledEvents,
  onLog,
}: {
  enabledEvents: string[];
  onLog: (msg: string) => void;
}) {
  const { map, driver } = useMapContext();
  const onLogRef = useRef(onLog);
  onLogRef.current = onLog;
  const eventsKey = [...enabledEvents].sort().join(',');

  useEffect(() => {
    if (!map || !driver) return;
    const unsubs: Array<() => void> = [];
    for (const evt of enabledEvents) {
      unsubs.push(driver.addEventListener(map, evt, (raw: any) => {
        const r = raw as Record<string, unknown>;
        const hasOverlay = !!r?.overlay;
        const pt = r?.point ?? r?.latLng;
        const coord = pt ? `@ ${(pt as any).lng?.toFixed(4)},${(pt as any).lat?.toFixed(4)}` : '';
        onLogRef.current(`🗺️ map.${evt}${hasOverlay ? ' (on overlay)' : ''} ${coord}`);
      }));
    }
    return () => unsubs.forEach(u => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, eventsKey]);

  return null;
}

/**
 * 暴露 raw Marker + raw Map 实例。
 */
function MarkerActionProbe({ onReady }: { onReady: (rawMarker: any, rawMap: any) => void }) {
  const target = useOverlayTarget();
  const { map } = useMapContext();
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    if (target?.target) {
      onReadyRef.current((target.target as any).raw, (map as any)?.raw);
    }
  }, [target, map]);

  return null;
}
