import React, { useState, useCallback } from 'react';
import {
  useLocalSearch, useGeocoder, useDrivingRoute, useWalkingRoute,
  useRidingRoute, useTransitRoute, useBusLineSearch, useAutocomplete,
  useBoundary, useGeolocation, useLocalCity, usePlaceDetail,
  useConvertor, usePanoramaService, useTruckRoute,
  useMapContext,
} from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { registerDemo } from './index';

const C = { lng: 116.404, lat: 39.915 };
const panelStyle: React.CSSProperties = {
  position: 'absolute', top: 10, left: 10, zIndex: 10,
  background: '#fff', padding: 12, borderRadius: 6,
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)', maxWidth: 320, fontSize: 13,
};
const parsePoint = (s: string) => { const [lng, lat] = s.split(',').map(Number); return { lng, lat }; };

// 阻断结果面板上的滚轮冒泡到地图容器（避免滚动面板时触发地图缩放）；不 preventDefault，面板自身滚动不受影响
const wheelBlocked = new WeakSet<Element>();
function blockWheel(el: HTMLElement | null) {
  if (el && !wheelBlocked.has(el)) {
    wheelBlocked.add(el);
    el.addEventListener('wheel', (e) => e.stopPropagation());
  }
}

// ─── useLocalSearch ───
function LocalSearchInner() {
  const [query, setQuery] = useState('餐厅');
  const [panelEl, setPanelEl] = useState<HTMLElement | null>(null);
  const { map } = useMapContext();
  const { data, loading, search } = useLocalSearch({
    location: '北京',
    renderOptions: { map: map!, panel: panelEl ?? undefined, autoViewport: true },
  });
  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', gap: 4 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search(query)}
          style={{ flex: 1, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4 }} />
        <button onClick={() => search(query)} style={{ padding: '4px 12px', border: '1px solid #1890ff', background: '#1890ff', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>
          {loading ? '...' : '搜索'}
        </button>
      </div>
      <div ref={(el) => { setPanelEl(el); blockWheel(el); }} className="svc-result-panel" />
    </div>
  );
}
registerDemo('local-search', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <LocalSearchInner />
    </MapContainer>
  ),
  code: `import { Map, useLocalSearch, useMapContext } from 'react-bmap';

function Search() {
  const { map } = useMapContext();
  const { search } = useLocalSearch({
    location: '北京',
    renderOptions: { map, panel: el, autoViewport: true },
  });
  return <input onKeyDown={e => e.key === 'Enter' && search('餐厅')} />;
}`,
});

// ─── useGeocoder ───
function GeocoderInner() {
  const [addr, setAddr] = useState('天安门');
  const { data, loading, getPoint } = useGeocoder();
  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', gap: 4 }}>
        <input value={addr} onChange={e => setAddr(e.target.value)} onKeyDown={e => e.key === 'Enter' && getPoint(addr)}
          style={{ flex: 1, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4 }} />
        <button onClick={() => getPoint(addr)} style={{ padding: '4px 12px', border: '1px solid #1890ff', background: '#1890ff', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>
          {loading ? '...' : '编码'}
        </button>
      </div>
      <div style={{ marginTop: 6, color: '#666', wordBreak: 'break-all' }}>
        {data ? (() => { try { return JSON.stringify(data, (k, v) => typeof v === 'function' ? '<fn>' : v).slice(0, 300); } catch { return String(data); } })() : '输入地址'}
      </div>
    </div>
  );
}
registerDemo('geocoder', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <GeocoderInner />
    </MapContainer>
  ),
  code: `import { useGeocoder } from 'react-bmap';

const { data, getPoint } = useGeocoder();
getPoint('天安门'); // 地址→坐标`,
});

