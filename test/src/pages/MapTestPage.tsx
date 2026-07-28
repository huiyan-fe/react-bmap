import React, { useEffect, useState } from 'react';
import {
  Map,
  useMapStatus,
  useCapabilities,
  UnsupportedCapabilityError,
  tryOp,
  BMAP_NORMAL_MAP, BMAP_SATELLITE_MAP, BMAP_HYBRID_MAP, BMAP_EARTH_MAP,
  BMAP_ANCHOR_TOP_LEFT,
} from 'react-bmap';
import type { MapRef, MapSnapshot, Point } from 'react-bmap';
import { BEIJING } from '../TestProvider';

// 内嵌状态探针
function StateProbe({ onChange }: { onChange: (s: MapSnapshot | null) => void }) {
  const status = useMapStatus();
  useEffect(() => { onChange(status); }, [status, onChange]);
  return null;
}

/**
 * Map 综合测试页 — 覆盖 dts Map 类所有方法/属性/事件。
 *
 * 分组（与 dts Map.d.ts 一致）：
 * 1. 视野控制（center / zoom / heading / tilt）— 受控
 * 2. 交互开关（13 对 enable/disable）— 受控
 * 3. 缩放范围 / 地图类型 / 光标 / 主题 — 受控
 * 4. 视图命令（panTo / panBy / flyTo / reset / setViewport / zoomIn / zoomOut）— 命令
 * 5. 视角动画（startViewAnimation 等）— 命令
 * 6. 查询（getCenter / getZoom / getBounds / getSize / 等）— 命令
 * 7. 坐标转换（pointToPixel / lnglatToMercator 等）— 命令
 * 8. 样式（setMapStyle / setMapStyleV2 / setTheme）— 受控
 * 9. 事件订阅（click / zoomend / moveend 等）— 日志
 * 10. 3.0-only（enableMapClick / setPanorama / setCurrentCity / addHotspot）— 命令
 * 11. 4.0+ 实用（getScreenshot / Spots / Indoor / Earth / Language / 等）— 命令
 * 12. useMapStatus 实时状态显示
 * 13. useCapabilities 能力矩阵快照
 */
