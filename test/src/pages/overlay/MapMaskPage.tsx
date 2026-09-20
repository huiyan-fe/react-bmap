/** MapMask 测试页 */
import React, { useState } from 'react';
import { Map, MapMask, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

// 不规则多边形遮罩路径（三角形示例）
const TRIANGLE = [
  { lng: 116.36, lat: 39.92 },
  { lng: 116.44, lat: 39.92 },
  { lng: 116.40, lat: 39.96 },
];

export function MapMaskPage() {
  const caps = useCapabilities();
  const supported = caps.has('Map.setHeading');
  const [showRegion, setShowRegion] = useState<'inside' | 'outside'>('outside');
  const [mode, setMode] = useState<'bounds' | 'points'>('bounds');

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={11} style={{ height: '100%' }}>
          {supported && mode === 'bounds' && (
            <MapMask bounds={{ sw: { lng: 116.38, lat: 39.90 }, ne: { lng: 116.42, lat: 39.93 } }} showRegion={showRegion} isBuildingMask isPoiMask isMapMask />
          )}
          {supported && mode === 'points' && (
            <MapMask points={TRIANGLE} showRegion={showRegion} isBuildingMask isPoiMask isMapMask />
          )}
        </Map>
      </div>
      <div className="test-controls">
        <h2>MapMask</h2>
        <section><h3>能力</h3><span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span><p className="muted small">@since 4.0。区域掩膜。</p></section>
        <section><h3>区域来源</h3><div className="btn-group"><button className={mode === 'bounds' ? 'active' : ''} onClick={() => setMode('bounds')}>bounds（矩形）</button><button className={mode === 'points' ? 'active' : ''} onClick={() => setMode('points')}>points（多边形）</button></div></section>
        <section><h3>showRegion</h3><div className="btn-group"><button className={showRegion === 'outside' ? 'active' : ''} onClick={() => setShowRegion('outside')}>outside（遮罩外部）</button><button className={showRegion === 'inside' ? 'active' : ''} onClick={() => setShowRegion('inside')}>inside（遮罩内部）</button></div></section>
        <section><h3>代码示例</h3><pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{mode === 'points' ? `<MapMask points={triangle} showRegion="${showRegion}" isBuildingMask isPoiMask isMapMask />` : `<MapMask bounds={bounds} showRegion="${showRegion}" isBuildingMask isPoiMask isMapMask />`}</pre></section>
      </div>
    </div>
  );
}
