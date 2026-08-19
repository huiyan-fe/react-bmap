import React, { useEffect, useState } from 'react';
import {
  Marker,
  useMap, useDriver, useMapRef, useCapabilities, useMapEvent, useMapStatus,
  useSymbol, useIcon,
  BMap_Symbol_SHAPE_STAR,
} from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const C = { lng: 116.404, lat: 39.915 };
const GUOMAO = { lng: 116.461, lat: 39.914 };

const panelStyle: React.CSSProperties = {
  position: 'absolute', top: 10, left: 10, zIndex: 10,
  background: '#fff', padding: 12, borderRadius: 6,
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)', maxWidth: 320, fontSize: 13,
};

const btnStyle: React.CSSProperties = {
  marginRight: 6, marginTop: 6, padding: '3px 8px', fontSize: 12, cursor: 'pointer',
};

// ─── useMap ───
// 三个句柄类 hook 的分工，别搞混：
//   useMapRef —— 日常操作地图用这个。它已经把 driver 的方法全量转发了一遍
//                （MapRefImpl 有 188 个方法，driver 吃 map 的方法有 184 个），
//                所以「useMap + useDriver 手动组合调用」拿不到任何多出来的能力。
//   useDriver —— 做版本 / 能力分支判断，或者用 driver.rawSDK 取原生命名空间。
//   useMap    —— 逃生口。MapHandle 是 brand 包装（{ __brand, raw }），
//                raw 才是原生 BMap.Map / BMapGL.Map 实例；而 MapRefImpl 把 map 存成
//                private 且不对外暴露，所以封装没覆盖到的原生 API 只能从这里进。
const RawEscapePanel: React.FC = () => {
  const map = useMap();
  const driver = useDriver();

  // raw / rawSDK 的类型都是 unknown，用原生 API 必须自己断言
  const native = map?.raw as any;
  const sdk = driver?.rawSDK as any;

  return (
    <div style={panelStyle}>
      <div style={{ marginBottom: 8, color: '#666', lineHeight: 1.7 }}>
        日常操作地图请用 <code>useMapRef</code>。<br />
        只有封装没覆盖到某个原生能力时，才需要这条路：
        <code>useMap().raw</code> 拿实例、<code>useDriver().rawSDK</code> 拿命名空间。
      </div>
      <div>map 句柄：{map ? '已就绪' : '未就绪（首帧为 null）'}</div>
      <div>原生实例：{native ? (native.constructor?.name ?? '(匿名类)') : '—'}</div>
      <div>rawSDK.Map：{typeof sdk?.Map === 'function' ? '可用，可以 new 出未封装的原生类' : '—'}</div>
      <button
        style={btnStyle}
        disabled={!native}
        onClick={() => { if (native) native.setZoom(native.getZoom() + 1); }}
      >
        用原生实例 setZoom(+1)
      </button>
      <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
        setZoom 其实 useMapRef 也有，这里只是演示怎么摸到原生实例。
      </div>
    </div>
  );
};

registerDemo('use-map', {
  title: '逃生口：取原生地图实例',
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <RawEscapePanel />
    </MapContainer>
  ),
  code: `import { Map, useMap, useDriver, useMapRef } from 'react-bmap';

// 先明确分工：
//   操作地图 → useMapRef（driver 的方法它都转发了，不用自己拼 driver + map）
//   版本/能力分支、原生命名空间 → useDriver
//   原生地图实例 → useMap().raw（只有这一个入口）
function Escape() {
  const map = useMap();       // MapHandle | null，首帧为 null
  const driver = useDriver(); // BMapDriver | null

  // MapHandle = { __brand: 'MapHandle', raw: unknown }
  // raw 是 unknown，要用原生 API 得自己断言
  const native = map?.raw as any;
  const sdk = driver?.rawSDK as any;

  return (
    <button
      disabled={!native}
      onClick={() => {
        // 封装已覆盖的能力，优先走 useMapRef：mapRef.setZoom(...)
        // 这里演示的是封装没覆盖时的写法：直接用原生实例 / 原生类
        native.setZoom(native.getZoom() + 1);
        // const overlay = new sdk.SomeNativeClass(...);
        // native.addOverlay(overlay);
      }}
    >
      用原生实例 setZoom(+1)
    </button>
  );
}

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <Escape />
</Map>`,
});