// ─── useDrivingRoute ───
function DrivingRouteInner() {
  const { map } = useMapContext();
  const [from, setFrom] = useState('116.404,39.915');
  const [to, setTo] = useState('116.501,39.937');
  const [panelEl, setPanelEl] = useState<HTMLElement | null>(null);
  const { loading, search } = useDrivingRoute({
    location: '北京',
    renderOptions: { map: map!, panel: panelEl ?? undefined, autoViewport: true },
  });
  return (
    <div style={panelStyle}>
      <button onClick={() => search(parsePoint(from), parsePoint(to))}
        style={{ width: '100%', padding: '6px', border: '1px solid #1890ff', background: '#1890ff', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>
        {loading ? '搜索中...' : '驾车：天安门 → 国贸'}
      </button>
      <div ref={(el) => { setPanelEl(el); blockWheel(el); }} className="svc-result-panel" />
    </div>
  );
}
registerDemo('driving-route', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <DrivingRouteInner />
    </MapContainer>
  ),
  code: `import { useDrivingRoute, useMapContext } from 'react-bmap';

const { map } = useMapContext();
const { search } = useDrivingRoute({
  location: '北京',
  renderOptions: { map, panel: el, autoViewport: true },
});
search({ lng: 116.404, lat: 39.915 }, { lng: 116.501, lat: 39.937 });`,
});

// ─── useWalkingRoute ───
function WalkingRouteInner() {
  const { map } = useMapContext();
  const [panelEl, setPanelEl] = useState<HTMLElement | null>(null);
  const { loading, search } = useWalkingRoute({
    location: '北京',
    renderOptions: { map: map!, panel: panelEl ?? undefined, autoViewport: true },
  });
  return (
    <div style={panelStyle}>
      <button onClick={() => search(parsePoint('116.404,39.915'), parsePoint('116.417,39.928'))}
        style={{ width: '100%', padding: '6px', border: '1px solid #52c41a', background: '#52c41a', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>
        {loading ? '搜索中...' : '步行：天安门 → 北海公园'}
      </button>
      <div ref={(el) => { setPanelEl(el); blockWheel(el); }} className="svc-result-panel" />
    </div>
  );
}
registerDemo('walking-route', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <WalkingRouteInner />
    </MapContainer>
  ),
  code: `import { useWalkingRoute, useMapContext } from 'react-bmap';

const { map } = useMapContext();
const { search } = useWalkingRoute({
  location: '北京',
  renderOptions: { map, panel: el, autoViewport: true },
});
search({ lng: 116.404, lat: 39.915 }, { lng: 116.417, lat: 39.928 });`,
});

// ─── useRidingRoute ───
function RidingRouteInner() {
  const { map } = useMapContext();
  const [panelEl, setPanelEl] = useState<HTMLElement | null>(null);
  const { loading, search } = useRidingRoute({
    location: '北京',
    renderOptions: { map: map!, panel: panelEl ?? undefined, autoViewport: true },
  });
  return (
    <div style={panelStyle}>
      <button onClick={() => search(parsePoint('116.404,39.915'), parsePoint('116.45,39.93'))}
        style={{ width: '100%', padding: '6px', border: '1px solid #722ed1', background: '#722ed1', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>
        {loading ? '搜索中...' : '骑行：天安门 → 朝阳门'}
      </button>
      <div ref={(el) => { setPanelEl(el); blockWheel(el); }} className="svc-result-panel" />
    </div>
  );
}
registerDemo('riding-route', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <RidingRouteInner />
    </MapContainer>
  ),
  code: `import { useRidingRoute, useMapContext } from 'react-bmap';

const { map } = useMapContext();
const { search } = useRidingRoute({
  location: '北京',
  renderOptions: { map, panel: el, autoViewport: true },
});
search({ lng: 116.404, lat: 39.915 }, { lng: 116.45, lat: 39.93 });`,
});

