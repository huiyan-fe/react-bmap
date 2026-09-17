import React from 'react';
import { BMapProvider, Marker, ScaleControl, Polygon, useBMapContext } from 'react-bmap';
import type { Point } from 'react-bmap';
import { MapContainer } from '../components/MapContainer';
import { EXAMPLE_AK, useMapVersion } from '../context/MapModeContext';
import { registerDemo } from './index';

const code = `import { Map, Marker, ScaleControl } from 'react-bmap';

<Map
  center={{ lng: 116.402544, lat: 39.928216 }}
  zoom={11}
  style={{ height: 400 }}
  onClick={(e) => console.log('click', e)}
>
  <Marker position={{ lng: 116.402544, lat: 39.928216 }} />
  <ScaleControl />
</Map>`;

function Demo() {
  return (
    <MapContainer
      center={{ lng: 116.402544, lat: 39.928216 }}
      zoom={11}
      style={{ height: '100%' }}
      onClick={(e: any) => console.log('map click', e)}
    >
      <Marker position={{ lng: 116.402544, lat: 39.928216 }} />
      <ScaleControl />
    </MapContainer>
  );
}

registerDemo('map', { Component: Demo, code });

// ─── customArea：个性化生效区域（setCustomArea，4.0+，2.0.3 新增） ───

const CUSTOM_AREA: Point[] = [
  { lng: 116.3128444483749, lat: 40.060273106485894 },
  { lng: 116.31577741586499, lat: 40.060797716323314 },
  { lng: 116.31685538247696, lat: 40.05968636697625 },
  { lng: 116.31824775601743, lat: 40.058757927582654 },
  { lng: 116.31431766941127, lat: 40.057360067270174 },
];

const CUSTOM_AREA_STYLE = [
  { featureType: 'building', elementType: 'geometry.topfill', stylers: { color: '#6dd5edcc' } },
  { featureType: 'building', elementType: 'geometry.sidefill', stylers: { color: '#2c7fb8b3' } },
];

const customAreaCode = `import { Map, Polygon } from 'react-bmap';

// 个性化生效区域边界（普通经纬度即可，组件内部转成原生 Point）
const area = [
  { lng: 116.3128444483749, lat: 40.060273106485894 },
  { lng: 116.31577741586499, lat: 40.060797716323314 },
  { lng: 116.31685538247696, lat: 40.05968636697625 },
  { lng: 116.31824775601743, lat: 40.058757927582654 },
  { lng: 116.31431766941127, lat: 40.057360067270174 },
];
// 区域内建筑个性化：顶面浅青蓝、侧面深蓝
const areaStyle = [
  { featureType: 'building', elementType: 'geometry.topfill', stylers: { color: '#6dd5edcc' } },
  { featureType: 'building', elementType: 'geometry.sidefill', stylers: { color: '#2c7fb8b3' } },
];

// customArea prop 内部会先 setMapStyle 兜底、再 setCustomArea（4.0+；3.0 不支持）
<Map
  center={{ lng: 116.3156, lat: 40.0594 }}
  zoom={19}
  tilt={55}
  customArea={{ area, style: { styleJson: areaStyle } }}
  style={{ height: 400 }}
>
  {/* 画出边界，直观看到区域范围 */}
  <Polygon path={area} strokeColor="#1b8eec" strokeWeight={4} strokeStyle="dashed" fillOpacity={0} />
</Map>`;

function CustomAreaDemo() {
  return (
    <MapContainer
      defaultCenter={{ lng: 116.3156, lat: 40.0594 }}
      defaultZoom={19}
      tilt={55}
      customArea={{ area: CUSTOM_AREA, style: { styleJson: CUSTOM_AREA_STYLE } }}
      style={{ height: '100%' }}
    >
      <Polygon path={CUSTOM_AREA} strokeColor="#1b8eec" strokeWeight={4} strokeStyle="dashed" fillOpacity={0} />
    </MapContainer>
  );
}

registerDemo('map', { title: 'customArea 个性化生效区域（4.0+）', Component: CustomAreaDemo, code: customAreaCode });

// ─── BMapProvider ───

const providerCode = `import { BMapProvider, Map, Marker, useBMapContext } from 'react-bmap';

function Status() {
  const { status, version, error } = useBMapContext();
  return <div>status: {status} / version: {version}{error && \` / \${error.message}\`}</div>;
}

// 实际项目里挂在应用根节点，整个应用只需一个
<BMapProvider
  ak="你的 ak"
  version="4.0"
  unsupportedBehavior="warn"
  fallback={<div>加载 JSAPI 中…</div>}
  errorFallback={<div>JSAPI 加载失败，请检查 ak 与域名白名单</div>}
  onError={(err) => console.error(err)}
  onLoadConflict={(current, requested) => console.warn('loadKey 冲突', current, requested)}
>
  <Status />
  <Map center={{ lng: 116.404, lat: 39.915 }} zoom={11} style={{ height: 400 }}>
    <Marker position={{ lng: 116.404, lat: 39.915 }} />
  </Map>
</BMapProvider>`;

function ProviderStatus() {
  const { status, version, error } = useBMapContext();
  return (
    <div style={{
      padding: '6px 10px', fontSize: 12, color: '#666',
      background: '#fafafa', borderBottom: '1px solid #eee',
    }}>
      status: <b>{status}</b>　version: <b>{version}</b>
      {error && <span style={{ color: '#f5222d' }}>　error: {error.message}</span>}
    </div>
  );
}

// 本示例把 Provider 嵌在页面已有的 Provider 里，只为把 props 的效果跑起来看；
// ak/version 与外层保持一致，loadKey 相同 → 直接复用已加载的 SDK，不会重复请求脚本。
function ProviderDemo() {
  const version = useMapVersion();
  return (
    <BMapProvider
      ak={EXAMPLE_AK}
      version={version}
      unsupportedBehavior="warn"
      fallback={<div style={{ padding: 24, color: '#999' }}>加载 JSAPI 中…</div>}
      errorFallback={<div style={{ padding: 24, color: '#f5222d' }}>JSAPI 加载失败，请检查 ak 与域名白名单</div>}
      onError={(err) => console.error('[demo] BMapProvider 加载失败', err)}
      onLoadConflict={(current, requested) => console.warn('[demo] loadKey 冲突，复用已加载版本', current, requested)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <ProviderStatus />
        <div style={{ flex: 1 }}>
          <MapContainer center={{ lng: 116.404, lat: 39.915 }} zoom={11} style={{ height: '100%' }}>
            <Marker position={{ lng: 116.404, lat: 39.915 }} />
          </MapContainer>
        </div>
      </div>
    </BMapProvider>
  );
}

registerDemo('bmap-provider', { Component: ProviderDemo, code: providerCode });