// ─── useDriver ───
const DriverPanel: React.FC = () => {
  const driver = useDriver();
  if (!driver) return <div style={panelStyle}>driver 未就绪</div>;

  return (
    <div style={panelStyle}>
      <div>version：{driver.version}</div>
      <div>capabilities 数量：{driver.capabilities.size}</div>
      <div>unsupportedBehavior：{driver.unsupportedBehavior}</div>
      <div style={{ marginTop: 6, color: '#888' }}>
        rawSDK：{driver.rawSDK ? '可用（可直接调 SDK 原生构造函数）' : '不可用'}
      </div>
    </div>
  );
};

registerDemo('use-driver', {
  title: '读取当前 driver 信息',
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <DriverPanel />
    </MapContainer>
  ),
  code: `import { Map, useDriver } from 'react-bmap';

// useDriver 只需要 <BMapProvider>，不要求在 <Map> 内部。
// driver 是封装层的逃生门：wrapper 没覆盖到的 SDK 能力可以自己调。
function DriverInfo() {
  const driver = useDriver();
  if (!driver) return null;

  return (
    <div>
      <div>version: {driver.version}</div>
      <div>capabilities: {driver.capabilities.size}</div>
      <div>unsupportedBehavior: {driver.unsupportedBehavior}</div>
      {/* driver.rawSDK 就是全局 BMap / BMapGL 命名空间 */}
    </div>
  );
}

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <DriverInfo />
</Map>`,
});

// ─── useMapRef ───
// useMapRef 把 driver 全量方法包成了命令式句柄，省掉每次都传 map 句柄。
const MapRefPanel: React.FC = () => {
  const mapRef = useMapRef();
  const [zoom, setZoom] = useState<number | null>(null);

  return (
    <div style={panelStyle}>
      <div>点按钮命令式操作地图</div>
      <div>
        <button style={btnStyle} disabled={!mapRef} onClick={() => mapRef?.zoomIn()}>zoomIn</button>
        <button style={btnStyle} disabled={!mapRef} onClick={() => mapRef?.zoomOut()}>zoomOut</button>
        <button style={btnStyle} disabled={!mapRef} onClick={() => mapRef?.flyTo(GUOMAO, 14)}>flyTo 国贸</button>
        <button style={btnStyle} disabled={!mapRef} onClick={() => mapRef?.reset()}>reset</button>
      </div>
      <div>
        <button style={btnStyle} disabled={!mapRef} onClick={() => setZoom(mapRef ? mapRef.getZoom() : null)}>
          读取当前 zoom
        </button>
        {zoom != null && <span>zoom = {zoom}</span>}
      </div>
    </div>
  );
};

registerDemo('use-map-ref', {
  title: '命令式操作地图',
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <MapRefPanel />
    </MapContainer>
  ),
  code: `import { Map, useMapRef } from 'react-bmap';

// 和 <Map ref={...} /> 拿到的是同一种句柄，区别是这个能在子组件里直接取。
function Toolbar() {
  const mapRef = useMapRef();

  return (
    <div>
      <button onClick={() => mapRef?.zoomIn()}>zoomIn</button>
      <button onClick={() => mapRef?.flyTo({ lng: 116.461, lat: 39.914 }, 14)}>flyTo</button>
      <button onClick={() => console.log(mapRef?.getZoom())}>getZoom</button>
    </div>
  );
}

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <Toolbar />
</Map>`,
});

// ─── useCapabilities ───
// 能力名规范见 src/drivers/capabilityMatrix.ts：
// 类存在性用类名（'Prism'），方法用 'Class.method'（'Map.flyTo'）。
const PROBES = ['Marker', 'Prism', 'Map.flyTo', 'Map.enableMapClick', 'MVTLayer'];