// ─── useTransitRoute ───
function TransitRouteInner() {
  const { map } = useMapContext();
  const [from, setFrom] = useState('116.404,39.915');
  const [to, setTo] = useState('116.326,39.989');
  const [panelEl, setPanelEl] = useState<HTMLElement | null>(null);
  const { loading, search } = useTransitRoute({
    location: '北京',
    renderOptions: { map: map!, panel: panelEl ?? undefined, autoViewport: true },
  });
  return (
    <div style={panelStyle}>
      <input value={from} onChange={e => setFrom(e.target.value)} placeholder="起点 lng,lat"
        style={{ width: '100%', marginBottom: 4, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
      <input value={to} onChange={e => setTo(e.target.value)} placeholder="终点 lng,lat"
        style={{ width: '100%', marginBottom: 4, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
      <button onClick={() => search(parsePoint(from), parsePoint(to))}
        style={{ width: '100%', padding: '4px', border: '1px solid #fa8c16', background: '#fa8c16', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>
        {loading ? '搜索中...' : '公交路线'}
      </button>
      <div ref={(el) => { setPanelEl(el); blockWheel(el); }} className="svc-result-panel" />
    </div>
  );
}
registerDemo('transit-route', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <TransitRouteInner />
    </MapContainer>
  ),
  code: `import { useTransitRoute, useMapContext } from 'react-bmap';

const { map } = useMapContext();
const { search } = useTransitRoute({
  location: '北京',
  renderOptions: { map, panel: el, autoViewport: true },
});
search({ lng: 116.404, lat: 39.915 }, { lng: 116.326, lat: 39.989 });`,
});

// ─── useBusLineSearch ───
function BusLineInner() {
  const { map } = useMapContext();
  const [line, setLine] = useState('1路');
  const [panelEl, setPanelEl] = useState<HTMLElement | null>(null);
  const { data, loading, getBusList } = useBusLineSearch({
    location: '北京',
    renderOptions: { map: map!, panel: panelEl ?? undefined, autoViewport: true },
  });
  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', gap: 4 }}>
        <input value={line} onChange={e => setLine(e.target.value)} onKeyDown={e => e.key === 'Enter' && getBusList(line)}
          placeholder="公交线路" style={{ flex: 1, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4 }} />
        <button onClick={() => getBusList(line)} style={{ padding: '4px 12px', border: '1px solid #1890ff', background: '#1890ff', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>
          {loading ? '...' : '查询'}
        </button>
      </div>
      <div style={{ marginTop: 6, color: '#666' }}>{data ? '有结果' : '输入线路名'}</div>
      <div ref={(el) => { setPanelEl(el); blockWheel(el); }} className="svc-result-panel" />
    </div>
  );
}
registerDemo('bus-line-search', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <BusLineInner />
    </MapContainer>
  ),
  code: `import { useBusLineSearch } from 'react-bmap';

const { data, getBusList } = useBusLineSearch();
getBusList('1路');`,
});

// ─── useAutocomplete ───
function AutocompleteInner() {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const { data } = useAutocomplete({ location: '北京', input: el ?? undefined });
  return (
    <div style={panelStyle}>
      <input ref={setEl} placeholder="输入关键词..." style={{ width: '100%', padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
      <div style={{ marginTop: 6, color: '#666' }}>{data ? '有建议' : '输入触发自动补全'}</div>
    </div>
  );
}
registerDemo('autocomplete', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <AutocompleteInner />
    </MapContainer>
  ),
  code: `import { useAutocomplete } from 'react-bmap';

const { data } = useAutocomplete({ location: '北京', input: el });`,
});

// ─── useBoundary ───
function BoundaryInner() {
  const [name, setName] = useState('北京市');
  const { data, loading, get } = useBoundary();
  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', gap: 4 }}>
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && get(name)}
          style={{ flex: 1, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4 }} />
        <button onClick={() => get(name)} style={{ padding: '4px 12px', border: '1px solid #1890ff', background: '#1890ff', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>
          {loading ? '...' : '查询'}
        </button>
      </div>
      <div style={{ marginTop: 6, color: '#666', wordBreak: 'break-all' }}>
        {data ? (() => { try { return JSON.stringify(data, (k, v) => typeof v === 'function' ? '<fn>' : v).slice(0, 300); } catch { return String(data); } })() : '输入行政区名'}
      </div>
    </div>
  );
}
registerDemo('boundary', {
  Component: () => (
    <MapContainer center={C} zoom={8} style={{ height: '100%', position: 'relative' }}>
      <BoundaryInner />
    </MapContainer>
  ),
  code: `import { useBoundary } from 'react-bmap';

const { data, get } = useBoundary();
get('北京市');`,
});

// ─── useGeolocation ───
function GeolocationInner() {
  const { data, loading, getCurrentPosition } = useGeolocation();
  return (
    <div style={panelStyle}>
      <button onClick={() => getCurrentPosition()} style={{ padding: '4px 12px', border: '1px solid #1890ff', background: '#1890ff', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>
        {loading ? '定位中...' : '获取当前位置'}
      </button>
      <div style={{ marginTop: 6, color: '#666' }}>
        {data ? (() => { try { return JSON.stringify(data, (k, v) => typeof v === 'function' ? '<fn>' : v).slice(0, 200); } catch { return String(data); } })() : '点击按钮定位'}
      </div>
    </div>
  );
}
registerDemo('geolocation', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <GeolocationInner />
    </MapContainer>
  ),
  code: `import { useGeolocation } from 'react-bmap';

const { data, getCurrentPosition } = useGeolocation();
getCurrentPosition();`,
});

// ─── useLocalCity ───
function LocalCityInner() {
  const { data, loading, get } = useLocalCity();
  return (
    <div style={panelStyle}>
      <button onClick={() => get()} style={{ padding: '4px 12px', border: '1px solid #1890ff', background: '#1890ff', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>
        {loading ? '查询中...' : '获取当前城市'}
      </button>
      <div style={{ marginTop: 6, color: '#666' }}>
        {data ? (() => { try { return JSON.stringify(data, (k, v) => typeof v === 'function' ? '<fn>' : v).slice(0, 200); } catch { return String(data); } })() : '点击按钮查询'}
      </div>
    </div>
  );
}
registerDemo('local-city', {
  Component: () => (
    <MapContainer center={C} zoom={10} style={{ height: '100%', position: 'relative' }}>
      <LocalCityInner />
    </MapContainer>
  ),
  code: `import { useLocalCity } from 'react-bmap';

const { data, get } = useLocalCity();
get();`,
});

// ─── usePlaceDetail ───
function PlaceDetailInner() {
  const { map } = useMapContext();
  const [uid, setUid] = useState('06d2dffda107b0ef89f15db6');
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);
  const { data, loading, render } = usePlaceDetail({ container: containerEl ?? undefined, renderOptions: { map: map! } as any });
  return (
    <div style={{ ...panelStyle, width: 500, maxWidth: 500 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        <input value={uid} onChange={e => setUid(e.target.value)} placeholder="POI UID"
          style={{ flex: 1, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4 }} />
        <button onClick={() => render(uid)} style={{ padding: '4px 12px', border: '1px solid #1890ff', background: '#1890ff', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>
          {loading ? '...' : '详情'}
        </button>
      </div>
      <div ref={(el) => { setContainerEl(el); blockWheel(el); }} className="svc-result-panel" style={{ width: 400, maxHeight: 250 }} />
    </div>
  );
}
registerDemo('place-detail', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <PlaceDetailInner />
    </MapContainer>
  ),
  code: `import { usePlaceDetail } from 'react-bmap';

const { data, render } = usePlaceDetail();
render('06d2dffda107b0ef89f15db6');`,
});

// ─── useConvertor ───
function ConvertorInner() {
  const [lng, setLng] = useState('116.404');
  const [lat, setLat] = useState('39.915');
  const { data, loading, translate } = useConvertor();
  return (
    <div style={panelStyle}>
      <input value={lng} onChange={e => setLng(e.target.value)} placeholder="经度" style={{ width: '100%', marginBottom: 4, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
      <input value={lat} onChange={e => setLat(e.target.value)} placeholder="纬度" style={{ width: '100%', marginBottom: 4, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }} />
      <button onClick={() => translate([{ lng: Number(lng), lat: Number(lat) }], 1, 5)}
        style={{ width: '100%', padding: '4px', border: '1px solid #1890ff', background: '#1890ff', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>
        {loading ? '转换中...' : 'GPS → 百度坐标'}
      </button>
      <div style={{ marginTop: 6, color: '#666' }}>
        {data ? (() => { try { return JSON.stringify(data, (k, v) => typeof v === 'function' ? '<fn>' : v).slice(0, 200); } catch { return String(data); } })() : '输入坐标'}
      </div>
    </div>
  );
}
registerDemo('convertor', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <ConvertorInner />
    </MapContainer>
  ),
  code: `import { useConvertor } from 'react-bmap';

const { data, translate } = useConvertor();
translate([{ lng: 116.404, lat: 39.915 }], 1, 5); // GPS→百度`,
});

// ─── usePanoramaService ───
function PanoramaServiceInner() {
  const { data, loading, getPanoramaByLocation } = usePanoramaService();
  return (
    <div style={panelStyle}>
      <button onClick={() => getPanoramaByLocation(C, 100)} style={{ padding: '4px 12px', border: '1px solid #1890ff', background: '#1890ff', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>
        {loading ? '查询中...' : '获取全景数据'}
      </button>
      <div style={{ marginTop: 6, color: '#666' }}>
        {data ? (() => { try { return JSON.stringify(data, (k, v) => typeof v === 'function' ? '<fn>' : v).slice(0, 200); } catch { return String(data); } })() : '点击按钮查询'}
      </div>
    </div>
  );
}
registerDemo('panorama-service', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <PanoramaServiceInner />
    </MapContainer>
  ),
  code: `import { usePanoramaService } from 'react-bmap';

const { data, getPanoramaByLocation } = usePanoramaService();
getPanoramaByLocation({ lng: 116.404, lat: 39.915 }, 100);`,
});

// ─── useTruckRoute ───
function TruckRouteInner() {
  const { map } = useMapContext();
  const [panelEl, setPanelEl] = useState<HTMLElement | null>(null);
  const { loading, error, data, search } = useTruckRoute({
    location: '北京',
    renderOptions: { map: map!, panel: panelEl ?? undefined, autoViewport: true },
  });
  return (
    <div style={panelStyle}>
      <button onClick={() => search(parsePoint('116.404,39.915'), parsePoint('116.501,39.937'))}
        style={{ width: '100%', padding: '6px', border: '1px solid #fa541c', background: '#fa541c', color: '#fff', borderRadius: 4, cursor: 'pointer' }}>
        {loading ? '搜索中...' : '货车：天安门 → 国贸'}
      </button>
      {error && <div style={{ marginTop: 4, color: '#f00', fontSize: 12 }}>{error.message}</div>}
      {data && <div style={{ marginTop: 4, color: '#666', fontSize: 12 }}>
        方案数: {(data as any)?._plans?.length ?? '?'} | {Object.keys(data as any).join(', ')}
      </div>}
      <div ref={(el) => { setPanelEl(el); blockWheel(el); }} className="svc-result-panel" style={{ minHeight: 60 }} />
    </div>
  );
}
registerDemo('truck-route', {
  Component: () => (
    <MapContainer center={C} zoom={11} style={{ height: '100%', position: 'relative' }}>
      <TruckRouteInner />
    </MapContainer>
  ),
  code: `import { useTruckRoute, useMapContext } from 'react-bmap';

const { map } = useMapContext();
const { search } = useTruckRoute({
  location: '北京',
  renderOptions: { map, panel: el, autoViewport: true },
});
search({ lng: 116.404, lat: 39.915 }, { lng: 116.501, lat: 39.937 });`,
});
