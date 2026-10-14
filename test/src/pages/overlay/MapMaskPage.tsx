/** MapMask 测试页 */
import React, { useState } from 'react';
import { Map, MapMask, useCapabilities } from '@baidumap/react-bmap';
import type { MapMaskSpec } from '@baidumap/react-bmap';
import { BEIJING } from '../../TestProvider';

// 不规则多边形遮罩路径（三角形示例）
const TRIANGLE = [
  { lng: 116.36, lat: 39.92 },
  { lng: 116.44, lat: 39.92 },
  { lng: 116.40, lat: 39.96 },
];
const RECT = { sw: { lng: 116.38, lat: 39.90 }, ne: { lng: 116.42, lat: 39.93 } };

export function MapMaskPage() {
  const caps = useCapabilities();
  const supported = caps.has('Map.setHeading');
  const [showRegion, setShowRegion] = useState<'inside' | 'outside'>('outside');
  const [mode, setMode] = useState<'bounds' | 'points'>('bounds');
  const [viaProp, setViaProp] = useState(true);

  const spec: MapMaskSpec = {
    showRegion, isBuildingMask: true, isPoiMask: true, isMapMask: true,
    ...(mode === 'points' ? { points: TRIANGLE } : { bounds: RECT }),
  };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map
          key={`${viaProp}-${mode}`}
          defaultCenter={BEIJING}
          defaultZoom={11}
          style={{ height: '100%' }}
          mask={supported && viaProp ? spec : undefined}
        >
          {supported && !viaProp && <MapMask {...spec} />}
        </Map>
      </div>
      <div className="test-controls">
        <h2>MapMask</h2>
        <section><h3>能力</h3><span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span><p className="muted small">@since 4.0。区域掩膜。</p></section>
        <section>
          <h3>用法</h3>
          <div className="btn-group">
            <button className={viaProp ? 'active' : ''} onClick={() => setViaProp(true)}>{'<Map mask>（首帧不闪）'}</button>
            <button className={!viaProp ? 'active' : ''} onClick={() => setViaProp(false)}>{'<MapMask> 子组件'}</button>
          </div>
          <p className="muted small">切换后换 key 重挂地图，便于观察首帧。prop 方式首帧瓦片即遮罩态，无"先亮后暗"闪烁。</p>
        </section>
        <section><h3>区域来源</h3><div className="btn-group"><button className={mode === 'bounds' ? 'active' : ''} onClick={() => setMode('bounds')}>bounds（矩形）</button><button className={mode === 'points' ? 'active' : ''} onClick={() => setMode('points')}>points（多边形）</button></div></section>
        <section><h3>showRegion</h3><div className="btn-group"><button className={showRegion === 'outside' ? 'active' : ''} onClick={() => setShowRegion('outside')}>outside（遮罩外部）</button><button className={showRegion === 'inside' ? 'active' : ''} onClick={() => setShowRegion('inside')}>inside（遮罩内部）</button></div></section>
        <section><h3>代码示例</h3><pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{viaProp
          ? `<Map mask={${mode === 'points' ? '{ points: triangle, ...' : '{ bounds, ...'} showRegion:'${showRegion}' }} />`
          : `<Map>\n  <MapMask ${mode === 'points' ? 'points={triangle}' : 'bounds={bounds}'} showRegion="${showRegion}" isBuildingMask isPoiMask isMapMask />\n</Map>`}</pre></section>
      </div>
    </div>
  );
}