const CapabilitiesPanel: React.FC = () => {
  const caps = useCapabilities();

  return (
    <div style={panelStyle}>
      <div style={{ marginBottom: 4 }}>共 {caps.size} 项能力（切换右上角版本对比）</div>
      {PROBES.map((cap) => (
        <div key={cap}>
          {caps.has(cap) ? '✓' : '✗'} {cap}
        </div>
      ))}
    </div>
  );
};

registerDemo('use-capabilities', {
  title: '按能力名做分支',
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <CapabilitiesPanel />
    </MapContainer>
  ),
  code: `import { Map, Prism, Polygon, useCapabilities } from 'react-bmap';

// 3.0 没有 Prism，用 has() 提前分支，而不是等 driver 报 unsupported。
function Building({ path }) {
  const caps = useCapabilities();

  if (!caps.has('Prism')) {
    return <Polygon path={path} fillColor="#1890ff" />;
  }
  return <Prism path={path} altitude={800} topFillColor="#1890ff" />;
}

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <Building path={[/* ... */]} />
</Map>`,
});

// ─── useMapEvent ───
// handler 收到的是 SDK 原生事件对象（未做归一化）：
// 3.0 的鼠标事件带 point；4.0 的 click / rightclick / mousemove 带 latlng，
// 但 dblclick、drag 系列在 4.0 里也仍然是 point，moveend / zoomend 这类非鼠标事件两个都没有，
// 所以两个字段都读一下，并且要允许取不到。
const readLngLat = (raw: unknown): { lng: number; lat: number } | null => {
  const e = raw as { point?: { lng: number; lat: number }; latlng?: { lng: number; lat: number } };
  return e?.point ?? e?.latlng ?? null;
};

const ClickWatcher: React.FC = () => {
  const [last, setLast] = useState<{ lng: number; lat: number } | null>(null);
  const [count, setCount] = useState(0);

  useMapEvent('click', (raw) => {
    setCount((n) => n + 1);
    setLast(readLngLat(raw));
  });

  return (
    <div style={panelStyle}>
      <div>在地图上点一下</div>
      <div>click 次数：{count}</div>
      <div>最后一次：{last ? `${last.lng.toFixed(5)}, ${last.lat.toFixed(5)}` : '—'}</div>
    </div>
  );
};

registerDemo('use-map-event', {
  title: '订阅地图原生事件',
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <ClickWatcher />
    </MapContainer>
  ),
  code: `import { useState } from 'react';
import { Map, useMapEvent } from 'react-bmap';

// 传内联函数不会导致重订阅（handler 内部用 ref 持有最新值）。
// 注意 raw 是没做归一化的 SDK 原生事件
function ClickWatcher() {
  const [last, setLast] = useState(null);

  useMapEvent('click', (raw) => {
    setLast(raw.point ?? raw.latlng ?? null);
  });

  return <div>{last ? \`\${last.lng}, \${last.lat}\` : '点一下地图'}</div>;
}

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <ClickWatcher />
</Map>`,
});

// ─── useMapStatus ───
const StatusPanel: React.FC = () => {
  const status = useMapStatus();
  if (!status) return <div style={panelStyle}>地图未就绪</div>;

  const { center, zoom, bounds, size, heading, tilt } = status;
  return (
    <div style={panelStyle}>
      <div>center：{center ? `${center.lng.toFixed(5)}, ${center.lat.toFixed(5)}` : '—'}</div>
      <div>zoom：{zoom ?? '—'}</div>
      <div>size：{size ? `${size.width} × ${size.height}` : '—'}</div>
      <div>heading / tilt：{heading ?? '—'} / {tilt ?? '—'}</div>
      <div style={{ marginTop: 4, color: '#888' }}>
        bounds：{bounds ? `${bounds.sw.lng.toFixed(3)},${bounds.sw.lat.toFixed(3)} ~ ${bounds.ne.lng.toFixed(3)},${bounds.ne.lat.toFixed(3)}` : '—'}
      </div>
    </div>
  );
};

