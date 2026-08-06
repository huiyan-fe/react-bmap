import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Map,
  useMapStatus,
  useCapabilities,
  useBMapContext,
  UnsupportedCapabilityError,
  tryOp,
  NavigationControl,
  ScaleControl,
  BMAP_ANCHOR_TOP_LEFT,
  BMAP_ANCHOR_BOTTOM_LEFT,
} from 'react-bmap';
import type { MapRef, MapSnapshot, Point } from 'react-bmap';
import { BEIJING } from '../TestProvider';

/* ────────────────────────────────────────────────────────────
 * Map 综合测试页（重构版）
 *
 * 设计思路：
 *  - 地图全屏铺底，控件以浮层 glass 面板形式叠加
 *  - 右侧 Tab 抽屉收纳 13 组功能（视野/交互/样式/命令/查询/坐标/事件/3D/4.0+/杂项/能力）
 *  - 左上角实时状态 HUD（useMapStatus）
 *  - 左下角事件日志（可折叠）
 *  - 底部城市快捷切换条 + 地图类型切换
 * ──────────────────────────────────────────────────────────── */

// 内嵌状态探针
function StateProbe({ onChange }: { onChange: (s: MapSnapshot | null) => void }) {
  const status = useMapStatus();
  useEffect(() => { onChange(status); }, [status, onChange]);
  return null;
}

const CITIES: { name: string; lng: number; lat: number; zoom: number }[] = [
  { name: '北京', lng: 116.404, lat: 39.915, zoom: 11 },
  { name: '上海', lng: 121.474, lat: 31.230, zoom: 11 },
  { name: '广州', lng: 113.264, lat: 23.129, zoom: 11 },
  { name: '深圳', lng: 114.057, lat: 22.543, zoom: 11 },
  { name: '杭州', lng: 120.155, lat: 30.274, zoom: 11 },
  { name: '成都', lng: 104.066, lat: 30.572, zoom: 11 },
  { name: '西安', lng: 108.940, lat: 34.341, zoom: 11 },
  { name: '武汉', lng: 114.305, lat: 30.593, zoom: 11 },
];

const TABS = [
  { id: 'view', label: '视野', icon: '🌐' },
  { id: 'interact', label: '交互', icon: '⚙' },
  { id: 'style', label: '样式', icon: '🎨' },
  { id: 'command', label: '命令', icon: '⚡' },
  { id: 'query', label: '查询', icon: '🔍' },
  { id: 'coord', label: '坐标', icon: '📐' },
  { id: 'event', label: '事件', icon: '📡' },
  { id: 'v3', label: '3.0', icon: '📱' },
  { id: 'v4', label: '4.0+', icon: '🚀' },
  { id: 'misc', label: '杂项', icon: '📦' },
] as const;

type TabId = typeof TABS[number]['id'];

// ── styleJson 预设（参考百度地图个性化编辑器） ──
const STYLE_DARK = [
  { featureType: 'all', elementType: 'geometry', stylers: { color: '#242f3e' } },
  { featureType: 'all', elementType: 'labels.text.fill', stylers: { color: '#746855' } },
  { featureType: 'all', elementType: 'labels.text.stroke', stylers: { color: '#192028' } },
  { featureType: 'road', elementType: 'geometry', stylers: { color: '#38414e' } },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: { color: '#212a37' } },
  { featureType: 'water', elementType: 'geometry', stylers: { color: '#17263c' } },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: { color: '#515c6d' } },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: { color: '#7a8694' } },
  { featureType: 'landscape', elementType: 'geometry', stylers: { color: '#1f2a35' } },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: { color: '#7a8b99' } },
];

const STYLE_MIDNIGHT = [
  { featureType: 'all', elementType: 'geometry', stylers: { color: '#0b1a2a' } },
  { featureType: 'all', elementType: 'labels.text.fill', stylers: { color: '#677585' } },
  { featureType: 'all', elementType: 'labels.text.stroke', stylers: { color: '#020c14' } },
  { featureType: 'road', elementType: 'geometry', stylers: { color: '#152a3e' } },
  { featureType: 'water', elementType: 'geometry', stylers: { color: '#06101a' } },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: { color: '#3a4a5a' } },
  { featureType: 'landscape', elementType: 'geometry', stylers: { color: '#0e1e2c' } },
  { featureType: 'poi', elementType: 'all', stylers: { visibility: 'off' } },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: { color: '#4a5a6a' } },
];

const STYLE_GRAYSCALE = [
  { featureType: 'all', elementType: 'geometry', stylers: { color: '#e0e0e0' } },
  { featureType: 'all', elementType: 'labels.text.fill', stylers: { color: '#666666' } },
  { featureType: 'all', elementType: 'labels.text.stroke', stylers: { color: '#ffffff' } },
  { featureType: 'road', elementType: 'geometry', stylers: { color: '#cccccc' } },
  { featureType: 'water', elementType: 'geometry', stylers: { color: '#d4d4d4' } },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: { color: '#999999' } },
  { featureType: 'landscape', elementType: 'geometry', stylers: { color: '#dadada' } },
  { featureType: 'poi', elementType: 'geometry', stylers: { color: '#d8d8d8' } },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: { color: '#777777' } },
];

const STYLE_BLUE = [
  { featureType: 'all', elementType: 'geometry', stylers: { color: '#1e5a8a' } },
  { featureType: 'all', elementType: 'labels.text.fill', stylers: { color: '#a0d0ff' } },
  { featureType: 'all', elementType: 'labels.text.stroke', stylers: { color: '#0a3a5a' } },
  { featureType: 'road', elementType: 'geometry', stylers: { color: '#2a7ab5' } },
  { featureType: 'water', elementType: 'geometry', stylers: { color: '#0a2540' } },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: { color: '#5a9ad0' } },
  { featureType: 'landscape', elementType: 'geometry', stylers: { color: '#1a4a7a' } },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: { color: '#80b8e0' } },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: { color: '#90c8f0' } },
];

