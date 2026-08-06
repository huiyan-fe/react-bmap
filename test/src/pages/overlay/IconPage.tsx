/**
 * Icon 全量测试页 — 覆盖 Icon.d.ts + IconOptions.d.ts 全部功能。
 * Icon 是值对象（非 Overlay），用作 Marker 的 icon。
 * constructor: new BMap.Icon(url, size, opts?)。url/size 有 setter 可响应式更新。
 * 无事件（Icon 没有 addEventListener）。
 * infoWindowAnchor / printImageUrl 为 @removed 4.0；srcset 为 @since 4.0 @hide。
 */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Map, useMapContext, useCapabilities } from 'react-bmap';
import type { OverlayHandle, Point, Size } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

/** 来自 SDK dts 示例的图片地址 */
const IMAGE_PRESETS = [
  { label: 'marker_1', url: 'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_1.png' },
  { label: 'marker_9', url: 'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_9.png' },
  { label: 'sprite(九宫格)', url: 'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_all.png' },
  { label: 'car', url: 'https://jsapi-demo.bj.bcebos.com/images/markers/car.png' },
];

const DEFAULT_POINT: Point = { lng: 116.404, lat: 39.915 };

/** Icon + Marker 图层 — 必须在 <Map> 内部，才能调用 useMapContext */
function IconMarkerLayer(props: {
  url: string;
  size: Size;
  anchor?: Size;
  imageOffset?: Size;
  imageSize?: Size;
  infoWindowAnchor?: Size;
  printImageUrl?: string;
  srcset?: { '2x': string };
  markerPosition: Point;
  onLog: (msg: string) => void;
}) {
  const { map, driver } = useMapContext();
  const {
    url, size, anchor, imageOffset, imageSize,
    infoWindowAnchor, printImageUrl, srcset,
    markerPosition, onLog,
  } = props;

  const iconRef = useRef<OverlayHandle | null>(null);
  const markerRef = useRef<OverlayHandle | null>(null);

  // ─── 重建 Icon + Marker（url 或任意样式选项变化时）───
  // Icon 是值对象，marker.setIcon 无法可靠替换旧图标，
  // 只能整体重建 Marker（移除旧的 + 创建新的）。
  const rebuildKey = `${url}|${size.width},${size.height}|${anchor?.width ?? ''},${anchor?.height ?? ''}|${imageOffset?.width ?? ''},${imageOffset?.height ?? ''}|${imageSize?.width ?? ''},${imageSize?.height ?? ''}|${infoWindowAnchor?.width ?? ''},${infoWindowAnchor?.height ?? ''}|${printImageUrl ?? ''}|${srcset?.['2x'] ?? ''}`;
  useLayoutEffect(() => {
    if (!driver || !map) return;
    const icon = driver.createIcon(url, size, {
      anchor, imageOffset, imageSize, infoWindowAnchor, printImageUrl, srcset,
    });
    if (!icon) { onLog('❌ Icon 创建失败'); return; }
    iconRef.current = icon;

    const mk = driver.createMarker(markerPosition, { icon });
    if (!mk) { onLog('❌ Marker 创建失败'); return; }
    markerRef.current = mk;
    driver.addOverlay(map, mk);
    onLog('✅ Icon + Marker 创建');

    return () => {
      if (markerRef.current && map) driver.removeOverlay(map, markerRef.current);
      iconRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, map, rebuildKey]);

  // ─── 更新 Marker 位置 ───
  useEffect(() => {
    if (!driver || !markerRef.current) return;
    driver.setOverlayPosition(markerRef.current, markerPosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, markerPosition.lng, markerPosition.lat]);

  return null;
}

export function IconPage() {
  const [url, setUrl] = useState(IMAGE_PRESETS[0].url);
  const [size, setSize] = useState<Size>({ width: 30, height: 30 });
  const [anchor, setAnchor] = useState<Size>({ width: 15, height: 30 });
  const [imageOffset, setImageOffset] = useState<Size>({ width: 0, height: 0 });
  const [imageSizeW, setImageSizeW] = useState('');
  const [imageSizeH, setImageSizeH] = useState('');
  const [iwAnchorW, setIwAnchorW] = useState('');
  const [iwAnchorH, setIwAnchorH] = useState('');
  const [printImageUrl, setPrintImageUrl] = useState<string | undefined>(undefined);
  const [srcset2x, setSrcset2x] = useState<string | undefined>(undefined);
  const [markerPosition, setMarkerPosition] = useState<Point>(DEFAULT_POINT);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const imageSize = useMemo<Size | undefined>(() =>
    imageSizeW || imageSizeH ? { width: Number(imageSizeW) || 0, height: Number(imageSizeH) || 0 } : undefined,
    [imageSizeW, imageSizeH],
  );
  const infoWindowAnchor = useMemo<Size | undefined>(() =>
    iwAnchorW || iwAnchorH ? { width: Number(iwAnchorW) || 0, height: Number(iwAnchorH) || 0 } : undefined,
    [iwAnchorW, iwAnchorH],
  );
  const srcset = useMemo<{ '2x': string } | undefined>(() =>
    srcset2x ? { '2x': srcset2x } : undefined, [srcset2x],
  );

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [eventLog]);

  const log = useCallback((msg: string) => {
    setEventLog(s =>
      [`${new Date().toLocaleTimeString()} ${msg}`, ...s].slice(0, 20),
    );
  }, []);

  const caps = useCapabilities();
  const isV4 = caps.has('Map.setHeading');

  const v3OnlyTag = (
    <span className={`cap-tag ${isV4 ? 'no' : 'ok'}`}>
      {isV4 ? 'v4 已移除' : 'v3 only'}
    </span>
  );
  const v4HideTag = (
    <span className="cap-tag ok">v4 @hide</span>
  );

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={14} style={{ height: '100%' }}>
          <IconMarkerLayer
            url={url}
            size={size}
            anchor={anchor}
            imageOffset={imageOffset}
            imageSize={imageSize}
            infoWindowAnchor={infoWindowAnchor}
            printImageUrl={printImageUrl}
            srcset={srcset}
            markerPosition={markerPosition}
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
            ? <div style={{ color: '#666' }}>Icon 无事件（值对象）；操作日志在此</div>
            : eventLog.map((line, i) => (
              <div key={i} style={{ lineHeight: 1.6 }}>{line}</div>
            ))}
        </div>
      </div>

      <div className="test-controls">
        <h2>Icon（全量）</h2>

        <section>
          <h3>说明</h3>
          <p className="muted small">
            Icon 是值对象（非 Overlay），用作 Marker 的 icon。
            constructor: new BMap.Icon(url, size, opts?)。
            url/size 有 setter 可响应式更新；无事件。
          </p>
        </section>

        {/* url */}
        <section>
          <h3>url（图片地址）</h3>
          <input type="text" className="full-width" value={url}
            onChange={e => setUrl(e.target.value)} />
          <div className="btn-group" style={{ flexWrap: 'wrap', marginTop: 4 }}>
            {IMAGE_PRESETS.map(p => (
              <button key={p.label} style={{ fontSize: 10 }}
                className={url === p.url ? 'active' : ''}
                onClick={() => { setUrl(p.url); log(`🖼 url → ${p.label}`); }}
              >{p.label}</button>
            ))}
          </div>
          <p className="muted small">走 setImageUrl()；url 变化时重建 Icon + Marker</p>
        </section>

        {/* size */}
        <section>
          <h3>size（可视区域大小）</h3>
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
          <p className="muted small">走 setSize()</p>
        </section>

        {/* anchor */}
        <section>
          <h3>anchor（锚点偏移） <span className="muted small">@deprecated 4.0</span></h3>
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
          <p className="muted small">走 setAnchor()（Size 类型）；4.0 建议用 MarkerOptions#anchor</p>
        </section>

        {/* imageOffset */}
        <section>
          <h3>imageOffset（Sprites 切图偏移，等同 background-position）</h3>
          <label className="checkbox-row">
            width
            <input type="number" value={imageOffset.width}
              onChange={e => setImageOffset(s => ({ ...s, width: Number(e.target.value) }))} />
          </label>
          <label className="checkbox-row">
            height
            <input type="number" value={imageOffset.height}
              onChange={e => setImageOffset(s => ({ ...s, height: Number(e.target.value) }))} />
          </label>
          <p className="muted small">走 setImageOffset()</p>
        </section>

        {/* imageSize */}
        <section>
          <h3>imageSize（图片逻辑大小，等同 background-size）</h3>
          <label className="checkbox-row">
            width
            <input type="number" placeholder="未设置" value={imageSizeW}
              onChange={e => setImageSizeW(e.target.value)} />
          </label>
          <label className="checkbox-row">
            height
            <input type="number" placeholder="未设置" value={imageSizeH}
              onChange={e => setImageSizeH(e.target.value)} />
          </label>
          <p className="muted small">走 setImageSize()；配合 imageOffset 实现 CSS Sprites</p>
        </section>

        {/* infoWindowAnchor */}
        <section>
          <h3>infoWindowAnchor {v3OnlyTag}</h3>
          <label className="checkbox-row">
            width
            <input type="number" placeholder="未设置" value={iwAnchorW}
              onChange={e => setIwAnchorW(e.target.value)} />
          </label>
          <label className="checkbox-row">
            height
            <input type="number" placeholder="未设置" value={iwAnchorH}
              onChange={e => setIwAnchorH(e.target.value)} />
          </label>
          <p className="muted small">走 setInfoWindowAnchor()；v4 已移除</p>
        </section>

        {/* printImageUrl */}
        <section>
          <h3>printImageUrl {v3OnlyTag}</h3>
          <input type="text" className="full-width" placeholder="未设置" value={printImageUrl ?? ''}
            onChange={e => setPrintImageUrl(e.target.value || undefined)} />
          <p className="muted small">走 setPrintImageUrl()；仅 IE6 有效，v4 已移除</p>
        </section>

        {/* srcset */}
        <section>
          <h3>srcset.2x {v4HideTag}</h3>
          <input type="text" className="full-width" placeholder="未设置" value={srcset2x ?? ''}
            onChange={e => setSrcset2x(e.target.value || undefined)} />
          <p className="muted small">走 setImageSrcset()；v4 高清屏资源集</p>
        </section>

        {/* Marker 位置 */}
        <section>
          <h3>Marker 位置</h3>
          <label className="checkbox-row">
            lng
            <input type="number" step={0.001} value={markerPosition.lng}
              onChange={e => setMarkerPosition(p => ({ ...p, lng: Number(e.target.value) }))} />
          </label>
          <label className="checkbox-row">
            lat
            <input type="number" step={0.001} value={markerPosition.lat}
              onChange={e => setMarkerPosition(p => ({ ...p, lat: Number(e.target.value) }))} />
          </label>
        </section>

        {/* 动作 */}
        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setUrl(IMAGE_PRESETS[0].url);
              setSize({ width: 30, height: 30 });
              setAnchor({ width: 15, height: 30 });
              setImageOffset({ width: 0, height: 0 });
              setImageSizeW('');
              setImageSizeH('');
              setIwAnchorW('');
              setIwAnchorH('');
              setPrintImageUrl(undefined);
              setSrcset2x(undefined);
              setMarkerPosition(DEFAULT_POINT);
              log('🔄 reset all');
            }}>reset all</button>
          </div>
        </section>

        {/* 预设 */}
        <section>
          <h3>预设</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setUrl(IMAGE_PRESETS[0].url);
              setSize({ width: 30, height: 30 });
              setAnchor({ width: 15, height: 30 });
              setImageOffset({ width: 0, height: 0 });
              setImageSizeW('');
              setImageSizeH('');
              log('🖼 单图标');
            }}>单图标</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setUrl(IMAGE_PRESETS[2].url);
              setSize({ width: 30, height: 30 });
              setImageSizeW('90');
              setImageSizeH('90');
              setImageOffset({ width: 60, height: 0 });
              setAnchor({ width: 15, height: 30 });
              log('🖼 Sprites 第一行第三个');
            }}>Sprites 切图</button>
            <button style={{ fontSize: 11 }} onClick={() => {
              setUrl(IMAGE_PRESETS[3].url);
              setSize({ width: 30, height: 60 });
              setAnchor({ width: 15, height: 60 });
              log('🖼 车辆图标');
            }}>车辆图标</button>
          </div>
        </section>

        <section>
          <h3>事件说明</h3>
          <p className="muted small">
            Icon 是值对象（非 Overlay），SDK 的 Icon 类没有 addEventListener。
            无事件可测试。
          </p>
        </section>
      </div>
    </div>
  );
}