registerDemo('use-map-status', {
  title: '订阅地图状态',
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <StatusPanel />
    </MapContainer>
  ),
  code: `import { Map, useMapStatus } from 'react-bmap';

// 基于 useSyncExternalStore：拖动/缩放/resize 时自动更新，
// 值没变就不会返回新对象（不会触发多余渲染）。
// 单项能力不支持时该字段降级为 null（比如 3.0 没有 tilt）。
function StatusBar() {
  const status = useMapStatus();
  if (!status) return null;

  return (
    <div>
      {status.center?.lng}, {status.center?.lat} @ zoom {status.zoom}
    </div>
  );
}

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <StatusBar />
</Map>`,
});

// ─── useSymbol ───
// 注意：useSymbol 在 useLayoutEffect 里建好对象后写进 ref 再 `return ref.current`，
// 不走 state，所以首帧一定是 null 且不会自动重渲染。
// 想让 Marker 拿到它，必须自己触发一次额外渲染。
const SymbolMarker: React.FC = () => {
  const symbol = useSymbol({
    path: BMap_Symbol_SHAPE_STAR,
    fillColor: '#f5222d',
    fillOpacity: 0.9,
    scale: 7,
    strokeColor: '#fff',
    strokeWeight: 2,
  });
  const [, bump] = useState(0);
  useEffect(() => { bump(1); }, []);

  if (!symbol) return null;
  return <Marker position={C} icon={symbol} />;
};

registerDemo('use-symbol', {
  title: '把 Symbol 值对象交给 Marker',
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <SymbolMarker />
    </MapContainer>
  ),
  code: `import { useEffect, useState } from 'react';
import { Map, Marker, useSymbol, BMap_Symbol_SHAPE_STAR } from 'react-bmap';

function StarMarker() {
  // path 变化会重建 Symbol，其余选项走 setOverlayOptions 原地更新。
  const symbol = useSymbol({
    path: BMap_Symbol_SHAPE_STAR,
    fillColor: '#f5222d', fillOpacity: 0.9, scale: 7,
    strokeColor: '#fff', strokeWeight: 2,
  });

  // useSymbol 把结果存在 ref 里，首帧返回 null 且不会自己重渲染，
  // 所以这里补一次渲染让 Marker 能拿到句柄。
  const [, bump] = useState(0);
  useEffect(() => { bump(1); }, []);

  if (!symbol) return null;
  return <Marker position={{ lng: 116.404, lat: 39.915 }} icon={symbol} />;
}

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <StarMarker />
</Map>`,
});

// ─── useIcon ───
// 和 useSymbol 同一套机制：ref + 首帧 null，需要补一次渲染。
const IconMarker: React.FC = () => {
  const icon = useIcon({
    url: 'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_1.png',
    size: { width: 48, height: 48 },
  });
  const [, bump] = useState(0);
  useEffect(() => { bump(1); }, []);

  if (!icon) return null;
  return <Marker position={C} icon={icon} />;
};

registerDemo('use-icon', {
  title: '把 Icon 值对象交给 Marker',
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%' }}>
      <IconMarker />
    </MapContainer>
  ),
  code: `import { useEffect, useState } from 'react';
import { Map, Marker, useIcon } from 'react-bmap';

// 只有一个 Marker 时直接写 <Marker icon={{ url, size }} /> 更省事；
// useIcon 的价值是把同一个 Icon 实例复用给多个 Marker。
function IconMarkers({ points }) {
  const icon = useIcon({
    url: 'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_1.png',
    size: { width: 48, height: 48 },
  });

  // 同 useSymbol：结果存在 ref 里，首帧为 null，补一次渲染。
  const [, bump] = useState(0);
  useEffect(() => { bump(1); }, []);

  if (!icon) return null;
  return points.map((p, i) => <Marker key={i} position={p} icon={icon} />);
}

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11}>
  <IconMarkers points={[{ lng: 116.404, lat: 39.915 }]} />
</Map>`,
});