const STYLE_RED = [
  { featureType: 'all', elementType: 'geometry', stylers: { color: '#3a1a1a' } },
  { featureType: 'all', elementType: 'labels.text.fill', stylers: { color: '#e0a0a0' } },
  { featureType: 'all', elementType: 'labels.text.stroke', stylers: { color: '#2a0a0a' } },
  { featureType: 'road', elementType: 'geometry', stylers: { color: '#5a2a2a' } },
  { featureType: 'water', elementType: 'geometry', stylers: { color: '#1a0505' } },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: { color: '#a05050' } },
  { featureType: 'landscape', elementType: 'geometry', stylers: { color: '#3a1515' } },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: { color: '#c07070' } },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: { color: '#d08080' } },
];

export function MapTestPage() {
  const caps = useCapabilities();
  const { version } = useBMapContext();
  const [status, setStatus] = useState<MapSnapshot | null>(null);
  const [mapRef, setMapRef] = useState<MapRef | null>(null);
  const [result, setResult] = useState('');
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('view');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [logOpen, setLogOpen] = useState(false);

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
  const [mapType, setMapType] = useState<number | undefined>(undefined);
  const [defaultCursor, setDefaultCursor] = useState<string | undefined>(undefined);
  const [draggingCursor, setDraggingCursor] = useState<string | undefined>(undefined);

  // 受控样式（React 方式，不通过 ref）
  const [theme, setTheme] = useState<string | undefined>(undefined);
  const [mapStyleV2, setMapStyleV2State] = useState<Record<string, unknown> | undefined>(undefined);

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

  // 视角动画实例引用（cancel 需要传回动画对象）
  const animRef = useRef<any>(null);

  // 运行时地图类型常量（v3 为全局变量 window.BMAP_*，v4 在 BMap 命名空间下）
  const w = window as any;
  const RT_NORMAL = w.BMap?.BMAP_NORMAL_MAP ?? w.BMAP_NORMAL_MAP ?? 1;
  const RT_SATELLITE = w.BMap?.BMAP_SATELLITE_MAP ?? w.BMAP_SATELLITE_MAP ?? 2;
  const RT_HYBRID = w.BMap?.BMAP_HYBRID_MAP ?? w.BMAP_HYBRID_MAP ?? 3;
  const RT_EARTH = w.BMap?.BMAP_EARTH_MAP ?? w.BMAP_EARTH_MAP ?? 4;

  const call = useCallback((name: string, fn: () => unknown) => {
    try {
      const r = tryOp(fn);
      if (r.ok) {
        const v = r.value;
        let display: string;
        if (v === undefined) display = 'ok';
        else if (typeof v === 'object' && v !== null) {
          try { display = JSON.stringify(v).slice(0, 300); }
          catch { display = `[${v.constructor?.name || 'Object'}] (无法序列化)`; }
        } else display = String(v).slice(0, 300);
        setResult(`${name}: ${display}`);
      } else {
        setResult(`${name}: ❌ unsupported (${r.capability})`);
      }
    } catch (e) {
      setResult(`${name}: ❌ error (${e instanceof Error ? e.message : String(e)})`);
    }
  }, []);

  // 事件日志 handler（React 方式，通过 onClick / onZoomEnd 等 prop 传给 Map）
  const logHandler = useCallback((evt: string) => (raw: any) => {
    const t = new Date().toLocaleTimeString();
    const pt = raw?.point ? `${raw.point.lng?.toFixed(4)},${raw.point.lat?.toFixed(4)}` : '';
    setEventLog(s => [`${t} ${evt}${pt ? ' @ ' + pt : ''}`, ...s].slice(0, 50));
  }, []);

  // 构建事件 prop 对象（只包含已订阅的事件）
  const eventProps = useMemo(() => {
    const props: Record<string, (e: any) => void> = {};
    const MAP: Record<string, string> = {
      click: 'onClick', dblclick: 'onDblClick', rightclick: 'onRightClick',
      mousemove: 'onMouseMove', mousedown: 'onMouseDown', mouseup: 'onMouseUp',
      mouseover: 'onMouseOver', mouseout: 'onMouseOut',
      dragstart: 'onDragStart', dragging: 'onDragging', dragend: 'onDragEnd',
      movestart: 'onMoveStart', moving: 'onMoving', moveend: 'onMoveEnd',
      zoomstart: 'onZoomStart', zooming: 'onZooming', zoomend: 'onZoomEnd',
      resize: 'onResize', tilesloaded: 'onTilesLoaded', maptypechange: 'onMapTypeChange',
      touchstart: 'onTouchStart', touchmove: 'onTouchMove', touchend: 'onTouchEnd',
      longpress: 'onLongPress',
    };
    for (const evt of subscribedEvents) {
      const prop = MAP[evt];
      if (prop) props[prop] = logHandler(evt);
    }
    return props;
  }, [subscribedEvents, logHandler]);

  const toggleEvent = (evt: string) => {
    setSubscribedEvents(s => s.includes(evt) ? s.filter(e => e !== evt) : [...s, evt]);
  };

  const interactionSwitches: Array<[string, boolean | undefined, (v: boolean | undefined) => void]> = [
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
  ];

  const resetAllInteractions = () => {
    interactionSwitches.forEach(([, , setter]) => setter(undefined));
  };

  const eventList = useMemo(() => [
    'click', 'dblclick', 'rightclick', 'mousemove', 'mousedown', 'mouseup', 'mouseover', 'mouseout',
    'dragstart', 'dragging', 'dragend', 'movestart', 'moving', 'moveend',
    'zoomstart', 'zooming', 'zoomend', 'resize', 'tilesloaded', 'maptypechange',
    'touchstart', 'touchmove', 'touchend', 'longpress',
  ], []);

  const queryMethods = useMemo(() => [
    'getCenter', 'getZoom', 'getBounds', 'getSize', 'getMinZoom', 'getMaxZoom',
    'getHeading', 'getTilt', 'isLoaded', 'getCoordType', 'getMapType', 'getMapTypeId',
    'getMapStyleId', 'getRenderType', 'isCanvasMap', 'getDefaultCursor', 'getDraggingCursor',
  ], []);

  const coordMethods = useMemo(() => [
    ['pointToPixel', () => mapRef?.pointToPixel({ lng: 116.404, lat: 39.915 })],
    ['pixelToPoint', () => mapRef?.pixelToPoint({ x: 400, y: 300 })],
    ['pointToOverlayPixel', () => mapRef?.pointToOverlayPixel({ lng: 116.404, lat: 39.915 })],
    ['overlayPixelToPoint', () => mapRef?.overlayPixelToPoint({ x: 400, y: 300 })],
    ['getDistance', () => mapRef?.getDistance({ lng: 116.404, lat: 39.915 }, { lng: 116.504, lat: 39.955 })],
    ['lnglatToMercator', () => mapRef?.lnglatToMercator(116.404, 39.915)],
    ['mercatorToLnglat', () => mapRef?.mercatorToLnglat(12958190, 4825923)],
  ] as const, [mapRef]);

  const v4Methods = useMemo(() => [
    'getScreenshot', 'getContainerSize', 'getZoomUnits', 'getMapCoordType', 'getAreaStyleId',
    'getSolarInfo', 'getPoiByUid', 'getEarth', 'showEarthBoundary', 'hideEarthBoundary',
    'setEarthMaxZoom', 'setEarthMinZoom', 'showStreetLayer', 'hideStreetLayer',
    'showVectorStreetLayer', 'hideVectorStreetLayer', 'setNormalMapDisplay', 'getVectorContainer',
    'changeLanguage', 'enablePreferredLanguage', 'addAreaSpot',
    'clearAreaSpots', 'addMapLabels', 'clearLabels', 'setLock', 'getPrivateRegions',
    'setPrivateStatus', 'addFocusMask', 'clearFocusMasks',
  ], []);

  const miscMethods = useMemo(() => [
    'setCopyrightOffset', 'setOverlayMoveCursor', 'setBounds', 'restrictBounds',
    'showOverlayContainer', 'hideOverlayContainer', 'checkResize', 'resize',
    'resetSpotStatus', 'addParkingSpot', 'setOptions', 'setDisplayOptions',
  ], []);



  return (
    <div className="map-test-page">
      <style>{`
        .map-test-page {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #0a0a0a;
        }
        .map-test-page .map-canvas {
          position: absolute;
          inset: 0;
        }
        /* ── Glass 面板基础 ── */
        .mp-glass {
          background: rgba(20, 25, 35, 0.82);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          color: #e8eaed;
        }
        /* ── 状态 HUD（左上） ── */
        .mp-hud {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 20;
          padding: 12px 16px;
          min-width: 200px;
          font-size: 12px;
          font-family: 'SF Mono', Monaco, Consolas, monospace;
        }
        .mp-hud .hud-title {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #8ab4f8;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .mp-hud .hud-row {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .mp-hud .hud-row:last-child { border: none; }
        .mp-hud .hud-label { color: #9aa0a6; }
        .mp-hud .hud-val { color: #8ab4f8; font-weight: 600; }
        /* ── 方法结果（左上，HUD 下方） ── */
        .mp-result {
          position: absolute;
          top: 280px;
          left: 14px;
          z-index: 20;
          max-width: 340px;
          padding: 10px 14px;
          font-size: 12px;
          font-family: 'SF Mono', Monaco, Consolas, monospace;
          color: #81c995;
          border-left: 3px solid #34a853;
          word-break: break-all;
          display: ${result ? 'block' : 'none'};
        }
        /* ── 右侧 Tab 抽屉 ── */
        .mp-drawer {
          position: absolute;
          top: 14px;
          right: 14px;
          bottom: 64px;
          z-index: 20;
          width: 400px;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .mp-drawer.collapsed {
          transform: translateX(380px);
        }
        .mp-drawer .drawer-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
          padding: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .mp-drawer .drawer-tab {
          padding: 6px 10px;
          font-size: 12px;
          color: #9aa0a6;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .mp-drawer .drawer-tab:hover {
          background: rgba(255,255,255,0.06);
          color: #e8eaed;
        }
        .mp-drawer .drawer-tab.active {
          background: rgba(138, 180, 248, 0.15);
          color: #8ab4f8;
          border-color: rgba(138, 180, 248, 0.3);
        }
        .mp-drawer .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 14px 16px;
        }
        .mp-drawer .drawer-body::-webkit-scrollbar { width: 6px; }
        .mp-drawer .drawer-body::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
        }
        .mp-drawer .drawer-toggle {
          position: absolute;
          left: -28px;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 56px;
          background: rgba(20, 25, 35, 0.82);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.08);
          border-right: none;
          border-radius: 8px 0 0 8px;
          color: #8ab4f8;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* ── 抽屉内表单元素 ── */
        .mp-section { margin-bottom: 18px; }
        .mp-section-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #8ab4f8;
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid rgba(138,180,248,0.15);
        }
        .mp-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }
        .mp-row label {
          font-size: 12px;
          color: #9aa0a6;
          min-width: fit-content;
        }
        .mp-input {
          flex: 1;
          min-width: 60px;
          padding: 5px 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          color: #e8eaed;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s;
        }
        .mp-input:focus { border-color: #8ab4f8; }
        .mp-input::placeholder { color: #5f6368; }
        .mp-range {
          width: 100%;
          accent-color: #8ab4f8;
          cursor: pointer;
        }
        .mp-btn {
          padding: 5px 12px;
          background: rgba(138, 180, 248, 0.12);
          border: 1px solid rgba(138, 180, 248, 0.25);
          border-radius: 6px;
          color: #8ab4f8;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .mp-btn:hover {
          background: rgba(138, 180, 248, 0.22);
          border-color: rgba(138, 180, 248, 0.5);
        }
        .mp-btn.active {
          background: #8ab4f8;
          color: #0a0a0a;
          font-weight: 600;
        }
        .mp-btn.danger {
          color: #f28b82;
          border-color: rgba(242, 139, 130, 0.25);
          background: rgba(242, 139, 130, 0.08);
        }
        .mp-btn.danger:hover {
          background: rgba(242, 139, 130, 0.18);
        }
        .mp-btn-group {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .mp-chk {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #cdd3dc;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.15s;
        }
        .mp-chk:hover { background: rgba(255,255,255,0.08); }
        .mp-chk input { accent-color: #8ab4f8; width: 14px; height: 14px; }
        .mp-code {
          font-family: 'SF Mono', Monaco, Consolas, monospace;
          font-size: 11px;
          color: #8ab4f8;
          background: rgba(138,180,248,0.08);
          padding: 1px 6px;
          border-radius: 3px;
        }
        .mp-cap-tag {
          display: inline-block;
          padding: 1px 6px;
          border-radius: 3px;
          font-size: 10px;
          font-family: monospace;
        }
        .mp-cap-tag.ok { background: rgba(52,168,83,0.15); color: #81c995; border: 1px solid rgba(52,168,83,0.3); }
        .mp-cap-tag.no { background: rgba(234,67,53,0.15); color: #f28b82; border: 1px solid rgba(234,67,53,0.3); }
        /* ── 事件日志（左下） ── */
        .mp-event-log {
          position: absolute;
          bottom: 64px;
          left: 14px;
          z-index: 20;
          width: 340px;
          max-height: 200px;
          display: flex;
          flex-direction: column;
        }
        .mp-event-log .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
        }
        .mp-event-log .log-title {
          font-size: 12px;
          color: #8ab4f8;
          font-weight: 600;
        }
        .mp-event-log .log-count {
          font-size: 11px;
          color: #9aa0a6;
        }
        .mp-event-log .log-body {
          flex: 1;
          overflow-y: auto;
          padding: 8px 14px;
          max-height: 140px;
        }
        .mp-event-log .log-body::-webkit-scrollbar { width: 4px; }
        .mp-event-log .log-body::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
        }
        .mp-event-log .log-line {
          font-family: 'SF Mono', Monaco, Consolas, monospace;
          font-size: 11px;
          color: #cdd3dc;
          padding: 2px 0;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .mp-event-log .log-empty {
          font-size: 12px;
          color: #5f6368;
          padding: 12px 0;
          text-align: center;
        }
        /* ── 底部城市栏 ── */
        .mp-city-bar {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          gap: 4px;
          padding: 6px 8px;
        }
        .mp-city-btn {
          padding: 6px 14px;
          font-size: 13px;
          color: #cdd3dc;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .mp-city-btn:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }
        .mp-city-btn.active {
          background: rgba(138, 180, 248, 0.2);
          color: #8ab4f8;
          border-color: rgba(138, 180, 248, 0.3);
        }
        /* ── 能力网格 ── */
        .mp-cap-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
        }
        .mp-cap-cell {
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-family: monospace;
          text-align: center;
        }
        .mp-cap-cell.ok { background: rgba(52,168,83,0.1); color: #81c995; border: 1px solid rgba(52,168,83,0.2); }
        .mp-cap-cell.no { background: rgba(234,67,53,0.1); color: #f28b82; border: 1px solid rgba(234,67,53,0.2); }
        /* ── 滑块行 ── */
        .mp-slider-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .mp-slider-label {
          font-size: 12px;
          color: #9aa0a6;
          min-width: 64px;
        }
        .mp-slider-val {
          font-family: 'SF Mono', Monaco, Consolas, monospace;
          font-size: 12px;
          color: #8ab4f8;
          min-width: 36px;
          text-align: right;
        }
      `}</style>

      {/* ── 地图全屏 ── */}
      <div className="map-canvas">
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
          mapStyleV2={mapStyleV2}
          {...eventProps}
          onCenterChange={setCenter}
          onZoomChange={setZoom}
          onHeadingChange={setHeading}
          onTiltChange={setTilt}
          style={{ height: '100%' }}
        >
          <NavigationControl anchor={BMAP_ANCHOR_BOTTOM_LEFT} />
          <ScaleControl />
          <StateProbe onChange={setStatus} />
        </Map>
      </div>

      {/* ── 状态 HUD（左上） ── */}
      <div className="mp-glass mp-hud">
        <div className="hud-title">
          <span className="hud-dot" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#34a853' }} />
          useMapStatus
        </div>
        <div className="hud-row"><span className="hud-label">zoom</span><span className="hud-val">{status?.zoom ?? '—'}</span></div>
        <div className="hud-row"><span className="hud-label">center</span><span className="hud-val">{status?.center ? `${status.center.lng.toFixed(4)}, ${status.center.lat.toFixed(4)}` : '—'}</span></div>
        <div className="hud-row"><span className="hud-label">heading</span><span className="hud-val">{status?.heading ?? '—'}</span></div>
        <div className="hud-row"><span className="hud-label">tilt</span><span className="hud-val">{status?.tilt ?? '—'}</span></div>
        <div className="hud-row"><span className="hud-label">size</span><span className="hud-val">{status?.size ? `${status.size.width}×${status.size.height}` : '—'}</span></div>
        <div className="hud-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <span className="hud-label">bounds</span>
          <span className="hud-val" style={{ fontSize: 10 }}>
            {status?.bounds ? `${status.bounds.sw.lng.toFixed(2)},${status.bounds.sw.lat.toFixed(2)} → ${status.bounds.ne.lng.toFixed(2)},${status.bounds.ne.lat.toFixed(2)}` : '—'}
          </span>
        </div>
      </div>

      {/* ── 方法结果（左上 HUD 下方） ── */}
      {result && (
        <div className="mp-glass mp-result">{result}</div>
      )}

      {/* ── 事件日志（左下，可折叠） ── */}
      <div className="mp-glass mp-event-log" style={{ display: logOpen ? 'flex' : 'none' }}>
        <div className="log-header" onClick={() => setLogOpen(false)}>
          <span className="log-title">📡 Event Log</span>
          <span className="log-count">{eventLog.length} 条</span>
        </div>
        <div className="log-body">
          {eventLog.length === 0
            ? <div className="log-empty">订阅事件后在此查看日志</div>
            : eventLog.map((line, i) => <div key={i} className="log-line">{line}</div>)}
        </div>
      </div>

      {/* ── 右侧 Tab 抽屉 ── */}
      <div className={`mp-drawer ${drawerOpen ? '' : 'collapsed'}`}>
        <div className="mp-glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Tab 栏 */}
          <div className="drawer-tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`drawer-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 内容 */}
          <div className="drawer-body">
            {/* ════════ 视野 ════════ */}
            {activeTab === 'view' && (
              <>
                <div className="mp-section">
                  <div className="mp-section-title">中心点（受控 props）</div>
                  <div className="mp-row">
                    <span className="mp-code">{center.lng.toFixed(4)}, {center.lat.toFixed(4)}</span>
                  </div>
                </div>
                <div className="mp-section">
                  <div className="mp-section-title">缩放级别</div>
                  <div className="mp-row">
                    <button className="mp-btn" onClick={() => setZoom(z => Math.max(3, z - 1))}>−</button>
                    <input className="mp-input" type="number" min={3} max={21} step={1} value={zoom} onChange={e => { const v = Number(e.target.value); if (v >= 3 && v <= 21) setZoom(v); }} style={{ textAlign: 'center', maxWidth: 80 }} />
                    <button className="mp-btn" onClick={() => setZoom(z => Math.min(21, z + 1))}>+</button>
                  </div>
                </div>
                <div className="mp-section">
                  <div className="mp-section-title">视角控制 <span className={`mp-cap-tag ${caps.has('Map.setHeading') ? 'ok' : 'no'}`}>{caps.has('Map.setHeading') ? 'v4+' : 'v3 ✗'}</span></div>
                  <div className="mp-slider-row">
                    <span className="mp-slider-label">heading</span>
                    <input type="range" min={0} max={360} value={heading} onChange={e => setHeading(Number(e.target.value))} className="mp-range" />
                    <span className="mp-slider-val">{heading}°</span>
                  </div>
                  <div className="mp-slider-row">
                    <span className="mp-slider-label">tilt</span>
                    <input type="range" min={0} max={73} value={tilt} onChange={e => setTilt(Number(e.target.value))} className="mp-range" />
                    <span className="mp-slider-val">{tilt}°</span>
                  </div>
                </div>
                <div className="mp-section">
                  <div className="mp-section-title">视角动画（v4+） <span className={`mp-cap-tag ${caps.has('Map.startViewAnimation') ? 'ok' : 'no'}`}>{caps.has('Map.startViewAnimation') ? 'v4+' : 'v3 ✗'}</span></div>
                  <div style={{ fontSize: 11, color: '#9aa0a6', marginBottom: 8 }}>
                    点击「长动画」启动 8 秒动画，进行中可 cancel 终止。<br/>
                    ⚠ pause/continue 为 SDK 未公开方法，4.0 下无效
                  </div>
                  <div className="mp-btn-group">
                    <button className="mp-btn" onClick={() => {
                      const sdk: any = (window as any).BMap;
                      if (!sdk?.ViewAnimation) { setResult('startViewAnimation: ❌ ViewAnimation 未定义（v3 不支持）'); return; }
                      const keyframes = [
                        { center: new sdk.Point(center.lng, center.lat), zoom, heading: 0, tilt: 0, percentage: 0 },
                        { center: new sdk.Point(center.lng, center.lat), zoom, heading: 180, tilt: 60, percentage: 1 },
                      ];
                      const opts = { duration: 8000, delay: 0, interation: 1 };
                      const anim = new sdk.ViewAnimation(keyframes, opts);
                      animRef.current = anim;
                      call('startViewAnimation(8s)', () => mapRef?.startViewAnimation(anim));
                    }}>▶ 长动画(8s)</button>
                    <button className="mp-btn" onClick={() => call('setHeading(90)', () => mapRef?.setHeading(90))}>heading→90°</button>
                    <button className="mp-btn" onClick={() => call('setTilt(45)', () => mapRef?.setTilt(45))}>tilt→45°</button>
                    <button className="mp-btn" onClick={() => call('getCurrentMaxTilt', () => mapRef?.getCurrentMaxTilt())}>maxTilt</button>
                    <button className="mp-btn" onClick={() => call('cancelViewAnimation', () => mapRef?.cancelViewAnimation(animRef.current ?? undefined))}>✕ cancel</button>
                  </div>
                </div>
              </>
            )}

            {/* ════════ 交互 ════════ */}
            {activeTab === 'interact' && (
              <>
                <div className="mp-section">
                  <div className="mp-section-title">交互开关（受控 enable*）</div>
                  <div className="mp-row">
                    {interactionSwitches.map(([key, val, setter]) => (
                      <label key={key} className="mp-chk">
                        <input
                          type="checkbox"
                          checked={val ?? false}
                          ref={el => { if (el && val === undefined) el.indeterminate = true; }}
                          onChange={e => setter(e.target.checked as any)}
                        />
                        {key.replace(/^enable/, '')}
                      </label>
                    ))}
                  </div>
                  <button className="mp-btn danger" onClick={resetAllInteractions} style={{ marginTop: 6 }}>全部交还默认</button>
                </div>
                <div className="mp-section">
                  <div className="mp-section-title">缩放范围</div>
                  <div className="mp-row">
                    <label>minZoom</label>
                    <input className="mp-input" type="number" placeholder="未设置" value={minZoom ?? ''} onChange={e => setMinZoom(e.target.value === '' ? undefined : Number(e.target.value))} />
                    <label>maxZoom</label>
                    <input className="mp-input" type="number" placeholder="未设置" value={maxZoom ?? ''} onChange={e => setMaxZoom(e.target.value === '' ? undefined : Number(e.target.value))} />
                  </div>
                </div>
                <div className="mp-section">
                  <div className="mp-section-title">光标</div>
                  <input className="mp-input" type="text" placeholder="defaultCursor" value={defaultCursor ?? ''} onChange={e => setDefaultCursor(e.target.value || undefined)} style={{ width: '100%', marginBottom: 6 }} />
                  <input className="mp-input" type="text" placeholder="draggingCursor" value={draggingCursor ?? ''} onChange={e => setDraggingCursor(e.target.value || undefined)} style={{ width: '100%' }} />
                </div>
              </>
            )}

            {/* ════════ 样式 ════════ */}
            {activeTab === 'style' && (
              <>
                <div className="mp-section">
                  <div className="mp-section-title">地图类型</div>
                  <div className="mp-btn-group">
                    <button className={`mp-btn ${mapType === RT_NORMAL ? 'active' : ''}`} onClick={() => setMapType(RT_NORMAL)}>普通</button>
                    <button className={`mp-btn ${mapType === RT_SATELLITE ? 'active' : ''}`} onClick={() => setMapType(RT_SATELLITE)}>卫星</button>
                    <button className={`mp-btn ${mapType === RT_HYBRID ? 'active' : ''}`} onClick={() => setMapType(RT_HYBRID)}>混合</button>
                    <button className={`mp-btn ${mapType === RT_EARTH ? 'active' : ''} ${version === '3.0' ? 'danger' : ''}`} onClick={() => setMapType(RT_EARTH)} disabled={version === '3.0'}>地球 {version === '3.0' && '✗'}</button>
                  </div>
                </div>
                <div className="mp-section">
                  <div className="mp-section-title">主题 <span className={`mp-cap-tag ${version !== '3.0' ? 'ok' : 'no'}`}>{version !== '3.0' ? 'v4+' : 'v3 ✗'}</span></div>
                  <div className="mp-btn-group">
                    <button className={`mp-btn ${theme === 'light' ? 'active' : ''} ${version === '3.0' ? 'danger' : ''}`} onClick={() => setTheme('light')} disabled={version === '3.0'}>Light</button>
                    <button className={`mp-btn ${theme === 'dark' ? 'active' : ''} ${version === '3.0' ? 'danger' : ''}`} onClick={() => setTheme('dark')} disabled={version === '3.0'}>Dark</button>
                    <button className="mp-btn" onClick={() => setTheme(undefined)} disabled={version === '3.0'}>清除</button>
                  </div>
                </div>
                <div className="mp-section">
                  <div className="mp-section-title">个性化样式（mapStyleV2 受控 prop）</div>
                  <div style={{ fontSize: 11, color: '#9aa0a6', marginBottom: 8 }}>通过 styleJson 自定义底图样式</div>
                  <div className="mp-btn-group">
                    <button className="mp-btn" onClick={() => setMapStyleV2State({ styleJson: [] })}>清除</button>
                    <button className="mp-btn" onClick={() => setMapStyleV2State({ styleJson: STYLE_DARK })}>暗色</button>
                    <button className="mp-btn" onClick={() => setMapStyleV2State({ styleJson: STYLE_MIDNIGHT })}>午夜</button>
                    <button className="mp-btn" onClick={() => setMapStyleV2State({ styleJson: STYLE_GRAYSCALE })}>灰度</button>
                    <button className="mp-btn" onClick={() => setMapStyleV2State({ styleJson: STYLE_BLUE })}>清新蓝</button>
                    <button className="mp-btn" onClick={() => setMapStyleV2State({ styleJson: STYLE_RED })}>红色</button>
                  </div>
                </div>
                <div className="mp-section">
                  <div className="mp-section-title">常量验证</div>
                  <div className="mp-btn-group">
                    <button className="mp-btn" onClick={() => setResult(`BMAP_ANCHOR_TOP_LEFT = ${BMAP_ANCHOR_TOP_LEFT}`)}>ANCHOR_TOP_LEFT</button>
                    <button className="mp-btn" onClick={() => setResult(`BMAP_NORMAL_MAP = ${RT_NORMAL}`)}>NORMAL_MAP</button>
                    <button className="mp-btn" onClick={() => setResult(`BMAP_SATELLITE_MAP = ${RT_SATELLITE}`)}>SATELLITE_MAP</button>
                    <button className="mp-btn" onClick={() => setResult(`BMAP_EARTH_MAP = ${RT_EARTH}`)}>EARTH_MAP</button>
                  </div>
                </div>
              </>
            )}

            {/* ════════ 命令 ════════ */}
            {activeTab === 'command' && (
              <>
                <div className="mp-section">
                  <div className="mp-section-title">动画开关</div>
                  <label className="mp-chk">
                    <input type="checkbox" checked={animate} onChange={e => setAnimate(e.target.checked)} />
                    animate（取消则传 noAnimation: true）
                  </label>
                </div>
                <div className="mp-section">
                  <div className="mp-section-title">centerAndZoom</div>
                  <div className="mp-row">
                    <input className="mp-input" type="number" value={panToLng} onChange={e => setPanToLng(e.target.value)} placeholder="lng" />
                    <input className="mp-input" type="number" value={panToLat} onChange={e => setPanToLat(e.target.value)} placeholder="lat" />
                    <input className="mp-input" type="number" value={czZoom} onChange={e => setCzZoom(e.target.value)} placeholder="zoom" style={{ maxWidth: 60 }} />
                    <button className="mp-btn" onClick={() => call('centerAndZoom', () => mapRef?.centerAndZoom({ lng: Number(panToLng), lat: Number(panToLat) }, Number(czZoom)))}>执行</button>
                  </div>
                  <div className="mp-row">
                    <input className="mp-input" type="text" value={cityInput} onChange={e => setCityInput(e.target.value)} placeholder="城市名" />
                    <button className="mp-btn" onClick={() => call('centerAndZoom(city)', () => mapRef?.centerAndZoom(cityInput || '北京', Number(czZoom)))}>centerAndZoom(city)</button>
                  </div>
                </div>
                <div className="mp-section">
                  <div className="mp-section-title">setCenter / setZoom</div>
                  <div className="mp-row">
                    <input className="mp-input" type="number" value={panToLng} onChange={e => setPanToLng(e.target.value)} placeholder="lng" />
                    <input className="mp-input" type="number" value={panToLat} onChange={e => setPanToLat(e.target.value)} placeholder="lat" />
                    <button className="mp-btn" onClick={() => call('setCenter', () => mapRef?.setCenter({ lng: Number(panToLng), lat: Number(panToLat) }, animate ? undefined : { noAnimation: true }))}>setCenter</button>
                    <button className="mp-btn" onClick={() => call('setCenter(city)', () => mapRef?.setCenter(cityInput || '北京'))}>setCenter(city)</button>
                  </div>
                  <div className="mp-row">
                    <input className="mp-input" type="number" value={czZoom} onChange={e => setCzZoom(e.target.value)} placeholder="zoom" style={{ maxWidth: 60 }} />
                    <button className="mp-btn" onClick={() => call('setZoom', () => mapRef?.setZoom(Number(czZoom), animate ? undefined : { noAnimation: true }))}>setZoom</button>
                  </div>
                </div>
                <div className="mp-section">
                  <div className="mp-section-title">panTo / panBy</div>
                  <div className="mp-row">
                    <input className="mp-input" type="number" value={panToLng} onChange={e => setPanToLng(e.target.value)} placeholder="lng" />
                    <input className="mp-input" type="number" value={panToLat} onChange={e => setPanToLat(e.target.value)} placeholder="lat" />
                    <button className="mp-btn" onClick={() => call('panTo', () => mapRef?.panTo({ lng: Number(panToLng), lat: Number(panToLat) }, animate ? undefined : { noAnimation: true }))}>panTo</button>
                  </div>
                  <div className="mp-row">
                    <input className="mp-input" type="number" value={panByX} onChange={e => setPanByX(e.target.value)} placeholder="dx" />
                    <input className="mp-input" type="number" value={panByY} onChange={e => setPanByY(e.target.value)} placeholder="dy" />
                    <button className="mp-btn" onClick={() => call('panBy', () => mapRef?.panBy(Number(panByX), Number(panByY), animate ? undefined : { noAnimation: true }))}>panBy</button>
                  </div>
                </div>
                <div className="mp-section">
                  <div className="mp-section-title">zoomIn / zoomOut</div>
                  <div className="mp-btn-group">
                    <button className="mp-btn" onClick={() => call('zoomIn', () => mapRef?.zoomIn())}>zoomIn</button>
                    <button className="mp-btn" onClick={() => call('zoomOut', () => mapRef?.zoomOut())}>zoomOut</button>
                  </div>
                </div>
                <div className="mp-section">
                  <div className="mp-section-title">flyTo <span className={`mp-cap-tag ${caps.has('Map.flyTo') ? 'ok' : 'no'}`}>{caps.has('Map.flyTo') ? 'v4+' : 'v3 ✗'}</span></div>
                  <div className="mp-btn-group">
                    <button className="mp-btn" onClick={() => call('flyTo(上海,14)', () => mapRef?.flyTo({ lng: 121.474, lat: 31.230 }, 14, animate ? undefined : { noAnimation: true }))}>flyTo 上海</button>
                    <button className="mp-btn" onClick={() => call('flyTo(北京,11)', () => mapRef?.flyTo({ lng: 116.404, lat: 39.915 }, 11, animate ? undefined : { noAnimation: true }))}>flyTo 北京</button>
                  </div>
                </div>
                <div className="mp-section">
                  <div className="mp-section-title">setViewport / reset</div>
                  <div className="mp-btn-group">
                    <button className="mp-btn" onClick={() => call('setViewport(北京)', () => mapRef?.setViewport([{ lng: 116.3, lat: 39.85 }, { lng: 116.5, lat: 40.0 }]))}>setViewport 北京</button>
                    <button className="mp-btn" onClick={() => call('setViewport(上海)', () => mapRef?.setViewport([{ lng: 121.3, lat: 31.1 }, { lng: 121.6, lat: 31.4 }]))}>setViewport 上海</button>
                    <button className="mp-btn" onClick={() => call('getViewport(广州)', () => mapRef?.getViewport([{ lng: 113.2, lat: 23.0 }, { lng: 113.5, lat: 23.2 }]))}>getViewport 广州</button>
                    <button className="mp-btn danger" onClick={() => call('reset', () => mapRef?.reset())}>reset</button>
                  </div>
                </div>
              </>
            )}

            {/* ════════ 查询 ════════ */}
            {activeTab === 'query' && (
              <>
                <div className="mp-section">
                  <div className="mp-section-title">查询方法（getXxx）</div>
                  <div className="mp-btn-group">
                    {queryMethods.map(m => (
                      <button key={m} className="mp-btn" onClick={() => call(m, () => (mapRef as any)?.[m]())}>{m}</button>
                    ))}
                    <button className="mp-btn" onClick={() => call('getOverlays', () => mapRef?.getOverlays().length)}>getOverlays</button>
                    <button className="mp-btn" onClick={() => call('getPanes', () => !!mapRef?.getPanes())}>getPanes</button>
                    <button className="mp-btn" onClick={() => call('getInfoWindow', () => !!mapRef?.getInfoWindow())}>getInfoWindow</button>
                    <button className="mp-btn" onClick={() => call('getIndoorInfo', () => mapRef?.getIndoorInfo())}>getIndoorInfo</button>
                    <button className="mp-btn" onClick={() => call('isStreetLayerShow', () => mapRef?.isStreetLayerShow())}>isStreetLayerShow</button>
                    <button className="mp-btn" onClick={() => call('isSupportEarth', () => mapRef?.isSupportEarth())}>isSupportEarth</button>
                    <button className="mp-btn" onClick={() => call('getLanguage', () => mapRef?.getLanguage())}>getLanguage</button>
                    <button className="mp-btn" onClick={() => call('getPrivateStatus', () => mapRef?.getPrivateStatus())}>getPrivateStatus</button>
                    <button className="mp-btn" onClick={() => call('highResolutionEnabled', () => mapRef?.highResolutionEnabled())}>highResolutionEnabled</button>
                    <button className="mp-btn" onClick={() => call('getContainer', () => !!mapRef?.getContainer())}>getContainer</button>
                    <button className="mp-btn" onClick={() => call('getProjection', () => !!mapRef?.getProjection())}>getProjection</button>
                  </div>
                </div>
              </>
            )}

            {/* ════════ 坐标 ════════ */}
            {activeTab === 'coord' && (
              <div className="mp-section">
                <div className="mp-section-title">坐标转换</div>
                <div className="mp-btn-group">
                  {coordMethods.map(([name, fn]) => (
                    <button key={name} className="mp-btn" onClick={() => call(name, fn)}>{name}</button>
                  ))}
                </div>
              </div>
            )}

            {/* ════════ 事件 ════════ */}
            {activeTab === 'event' && (
              <>
                <div className="mp-section">
                  <div className="mp-section-title">订阅事件（点击切换）</div>
                  <div className="mp-btn-group">
                    {eventList.map(evt => (
                      <button
                        key={evt}
                        className={`mp-btn ${subscribedEvents.includes(evt) ? 'active' : ''}`}
                        onClick={() => toggleEvent(evt)}
                      >
                        {evt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mp-section">
                  <div className="mp-section-title">事件日志</div>
                  <button className="mp-btn" onClick={() => setLogOpen(!logOpen)} style={{ marginBottom: 8 }}>
                    {logOpen ? '隐藏日志面板' : '显示日志面板'}
                  </button>
                  <button className="mp-btn danger" onClick={() => setEventLog([])}>清空日志</button>
                  <div style={{ marginTop: 8, maxHeight: 200, overflowY: 'auto' }}>
                    {eventLog.length === 0
                      ? <div style={{ fontSize: 12, color: '#5f6368', padding: 8 }}>订阅事件后在此查看日志</div>
                      : eventLog.slice(0, 10).map((line, i) => <div key={i} className="mp-code" style={{ display: 'block', marginBottom: 2 }}>{line}</div>)}
                  </div>
                </div>
              </>
            )}

            {/* ════════ 3.0-only ════════ */}
            {activeTab === 'v3' && (
              <div className="mp-section">
                <div className="mp-section-title">3.0-only 命令 <span className={`mp-cap-tag ${caps.has('Map.enableMapClick') ? 'ok' : 'no'}`}>{caps.has('Map.enableMapClick') ? '3.0' : 'v4 ✗'}</span></div>
                <div className="mp-btn-group">
                  <button className="mp-btn" onClick={() => call('enableMapClick', () => mapRef?.enableMapClick())}>enableMapClick</button>
                  <button className="mp-btn" onClick={() => call('disableMapClick', () => mapRef?.disableMapClick())}>disableMapClick</button>
                  <button className="mp-btn" onClick={() => call('enable3DBuilding', () => mapRef?.enable3DBuilding())}>enable3DBuilding</button>
                  <button className="mp-btn" onClick={() => call('disable3DBuilding', () => mapRef?.disable3DBuilding())}>disable3DBuilding</button>
                  <button className="mp-btn" onClick={() => call('setCurrentCity', () => mapRef?.setCurrentCity('北京'))}>setCurrentCity</button>
                  <button className="mp-btn" onClick={() => call('setPanorama', () => mapRef?.setPanorama(null))}>setPanorama(null)</button>
                  <button className="mp-btn" onClick={() => call('getPanorama', () => mapRef?.getPanorama())}>getPanorama</button>
                  <button className="mp-btn" onClick={() => call('addHotspot', () => mapRef?.addHotspot({ __brand: 'OverlayHandle', raw: null, type: 'hotspot' }))}>addHotspot</button>
                  <button className="mp-btn" onClick={() => call('clearHotspots', () => mapRef?.clearHotspots())}>clearHotspots</button>
                </div>
              </div>
            )}

            {/* ════════ 4.0+ ════════ */}
            {activeTab === 'v4' && (
              <div className="mp-section">
                <div className="mp-section-title">4.0+ 实用方法</div>
                <div className="mp-btn-group">
                  {v4Methods.map(m => (
                    <button
                      key={m}
                      className="mp-btn"
                      onClick={() => {
                        if (m === 'getSolarInfo') return call(m, () => mapRef?.getSolarInfo(new Date()));
                        if (m === 'getPoiByUid') return call(m, () => mapRef?.getPoiByUid('test', () => {}));
                        if (m === 'setEarthMaxZoom') return call(m, () => mapRef?.setEarthMaxZoom(10));
                        if (m === 'setEarthMinZoom') return call(m, () => mapRef?.setEarthMinZoom(3));
                        if (m === 'showStreetLayer') return call(m, () => mapRef?.showStreetLayer(true));
                        if (m === 'setNormalMapDisplay') return call(m, () => mapRef?.setNormalMapDisplay(true));
                        if (m === 'getVectorContainer') return call(m, () => !!mapRef?.getVectorContainer());
                        if (m === 'changeLanguage') return call(m, () => mapRef?.changeLanguage((w.BMap?.BMAP_LANGUAGE_ZH ?? w.BMAP_LANGUAGE_ZH ?? 0) as any));
                        if (m === 'enablePreferredLanguage') return call(m, () => mapRef?.enablePreferredLanguage((w.BMap?.BMAP_LANGUAGE_ZH ?? w.BMAP_LANGUAGE_ZH ?? 0) as any));
                        if (m === 'addAreaSpot') return call(m, () => mapRef?.addAreaSpot([116.4, 39.9, 116.5, 39.95]));
                        if (m === 'addMapLabels') return call(m, () => mapRef?.addMapLabels([]));
                        if (m === 'setLock') return call(m, () => mapRef?.setLock(true));
                        if (m === 'setPrivateStatus') return call(m, () => mapRef?.setPrivateStatus(true));
                        if (m === 'addFocusMask') return call(m, () => mapRef?.addFocusMask({}));
                        return call(m, () => (mapRef as any)?.[m]());
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ════════ 杂项 ════════ */}
            {activeTab === 'misc' && (
              <div className="mp-section">
                <div className="mp-section-title">杂项方法</div>
                <div className="mp-btn-group">
                  {miscMethods.map(m => (
                    <button
                      key={m}
                      className="mp-btn"
                      onClick={() => {
                        if (m === 'setCopyrightOffset') return call(m, () => mapRef?.setCopyrightOffset({}, {}));
                        if (m === 'setOverlayMoveCursor') return call(m, () => mapRef?.setOverlayMoveCursor('move'));
                        if (m === 'setBounds') return call(m, () => mapRef?.setBounds({ sw: { lng: 116, lat: 39 }, ne: { lng: 117, lat: 40 } }));
                        if (m === 'restrictBounds') return call(m, () => mapRef?.restrictBounds({ sw: { lng: 116, lat: 39 }, ne: { lng: 117, lat: 40 } }));
                        return call(m, () => (mapRef as any)?.[m]());
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
        <button className="drawer-toggle" onClick={() => setDrawerOpen(!drawerOpen)}>
          {drawerOpen ? '▶' : '◀'}
        </button>
      </div>

      {/* ── 底部城市快捷栏 ── */}
      <div className="mp-glass mp-city-bar">
        {CITIES.map(c => (
          <button
            key={c.name}
            className={`mp-city-btn ${center.lng === c.lng && center.lat === c.lat ? 'active' : ''}`}
            onClick={() => { setCenter({ lng: c.lng, lat: c.lat }); setZoom(c.zoom); }}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
