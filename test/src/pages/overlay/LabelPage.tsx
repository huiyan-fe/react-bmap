/**
 * Label 全量测试页 — 覆盖 bmap-jsapi-dts/src/overlay/Label.d.ts + LabelOptions.d.ts 的全部方法/属性/事件。
 *
 * 覆盖项：
 * 1. 构造选项：content / position / offset / anchor / enableMassClear / enableClicking / width / styles
 * 2. 方法：setContent / setPosition / setOffset / setAnchor / setTitle / setZIndex / setStyles / setOpacity
 * 3. 事件：click / dblclick / rightclick / mousedown / mouseup / mouseover / mouseout / remove
 * 4. 可见性：visible（show/hide）
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Map, Label,
  useMapContext, useCapabilities,
  BMAP_ANCHOR_TOP_LEFT, BMAP_ANCHOR_TOP_RIGHT, BMAP_ANCHOR_BOTTOM_LEFT,
  BMAP_ANCHOR_BOTTOM_RIGHT, BMAP_ANCHOR_TOP_CENTER, BMAP_ANCHOR_BOTTOM_CENTER,
  BMAP_ANCHOR_CENTER,
} from 'react-bmap';
import type { Point, MapRef } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

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

export function LabelPage() {
  const caps = useCapabilities();
  const [position, setPosition] = useState<Point>(BEIJING);
  const [content, setContent] = useState('Hello BMap');
  const [offsetX, setOffsetX] = useState(20);
  const [offsetY, setOffsetY] = useState(-10);
  const [anchor, setAnchor] = useState<number | undefined>(undefined);
  const [opacity, setOpacity] = useState(1);
  const [title, setTitle] = useState('标注标题');
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [zIndex, setZIndex] = useState<number | undefined>(undefined);
  const [massClear, setMassClear] = useState(true);
  const [clicking, setClicking] = useState(true);
  const [visible, setVisible] = useState(true);
  const [stylesText, setStylesText] = useState('{"color":"#1890ff","fontSize":"14px","border":"1px solid #ccc","padding":"2px 6px","borderRadius":"3px","backgroundColor":"#fff","whiteSpace":"nowrap"}');
  const [eventLog, setEventLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const [mapRef, setMapRef] = useState<MapRef | null>(null);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = 0; }, [eventLog]);

  const log = useCallback((msg: string) => {
    setEventLog(s => [`${new Date().toLocaleTimeString()} ${msg}`, ...s].slice(0, 20));
  }, []);

  // 解析 styles JSON
  const styles = useMemo<Record<string, string | number>>(() => {
    try { return JSON.parse(stylesText); } catch { return {}; }
  }, [stylesText]);

  const formatPt = (pt: { lng: number; lat: number } | null | undefined) =>
    pt ? `${pt.lng?.toFixed(4)},${pt.lat?.toFixed(4)}` : '';

  const handleEvent = useCallback((name: string) =>
    (pt: any) => log(`🔵 label.${name}${pt ? ` @ ${formatPt(pt)}` : ''}`), [log]);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map ref={setMapRef} defaultCenter={BEIJING} defaultZoom={13} style={{ height: '100%' }}>
          <Label
            content={content}
            position={position}
            offset={{ width: offsetX, height: offsetY }}
            anchor={anchor as any}
            opacity={opacity}
            title={title}
            width={width}
            zIndex={zIndex}
            enableMassClear={massClear}
            enableClicking={clicking}
            visible={visible}
            styles={styles}
            onClick={handleEvent('click')}
            onDoubleClick={handleEvent('dblclick')}
            onRightClick={handleEvent('rightclick')}
            onMouseDown={handleEvent('mousedown')}
            onMouseUp={handleEvent('mouseup')}
            onMouseOver={handleEvent('mouseover')}
            onMouseOut={handleEvent('mouseout')}
            onRemove={handleEvent('remove')}
          />
        </Map>
        {/* 事件日志浮层 */}
        <div ref={logRef} style={{
          position: 'absolute', left: 8, bottom: 50, maxWidth: 340, maxHeight: 220,
          background: 'rgba(0,0,0,0.75)', color: '#0f0', borderRadius: 6,
          padding: '8px 8px 14px 8px', fontSize: 11, fontFamily: 'monospace',
          overflowY: 'auto', zIndex: 10, border: '1px solid rgba(255,255,255,0.15)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 4 }}>
            <span>事件日志（{eventLog.length}）</span>
            <button onClick={() => setEventLog([])} style={{ background: 'transparent', border: '1px solid #555', color: '#aaa', cursor: 'pointer', fontSize: 10, borderRadius: 3, padding: '0 6px' }}>清空</button>
          </div>
          {eventLog.length === 0 ? (
            <div style={{ color: '#666' }}>与 label 交互触发事件</div>
          ) : eventLog.map((line, i) => <div key={i} style={{ lineHeight: 1.6 }}>{line}</div>)}
        </div>
      </div>

      <div className="test-controls">
        <h2>Label（全量）</h2>

        {/* ─── 能力 ─── */}
        <section>
          <h3>能力</h3>
          <div className="cap-grid">
            <div className={`cap-cell ${caps.has('Label') ? 'ok' : 'no'}`}>Label</div>
          </div>
        </section>

        {/* ─── Content ─── */}
        <section>
          <h3>content（支持 HTML）</h3>
          <input type="text" value={content} onChange={e => setContent(e.target.value)} className="full-width" />
          <div className="btn-group" style={{ marginTop: 4 }}>
            <button onClick={() => setContent('纯文本')}>纯文本</button>
            <button onClick={() => setContent('<strong>粗体</strong>')}>HTML 粗体</button>
            <button onClick={() => setContent('<span style="color:red">红字</span>')}>HTML 红字</button>
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

        {/* ─── Styles ─── */}
        <section>
          <h3>styles（CSS 样式 JSON）</h3>
          <textarea value={stylesText} onChange={e => setStylesText(e.target.value)} className="full-width" rows={4}
            style={{ fontFamily: 'monospace', fontSize: 11 }} />
          <div className="btn-group" style={{ marginTop: 4 }}>
            <button onClick={() => setStylesText('{"color":"#1890ff","fontSize":"14px","border":"1px solid #ccc","padding":"2px 6px","borderRadius":"3px","backgroundColor":"#fff","whiteSpace":"nowrap"}')}>蓝边白底</button>
            <button onClick={() => setStylesText('{"color":"#fff","backgroundColor":"#e8232d","padding":"4px 10px","borderRadius":"12px","fontSize":"13px","whiteSpace":"nowrap"}')}>红色药丸</button>
            <button onClick={() => setStylesText('{"color":"","backgroundColor":"","border":"","padding":"","borderRadius":"","fontSize":"","whiteSpace":""}')}>清空</button>
          </div>
        </section>

        {/* ─── Opacity ─── */}
        <section>
          <h3>opacity: {opacity.toFixed(2)} <span className={`cap-tag ${caps.has('Map.setHeading') ? 'ok' : 'no'}`}>{caps.has('Map.setHeading') ? 'v4+' : 'v3 ✗'}</span></h3>
          <input type="range" min={0} max={1} step={0.05} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="full-width" />
        </section>

        {/* ─── Title ─── */}
        <section>
          <h3>title（鼠标悬停显示）</h3>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="full-width" />
        </section>

        {/* ─── Width ─── */}
        <section>
          <h3>width <span className={`cap-tag ${caps.has('Map.setHeading') ? 'ok' : 'no'}`}>{caps.has('Map.setHeading') ? 'v4+' : 'v3 ✗'}</span></h3>
          <input type="number" placeholder="自适应" value={width ?? ''} onChange={e => setWidth(e.target.value === '' ? undefined : Number(e.target.value))} />
          <span className="muted small" style={{ marginLeft: 8 }}>空 = 自适应</span>
        </section>

        {/* ─── ZIndex ─── */}
        <section>
          <h3>zIndex</h3>
          <input type="number" placeholder="未设置" value={zIndex ?? ''} onChange={e => setZIndex(e.target.value === '' ? undefined : Number(e.target.value))} />
        </section>

        {/* ─── 开关 ─── */}
        <section>
          <h3>行为开关</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={massClear} onChange={e => setMassClear(e.target.checked)} />
            enableMassClear
          </label>
          <div className="btn-group" style={{ marginTop: 4 }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              const before = mapRef?.getOverlays() ?? [];
              mapRef?.clearOverlays();
              const after = mapRef?.getOverlays() ?? [];
              log(`🧹 clearOverlays: ${before.length} → ${after.length}（massClear=${massClear ? 'on' : 'off'}）`);
            }}>clearOverlays 测试</button>
          </div>
          <p className="muted small">enableMassClear=true 时 clearOverlays 会清除 label；false 时 label 不受影响。</p>
          <label className="checkbox-row">
            <input type="checkbox" checked={clicking} onChange={e => setClicking(e.target.checked)} />
            enableClicking（关闭后不响应事件，重建 label）
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            visible（show/hide）
          </label>
        </section>

        {/* ─── 动作 ─── */}
        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setContent('Hello BMap'); setPosition(BEIJING); setOffsetX(20); setOffsetY(-10);
              setAnchor(undefined); setOpacity(1); setTitle('标注标题'); setWidth(undefined);
              setZIndex(undefined); setMassClear(true); setClicking(true); setVisible(true);
              setStylesText('{"color":"#1890ff","fontSize":"14px","border":"1px solid #ccc","padding":"2px 6px","borderRadius":"3px","backgroundColor":"#fff","whiteSpace":"nowrap"}');
              log('🔄 reset all');
            }}>reset all</button>
          </div>
        </section>

        {/* ─── 事件说明 ─── */}
        <section>
          <h3>事件测试</h3>
          <p className="muted small">
            点击 / 双击 / 右键 / 鼠标按下 / 抬起 / 移入 / 移出 label 查看事件日志。<br />
            事件列表：click, dblclick, rightclick, mousedown, mouseup, mouseover, mouseout, remove
          </p>
        </section>
      </div>
    </div>
  );
}
