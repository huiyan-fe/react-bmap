import React from 'react';
import { BMapProvider, Marker, ScaleControl, useBMapContext } from 'react-bmap';
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