export function MapTestPage() {
  const caps = useCapabilities();
  const [status, setStatus] = useState<MapSnapshot | null>(null);
  const [mapRef, setMapRef] = useState<MapRef | null>(null);
  const [result, setResult] = useState('');
  const [eventLog, setEventLog] = useState<string[]>([]);

  // 受控视野
  const [center, setCenter] = useState<Point>(BEIJING);
  const [zoom, setZoom] = useState(11);
  const [heading, setHeading] = useState(0);
  const [tilt, setTilt] = useState(0);

  // 受控交互开关（undefined 表示不主动控制）
  const [dragging, setDragging] = useState<boolean | undefined>(true);
  const [inertialDragging, setInertialDragging] = useState<boolean | undefined>(undefined);
  const [scrollWheelZoom, setScrollWheelZoom] = useState<boolean | undefined>(true);
  const [continuousZoom, setContinuousZoom] = useState<boolean | undefined>(undefined);
  const [resizeOnCenter, setResizeOnCenter] = useState<boolean | undefined>(undefined);
  const [doubleClickZoom, setDoubleClickZoom] = useState<boolean | undefined>(undefined);
  const [keyboard, setKeyboard] = useState<boolean | undefined>(undefined);
  const [pinchToZoom, setPinchToZoom] = useState<boolean | undefined>(undefined);
  const [rotate, setRotate] = useState<boolean | undefined>(undefined);
  const [rotateGestures, setRotateGestures] = useState<boolean | undefined>(undefined);
  const [tiltEnable, setTiltEnable] = useState<boolean | undefined>(undefined);
  const [tiltGestures, setTiltGestures] = useState<boolean | undefined>(undefined);
  const [autoResize, setAutoResize] = useState<boolean | undefined>(undefined);

  // 其它受控
  const [minZoom, setMinZoom] = useState<number | undefined>(undefined);
  const [maxZoom, setMaxZoom] = useState<number | undefined>(undefined);
  const [mapType, setMapType] = useState<string | undefined>(undefined);
  const [defaultCursor, setDefaultCursor] = useState<string | undefined>(undefined);
  const [draggingCursor, setDraggingCursor] = useState<string | undefined>(undefined);
  const [theme, setTheme] = useState<string | undefined>(undefined);
  const [styleMode, setStyleMode] = useState<'none' | 'v1' | 'v2'>('none');

  // 命令输入
  const [panToLng, setPanToLng] = useState('121.474');
  const [panToLat, setPanToLat] = useState('31.230');
  const [panByX, setPanByX] = useState('100');
  const [panByY, setPanByY] = useState('100');
  const [czZoom, setCzZoom] = useState('12');
  const [cityInput, setCityInput] = useState('北京');
  const [animate, setAnimate] = useState(true);

  // 事件订阅开关
  const [subscribedEvents, setSubscribedEvents] = useState<string[]>([]);

  const call = (name: string, fn: () => unknown) => {
    const r = tryOp(fn);
    if (r.ok) {
      const v = r.value;
      setResult(`${name}: ${v === undefined ? 'ok' : typeof v === 'object' ? JSON.stringify(v).slice(0, 200) : String(v).slice(0, 200)}`);
    } else {
      setResult(`${name}: ❌ unsupported (${r.capability})`);
    }
  };

  // 事件订阅
  useEffect(() => {
    if (!mapRef) return;
    const unsubs: Array<() => void> = [];
    for (const evt of subscribedEvents) {
      unsubs.push(mapRef.addEventListener(evt, (raw: any) => {
        const t = new Date().toLocaleTimeString();
        const pt = raw?.point ? `${raw.point.lng?.toFixed(4)},${raw.point.lat?.toFixed(4)}` : '';
        setEventLog(s => [`${t} ${evt}${pt ? ' @ ' + pt : ''}`, ...s].slice(0, 20));
      }));
    }
    return () => unsubs.forEach(u => u());
  }, [mapRef, subscribedEvents]);

  const toggleEvent = (evt: string) => {
    setSubscribedEvents(s => s.includes(evt) ? s.filter(e => e !== evt) : [...s, evt]);
  };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map
          ref={setMapRef}
          center={center}
          zoom={zoom}
          heading={heading || undefined}
          tilt={tilt || undefined}
          enableDragging={dragging}
          enableInertialDragging={inertialDragging}
          enableScrollWheelZoom={scrollWheelZoom}
          enableContinuousZoom={continuousZoom}
          enableResizeOnCenter={resizeOnCenter}
          enableDoubleClickZoom={doubleClickZoom}
          enableKeyboard={keyboard}
          enablePinchToZoom={pinchToZoom}
          enableRotate={rotate}
          enableRotateGestures={rotateGestures}
          enableTilt={tiltEnable}
          enableTiltGestures={tiltGestures}
          enableAutoResize={autoResize}
          minZoom={minZoom}
          maxZoom={maxZoom}
          mapType={mapType}
          defaultCursor={defaultCursor}
          draggingCursor={draggingCursor}
          theme={theme}
          mapStyle={styleMode === 'v1' ? { styleJson: [] } : undefined}
          mapStyleV2={styleMode === 'v2' ? { styleId: 'test' } : undefined}
          onCenterChange={setCenter}
          onZoomChange={setZoom}
          onHeadingChange={setHeading}
          onTiltChange={setTilt}
          style={{ height: '100%' }}
        >
          <StateProbe onChange={setStatus} />
        </Map>
        <div className="map-overlay-info">
          <div className="state-display">
            <div>useMapStatus:</div>
            <div>zoom: <code>{status?.zoom ?? '—'}</code></div>
            <div>center: <code>{status?.center ? `${status.center.lng.toFixed(4)}, ${status.center.lat.toFixed(4)}` : '—'}</code></div>
            <div>heading: <code>{status?.heading ?? '—'}</code></div>
            <div>tilt: <code>{status?.tilt ?? '—'}</code></div>
            <div>bounds: <code>{status?.bounds ? `${status.bounds.sw.lng.toFixed(2)},${status.bounds.sw.lat.toFixed(2)} ~ ${status.bounds.ne.lng.toFixed(2)},${status.bounds.ne.lat.toFixed(2)}` : '—'}</code></div>
            <div>size: <code>{status?.size ? `${status.size.width}x${status.size.height}` : '—'}</code></div>
          </div>
          {result && <div className="method-result">{result}</div>}
        </div>
      </div>

      <div className="test-controls">
        <h2>Map 综合测试（dts 全量）</h2>

        {/* ─── 13. 能力快照 ─── */}
        <section>
          <h3>能力快照（useCapabilities）</h3>
          <div className="cap-grid">
            {['Map.flyTo', 'Map.setHeading', 'Map.setTilt', 'Map.setMapStyle', 'Map.setMapStyleV2',
              'Map.enableMapClick', 'Map.enable3DBuilding', 'Map.setPanorama', 'Map.addHotspot',
              'Map.setCurrentCity', 'Map.getScreenshot', 'Map.isSupportEarth',
              'Prism', 'NavigationControl3D', 'RidingRoute', 'Marker.openInfoWindow',
            ].map(cap => (
              <div key={cap} className={`cap-cell ${caps.has(cap) ? 'ok' : 'no'}`}>{cap}</div>
            ))}
          </div>
        </section>

        {/* ─── 1. 视野控制（受控） ─── */}
        <section>
          <h3>1. 视野控制（受控 props）</h3>
          <div>center: <code>{center.lng.toFixed(4)}, {center.lat.toFixed(4)}</code></div>
          <div className="btn-group">
            <button onClick={() => setCenter({ lng: 116.404, lat: 39.915 })}>北京</button>
            <button onClick={() => setCenter({ lng: 121.474, lat: 31.230 })}>上海</button>
            <button onClick={() => setCenter({ lng: 113.264, lat: 23.129 })}>广州</button>
          </div>
          <div>zoom: <code>{zoom}</code></div>
          <input type="range" min={3} max={21} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="full-width" />
          <div>heading: <code>{heading}</code> <span className={`cap-tag ${caps.has('Map.setHeading') ? 'ok' : 'no'}`}>{caps.has('Map.setHeading') ? 'v4+' : 'v3 ✗'}</span></div>
          <input type="range" min={0} max={360} value={heading} onChange={e => setHeading(Number(e.target.value))} className="full-width" />
          <div>tilt: <code>{tilt}</code> <span className={`cap-tag ${caps.has('Map.setTilt') ? 'ok' : 'no'}`}>{caps.has('Map.setTilt') ? 'v4+' : 'v3 ✗'}</span></div>
          <input type="range" min={0} max={73} value={tilt} onChange={e => setTilt(Number(e.target.value))} className="full-width" />
        </section>

        {/* ─── 2. 交互开关 ─── */}
        <section>
          <h3>2. 交互开关（受控 enable*）</h3>
          {([
            ['enableDragging', dragging, setDragging],
            ['enableInertialDragging', inertialDragging, setInertialDragging],
            ['enableScrollWheelZoom', scrollWheelZoom, setScrollWheelZoom],
            ['enableContinuousZoom', continuousZoom, setContinuousZoom],
            ['enableResizeOnCenter', resizeOnCenter, setResizeOnCenter],
            ['enableDoubleClickZoom', doubleClickZoom, setDoubleClickZoom],
            ['enableKeyboard', keyboard, setKeyboard],
            ['enablePinchToZoom', pinchToZoom, setPinchToZoom],
            ['enableRotate', rotate, setRotate],
            ['enableRotateGestures', rotateGestures, setRotateGestures],
            ['enableTilt', tiltEnable, setTiltEnable],
            ['enableTiltGestures', tiltGestures, setTiltGestures],
            ['enableAutoResize', autoResize, setAutoResize],
          ] as const).map(([key, val, setter]) => (
            <label key={key} className="checkbox-row" style={{ display: 'inline-block', marginRight: 12 }}>
              <input
                type="checkbox"
                checked={val ?? false}
                ref={el => {
                  if (el && val === undefined) el.indeterminate = true;
                }}
                onChange={e => setter(e.target.checked as any)}
              />
              {key.replace(/^enable/, '')}
            </label>
          ))}
          <div style={{ marginTop: 8 }}>
            <button onClick={() => {
              setDragging(undefined); setInertialDragging(undefined); setScrollWheelZoom(undefined);
              setContinuousZoom(undefined); setResizeOnCenter(undefined); setDoubleClickZoom(undefined);
              setKeyboard(undefined); setPinchToZoom(undefined); setRotate(undefined);
              setRotateGestures(undefined); setTiltEnable(undefined); setTiltGestures(undefined); setAutoResize(undefined);
            }}>全部交还默认</button>
          </div>
        </section>

        {/* ─── 3. 其它受控配置 ─── */}
        <section>
          <h3>3. 缩放范围 / 地图类型 / 光标 / 主题</h3>
          <div className="input-row">
            <label>minZoom</label>
            <input type="number" placeholder="未设置" value={minZoom ?? ''} onChange={e => setMinZoom(e.target.value === '' ? undefined : Number(e.target.value))} />
            <label>maxZoom</label>
            <input type="number" placeholder="未设置" value={maxZoom ?? ''} onChange={e => setMaxZoom(e.target.value === '' ? undefined : Number(e.target.value))} />
          </div>
          <div className="btn-group">
            <button onClick={() => setMapType(BMAP_NORMAL_MAP as any)}>普通</button>
            <button onClick={() => setMapType(BMAP_SATELLITE_MAP as any)}>卫星</button>
            <button onClick={() => setMapType(BMAP_HYBRID_MAP as any)}>混合</button>
            <button className={caps.has('BMAP_EARTH_MAP') ? '' : 'pending'} onClick={() => setMapType(BMAP_EARTH_MAP as any)}>地球(v4)</button>
            <button onClick={() => setMapType(undefined)}>默认</button>
          </div>
          <input type="text" placeholder="defaultCursor" value={defaultCursor ?? ''} onChange={e => setDefaultCursor(e.target.value || undefined)} className="full-width" />
          <input type="text" placeholder="draggingCursor" value={draggingCursor ?? ''} onChange={e => setDraggingCursor(e.target.value || undefined)} className="full-width" />
          <div className="btn-group">
            <button onClick={() => setTheme('light')}>theme: light</button>
            <button onClick={() => setTheme('dark')}>theme: dark</button>
            <button onClick={() => setTheme(undefined)}>theme: 默认</button>
          </div>
        </section>

        {/* ─── 8. 样式 ─── */}
        <section>
          <h3>8. 个性化样式</h3>
          <div className="btn-group">
            <button className={styleMode === 'none' ? 'active' : ''} onClick={() => setStyleMode('none')}>关闭</button>
            <button className={styleMode === 'v1' ? 'active' : ''} onClick={() => setStyleMode('v1')}>
              setMapStyle v1 <span className={`cap-tag ${caps.has('Map.setMapStyle') ? 'ok' : 'no'}`}>{caps.has('Map.setMapStyle') ? '3.0' : 'v4 ✗'}</span>
            </button>
            <button className={styleMode === 'v2' ? 'active' : ''} onClick={() => setStyleMode('v2')}>
              setMapStyleV2 <span className={`cap-tag ${caps.has('Map.setMapStyleV2') ? 'ok' : 'no'}`}>{caps.has('Map.setMapStyleV2') ? 'v4+' : '3.0 ✗'}</span>
            </button>
          </div>
        </section>

        {/* ─── 4. 视图命令 ─── */}
        <section>
          <h3>4. 视图命令（mapRef，全量）</h3>

          {/* 全局动画开关，用于 panTo/panBy/setCenter/setZoom/flyTo 的 options.noAnimation */}
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={animate}
              onChange={e => setAnimate(e.target.checked)}
            />
            animate（取消勾选则传 <code>{'{ noAnimation: true }'}</code>）
          </label>

          {/* centerAndZoom（两种重载） */}
          <div className="input-row">
            <label>centerAndZoom lng</label>
            <input type="number" value={panToLng} onChange={e => setPanToLng(e.target.value)} />
            <label>lat</label>
            <input type="number" value={panToLat} onChange={e => setPanToLat(e.target.value)} />
            <label>zoom</label>
            <input type="number" value={czZoom} onChange={e => setCzZoom(e.target.value)} style={{ width: 60 }} />
            <button onClick={() => call('centerAndZoom(Point,zoom)', () => mapRef?.centerAndZoom({ lng: Number(panToLng), lat: Number(panToLat) }, Number(czZoom)))}>centerAndZoom</button>
          </div>
          <div className="input-row">
            <label>centerAndZoom(city)</label>
            <input type="text" value={cityInput} onChange={e => setCityInput(e.target.value)} placeholder="如 北京" style={{ flex: 1 }} />
            <button onClick={() => call('centerAndZoom(city)', () => mapRef?.centerAndZoom(cityInput || '北京', Number(czZoom)))}>centerAndZoom(city)</button>
          </div>

          {/* setCenter / setZoom（显式命令式，区别于受控 props） */}
          <div className="input-row">
            <label>setCenter lng</label>
            <input type="number" value={panToLng} onChange={e => setPanToLng(e.target.value)} />
            <label>lat</label>
            <input type="number" value={panToLat} onChange={e => setPanToLat(e.target.value)} />
            <button onClick={() => call('setCenter', () => mapRef?.setCenter({ lng: Number(panToLng), lat: Number(panToLat) }, animate ? undefined : { noAnimation: true }))}>setCenter</button>
            <button onClick={() => call('setCenter(city)', () => mapRef?.setCenter(cityInput || '北京'))}>setCenter(city)</button>
          </div>
          <div className="input-row">
            <label>setZoom</label>
            <input type="number" value={czZoom} onChange={e => setCzZoom(e.target.value)} style={{ width: 60 }} />
            <button onClick={() => call('setZoom', () => mapRef?.setZoom(Number(czZoom), animate ? undefined : { noAnimation: true }))}>setZoom</button>
            <label>zoomCenter（可选）</label>
            <input type="number" value={panToLng} onChange={e => setPanToLng(e.target.value)} placeholder="lng" style={{ width: 80 }} />
            <input type="number" value={panToLat} onChange={e => setPanToLat(e.target.value)} placeholder="lat" style={{ width: 80 }} />
          </div>

          {/* panTo / panBy（带 noAnimation 选项） */}
          <div className="input-row">
            <label>panTo lng</label>
            <input type="number" value={panToLng} onChange={e => setPanToLng(e.target.value)} />
            <label>lat</label>
            <input type="number" value={panToLat} onChange={e => setPanToLat(e.target.value)} />
            <button onClick={() => call('panTo', () => mapRef?.panTo({ lng: Number(panToLng), lat: Number(panToLat) }, animate ? undefined : { noAnimation: true }))}>panTo</button>
          </div>
          <div className="input-row">
            <label>panBy dx</label>
            <input type="number" value={panByX} onChange={e => setPanByX(e.target.value)} />
            <label>dy</label>
            <input type="number" value={panByY} onChange={e => setPanByY(e.target.value)} />
            <button onClick={() => call('panBy', () => mapRef?.panBy(Number(panByX), Number(panByY), animate ? undefined : { noAnimation: true }))}>panBy</button>
          </div>

          {/* zoomIn / zoomOut（带 zoomCenter） */}
          <div className="btn-group">
            <button onClick={() => call('zoomIn', () => mapRef?.zoomIn())}>zoomIn</button>
            <button onClick={() => call('zoomIn(zoomCenter)', () => mapRef?.zoomIn({ lng: Number(panToLng), lat: Number(panToLat) }))}>zoomIn(center)</button>
            <button onClick={() => call('zoomOut', () => mapRef?.zoomOut())}>zoomOut</button>
            <button onClick={() => call('zoomOut(zoomCenter)', () => mapRef?.zoomOut({ lng: Number(panToLng), lat: Number(panToLat) }))}>zoomOut(center)</button>
          </div>

          {/* flyTo（v4+） */}
          <div className="btn-group">
            <button onClick={() => call('flyTo(上海,14)', () => mapRef?.flyTo({ lng: 121.474, lat: 31.230 }, 14, animate ? undefined : { noAnimation: true }))}>
              flyTo(上海,14)
            </button>
            <button onClick={() => call('flyTo(北京,11)', () => mapRef?.flyTo({ lng: 116.404, lat: 39.915 }, 11, animate ? undefined : { noAnimation: true }))}>
              flyTo(北京,11)
            </button>
          </div>

          {/* setViewport / getViewport / reset */}
          <div className="btn-group">
            <button onClick={() => call('setViewport(北京范围)', () => mapRef?.setViewport([{ lng: 116.3, lat: 39.85 }, { lng: 116.5, lat: 40.0 }]))}>setViewport(北京)</button>
            <button onClick={() => call('setViewport(上海范围)', () => mapRef?.setViewport([{ lng: 121.3, lat: 31.1 }, { lng: 121.6, lat: 31.4 }]))}>setViewport(上海)</button>
            <button onClick={() => call('getViewport(广州范围)', () => mapRef?.getViewport([{ lng: 113.2, lat: 23.0 }, { lng: 113.5, lat: 23.2 }]))}>getViewport(广州)</button>
            <button onClick={() => call('reset', () => mapRef?.reset())}>reset</button>
          </div>
        </section>

        {/* ─── 5. 视角动画 ─── */}
        <section>
          <h3>5. 视角动画（v4+）</h3>
          <div className="btn-group">
            <button onClick={() => call('setHeading(90)', () => mapRef?.setHeading(90))}>setHeading(90)</button>
            <button onClick={() => call('setTilt(45)', () => mapRef?.setTilt(45))}>setTilt(45)</button>
            <button onClick={() => call('getCurrentMaxTilt', () => mapRef?.getCurrentMaxTilt())}>getCurrentMaxTilt</button>
            <button onClick={() => call('pauseViewAnimation', () => mapRef?.pauseViewAnimation())}>pause</button>
            <button onClick={() => call('continueViewAnimation', () => mapRef?.continueViewAnimation())}>continue</button>
            <button onClick={() => call('cancelViewAnimation', () => mapRef?.cancelViewAnimation())}>cancel</button>
          </div>
        </section>

        {/* ─── 6. 查询 ─── */}
        <section>
          <h3>6. 查询方法</h3>
          <div className="btn-group">
            <button onClick={() => call('getCenter', () => mapRef?.getCenter())}>getCenter</button>
            <button onClick={() => call('getZoom', () => mapRef?.getZoom())}>getZoom</button>
            <button onClick={() => call('getBounds', () => mapRef?.getBounds())}>getBounds</button>
            <button onClick={() => call('getSize', () => mapRef?.getSize())}>getSize</button>
            <button onClick={() => call('getMinZoom', () => mapRef?.getMinZoom())}>getMinZoom</button>
            <button onClick={() => call('getMaxZoom', () => mapRef?.getMaxZoom())}>getMaxZoom</button>
            <button onClick={() => call('getHeading', () => mapRef?.getHeading())}>getHeading</button>
            <button onClick={() => call('getTilt', () => mapRef?.getTilt())}>getTilt</button>
            <button onClick={() => call('isLoaded', () => mapRef?.isLoaded())}>isLoaded</button>
            <button onClick={() => call('getCoordType', () => mapRef?.getCoordType())}>getCoordType</button>
            <button onClick={() => call('getMapType', () => mapRef?.getMapType())}>getMapType</button>
            <button onClick={() => call('getMapTypeId', () => mapRef?.getMapTypeId())}>getMapTypeId</button>
            <button onClick={() => call('getMapStyleId', () => mapRef?.getMapStyleId())}>getMapStyleId</button>
            <button onClick={() => call('getRenderType', () => mapRef?.getRenderType())}>getRenderType</button>
            <button onClick={() => call('isCanvasMap', () => mapRef?.isCanvasMap())}>isCanvasMap</button>
            <button onClick={() => call('getDefaultCursor', () => mapRef?.getDefaultCursor())}>getDefaultCursor</button>
            <button onClick={() => call('getDraggingCursor', () => mapRef?.getDraggingCursor())}>getDraggingCursor</button>
            <button onClick={() => call('getOverlays', () => mapRef?.getOverlays().length)}>getOverlays</button>
            <button onClick={() => call('getPanes', () => !!mapRef?.getPanes())}>getPanes</button>
            <button onClick={() => call('getInfoWindow', () => !!mapRef?.getInfoWindow())}>getInfoWindow</button>
            <button onClick={() => call('getIndoorInfo', () => mapRef?.getIndoorInfo())}>getIndoorInfo</button>
            <button onClick={() => call('isStreetLayerShow', () => mapRef?.isStreetLayerShow())}>isStreetLayerShow</button>
            <button onClick={() => call('isSupportEarth', () => mapRef?.isSupportEarth())}>isSupportEarth</button>
            <button onClick={() => call('getLanguage', () => mapRef?.getLanguage())}>getLanguage</button>
            <button onClick={() => call('getPrivateStatus', () => mapRef?.getPrivateStatus())}>getPrivateStatus</button>
            <button onClick={() => call('highResolutionEnabled', () => mapRef?.highResolutionEnabled())}>highResolutionEnabled</button>
          </div>
        </section>

        {/* ─── 7. 坐标转换 ─── */}
        <section>
          <h3>7. 坐标转换</h3>
          <div className="btn-group">
            <button onClick={() => call('pointToPixel', () => mapRef?.pointToPixel({ lng: 116.404, lat: 39.915 }))}>pointToPixel(北京)</button>
            <button onClick={() => call('pixelToPoint', () => mapRef?.pixelToPoint({ x: 400, y: 300 }))}>pixelToPoint(400,300)</button>
            <button onClick={() => call('pointToOverlayPixel', () => mapRef?.pointToOverlayPixel({ lng: 116.404, lat: 39.915 }))}>pointToOverlayPixel</button>
            <button onClick={() => call('overlayPixelToPoint', () => mapRef?.overlayPixelToPoint({ x: 400, y: 300 }))}>overlayPixelToPoint</button>
            <button onClick={() => call('getDistance', () => mapRef?.getDistance({ lng: 116.404, lat: 39.915 }, { lng: 116.504, lat: 39.955 }))}>getDistance</button>
            <button onClick={() => call('lnglatToMercator', () => mapRef?.lnglatToMercator(116.404, 39.915))}>lnglatToMercator</button>
            <button onClick={() => call('mercatorToLnglat', () => mapRef?.mercatorToLnglat(12958190, 4825923))}>mercatorToLnglat</button>
            <button onClick={() => call('getExtendBounds', () => mapRef?.getExtendBounds({ sw: { lng: 116, lat: 39 }, ne: { lng: 117, lat: 40 } }))}>getExtendBounds</button>
            <button onClick={() => call('getTileId', () => mapRef?.getTileId({ lng: 116.404, lat: 39.915 }, 12))}>getTileId</button>
          </div>
        </section>

        {/* ─── 9. 事件 ─── */}
        <section>
          <h3>9. 事件订阅</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {['click', 'dblclick', 'rightclick', 'mousemove', 'mousedown', 'mouseup', 'mouseover', 'mouseout',
              'dragstart', 'dragging', 'dragend', 'movestart', 'moving', 'moveend',
              'zoomstart', 'zooming', 'zoomend', 'resize', 'tilesloaded', 'maptypechange',
              'touchstart', 'touchmove', 'touchend', 'longpress',
              'headingchange', 'tiltchange',
            ].map(evt => (
              <button
                key={evt}
                className={subscribedEvents.includes(evt) ? 'active' : ''}
                onClick={() => toggleEvent(evt)}
                style={{ fontSize: 11 }}
              >
                {evt}
              </button>
            ))}
          </div>
          <div className="event-log">
            {eventLog.length === 0 ? <div className="muted">订阅事件后在此查看日志</div> :
              eventLog.map((line, i) => <div key={i}>{line}</div>)}
          </div>
        </section>

        {/* ─── 10. 3.0-only ─── */}
        <section>
          <h3>10. 3.0-only 命令</h3>
          <div className="btn-group">
            <button onClick={() => call('enableMapClick', () => mapRef?.enableMapClick())}>enableMapClick</button>
            <button onClick={() => call('disableMapClick', () => mapRef?.disableMapClick())}>disableMapClick</button>
            <button onClick={() => call('enable3DBuilding', () => mapRef?.enable3DBuilding())}>enable3DBuilding</button>
            <button onClick={() => call('disable3DBuilding', () => mapRef?.disable3DBuilding())}>disable3DBuilding</button>
            <button onClick={() => call('setCurrentCity', () => mapRef?.setCurrentCity('北京'))}>setCurrentCity</button>
            <button onClick={() => call('setPanorama', () => mapRef?.setPanorama(null))}>setPanorama(null)</button>
            <button onClick={() => call('getPanorama', () => mapRef?.getPanorama())}>getPanorama</button>
            <button onClick={() => call('addHotspot', () => mapRef?.addHotspot({ __brand: 'OverlayHandle', raw: null, type: 'hotspot' }))}>addHotspot</button>
            <button onClick={() => call('clearHotspots', () => mapRef?.clearHotspots())}>clearHotspots</button>
          </div>
        </section>

        {/* ─── 11. 4.0+ 实用 ─── */}
        <section>
          <h3>11. 4.0+ 实用方法</h3>
          <div className="btn-group">
            <button onClick={() => call('getScreenshot', () => mapRef?.getScreenshot())}>getScreenshot</button>
            <button onClick={() => call('getContainerSize', () => mapRef?.getContainerSize())}>getContainerSize</button>
            <button onClick={() => call('getZoomUnits', () => mapRef?.getZoomUnits())}>getZoomUnits</button>
            <button onClick={() => call('getMapCoordType', () => mapRef?.getMapCoordType())}>getMapCoordType</button>
            <button onClick={() => call('getAreaStyleId', () => mapRef?.getAreaStyleId())}>getAreaStyleId</button>
            <button onClick={() => call('getProjection', () => !!mapRef?.getProjection())}>getProjection</button>
            <button onClick={() => call('getSolarInfo', () => mapRef?.getSolarInfo(new Date()))}>getSolarInfo</button>
            <button onClick={() => call('getPoiByUid', () => mapRef?.getPoiByUid('test', () => {}))}>getPoiByUid</button>
            <button onClick={() => call('getEarth', () => mapRef?.getEarth())}>getEarth</button>
            <button onClick={() => call('showEarthBoundary', () => mapRef?.showEarthBoundary())}>showEarthBoundary</button>
            <button onClick={() => call('hideEarthBoundary', () => mapRef?.hideEarthBoundary())}>hideEarthBoundary</button>
            <button onClick={() => call('setEarthMaxZoom', () => mapRef?.setEarthMaxZoom(10))}>setEarthMaxZoom(10)</button>
            <button onClick={() => call('showStreetLayer', () => mapRef?.showStreetLayer(true))}>showStreetLayer</button>
            <button onClick={() => call('hideStreetLayer', () => mapRef?.hideStreetLayer())}>hideStreetLayer</button>
            <button onClick={() => call('showVectorStreetLayer', () => mapRef?.showVectorStreetLayer())}>showVectorStreetLayer</button>
            <button onClick={() => call('changeLanguage', () => mapRef?.changeLanguage('ZH_CN'))}>changeLanguage</button>
            <button onClick={() => call('enablePreferredLanguage', () => mapRef?.enablePreferredLanguage('ZH_CN'))}>enablePreferredLanguage</button>
            <button onClick={() => call('addSpots', () => mapRef?.addSpots([]))}>addSpots([])</button>
            <button onClick={() => call('clearSpots', () => mapRef?.clearSpots())}>clearSpots</button>
            <button onClick={() => call('addAreaSpot', () => mapRef?.addAreaSpot([116.4, 39.9, 116.5, 39.95]))}>addAreaSpot</button>
            <button onClick={() => call('clearAreaSpots', () => mapRef?.clearAreaSpots())}>clearAreaSpots</button>
            <button onClick={() => call('addMapLabels', () => mapRef?.addMapLabels([]))}>addMapLabels([])</button>
            <button onClick={() => call('clearLabels', () => mapRef?.clearLabels())}>clearLabels</button>
            <button onClick={() => call('setLock', () => mapRef?.setLock(true))}>setLock(true)</button>
            <button onClick={() => call('getPrivateRegions', () => mapRef?.getPrivateRegions())}>getPrivateRegions</button>
            <button onClick={() => call('setPrivateStatus', () => mapRef?.setPrivateStatus(true))}>setPrivateStatus(true)</button>
            <button onClick={() => call('addFocusMask', () => mapRef?.addFocusMask({}))}>addFocusMask</button>
            <button onClick={() => call('clearFocusMasks', () => mapRef?.clearFocusMasks())}>clearFocusMasks</button>
            <button onClick={() => call('addCustomHtmlLayer', () => mapRef?.addCustomHtmlLayer({}))}>addCustomHtmlLayer</button>
          </div>
        </section>

        {/* ─── 杂项 ─── */}
        <section>
          <h3>杂项</h3>
          <div className="btn-group">
            <button onClick={() => call('setCopyrightOffset', () => mapRef?.setCopyrightOffset({}, {}))}>setCopyrightOffset</button>
            <button onClick={() => call('setOverlayMoveCursor', () => mapRef?.setOverlayMoveCursor('move'))}>setOverlayMoveCursor</button>
            <button onClick={() => call('setBounds', () => mapRef?.setBounds({ sw: { lng: 116, lat: 39 }, ne: { lng: 117, lat: 40 } }))}>setBounds</button>
            <button onClick={() => call('restrictBounds', () => mapRef?.restrictBounds({ sw: { lng: 116, lat: 39 }, ne: { lng: 117, lat: 40 } }))}>restrictBounds</button>
            <button onClick={() => call('showOverlayContainer', () => mapRef?.showOverlayContainer())}>showOverlayContainer</button>
            <button onClick={() => call('hideOverlayContainer', () => mapRef?.hideOverlayContainer())}>hideOverlayContainer</button>
            <button onClick={() => call('checkResize', () => mapRef?.checkResize())}>checkResize</button>
            <button onClick={() => call('resize', () => mapRef?.resize())}>resize</button>
            <button onClick={() => call('resetSpotStatus', () => mapRef?.resetSpotStatus())}>resetSpotStatus</button>
            <button onClick={() => call('setCustomArea', () => mapRef?.setCustomArea({}))}>setCustomArea</button>
            <button onClick={() => call('addParkingSpot', () => mapRef?.addParkingSpot({}))}>addParkingSpot</button>
            <button onClick={() => call('setOptions', () => mapRef?.setOptions({}))}>setOptions</button>
            <button onClick={() => call('setDisplayOptions', () => mapRef?.setDisplayOptions({}))}>setDisplayOptions</button>
          </div>
        </section>

        <section>
          <h3>常量验证</h3>
          <div className="btn-group">
            <button onClick={() => setResult(`BMAP_ANCHOR_TOP_LEFT = ${BMAP_ANCHOR_TOP_LEFT}`)}>BMAP_ANCHOR_TOP_LEFT</button>
            <button onClick={() => setResult(`BMAP_NORMAL_MAP = ${BMAP_NORMAL_MAP}`)}>BMAP_NORMAL_MAP</button>
          </div>
        </section>
      </div>
    </div>
  );
}
