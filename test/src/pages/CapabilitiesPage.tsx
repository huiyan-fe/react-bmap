import React from 'react';
import { useCapabilities, useDriver, CAPABILITY_MATRIX } from 'react-bmap';

/**
 * 能力矩阵查看页 — 显示当前 driver 版本 + 完整能力清单（v3 / v4 两列对比）。
 */
export function CapabilitiesPage() {
  const driver = useDriver();
  const caps = useCapabilities();

  if (!driver) {
    return <div className="test-page"><div className="test-controls"><div className="muted">driver 未就绪</div></div></div>;
  }

  const allCaps = new Set<string>([
    ...CAPABILITY_MATRIX['3.0'],
    ...CAPABILITY_MATRIX['4.0'],
  ]);
  const sorted = Array.from(allCaps).sort();

  // 按类别分组
  const groups: Record<string, string[]> = {};
  for (const cap of sorted) {
    let group = '其他';
    if (cap.startsWith('Map.')) group = 'Map 方法';
    else if (cap.startsWith('NavigationControl') || cap.startsWith('Scale') || cap.startsWith('MapType') || cap.startsWith('Overview') || cap.startsWith('Copyright') || cap.startsWith('Geolocation') || cap.startsWith('Panorama') || cap.startsWith('Logo') || cap.startsWith('Zoom') || cap.startsWith('CityList')) group = 'Control';
    else if (cap === 'Prism' || cap === 'Rectangle' || cap === 'BezierCurve' || cap === 'CustomOverlay' || cap === 'GroundPoint' || cap === 'Marker3D' || cap === 'SimpleInfoWindow' || cap === 'MapMask' || cap === 'Hotspot' || cap === 'GroundOverlay' || cap === 'Panorama' || cap === 'PanoramaLabel') group = 'Overlay';
    else if (cap === 'LocalSearch' || cap === 'DrivingRoute' || cap === 'TransitRoute' || cap === 'WalkingRoute' || cap === 'RidingRoute' || cap === 'BusLineSearch' || cap === 'Autocomplete' || cap === 'Geocoder' || cap === 'Geolocation' || cap === 'LocalCity' || cap === 'Boundary' || cap === 'Convertor' || cap === 'PanoramaService' || cap === 'PlaceDetail' || cap === 'TruckRoute') group = 'Service';
    else if (cap === 'Symbol' || cap === 'Icon' || cap === 'IconSequence' || cap === 'Marker' || cap === 'Label' || cap === 'Polyline' || cap === 'Polygon' || cap === 'Circle' || cap === 'PointCollection' || cap === 'InfoWindow') group = 'Overlay';
    groups[group] = groups[group] || [];
    groups[group].push(cap);
  }

  const groupOrder = ['Map 方法', 'Overlay', 'Control', 'Service', '其他'];

  return (
    <div className="test-page">
      <div className="test-controls" style={{ flex: 1, maxWidth: 'none', overflow: 'auto' }}>
        <h2>Capabilities Matrix</h2>
        <p className="muted small">
          当前版本: <code>{driver.version}</code>；
          矩阵来源: <code>src/drivers/capabilityMatrix.ts</code>
        </p>

        <div className="cap-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {groupOrder.map(g => groups[g] ? (
            <div key={g} style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: 8 }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 13, color: '#1890ff' }}>{g} ({groups[g].length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {groups[g].map(cap => {
                  const inV3 = CAPABILITY_MATRIX['3.0'].has(cap);
                  const inV4 = CAPABILITY_MATRIX['4.0'].has(cap);
                  const current = caps.has(cap);
                  return (
                    <div key={cap} style={{
                      padding: '3px 6px', borderRadius: 4, fontSize: 11,
                      fontFamily: 'monospace',
                      background: current ? 'rgba(82,196,26,0.1)' : 'rgba(245,34,45,0.06)',
                      border: `1px solid ${current ? 'rgba(82,196,26,0.2)' : 'rgba(245,34,45,0.1)'}`,
                    }}>
                      <span style={{ color: current ? '#52c41a' : '#f5224d' }}>{current ? '●' : '○'}</span>
                      {' '}
                      <span style={{ color: '#333' }}>{cap}</span>
                      <span style={{ color: '#999', fontSize: 10 }}> {!inV3 ? '(v4+)' : !inV4 ? '(v3)' : ''}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null)}
        </div>

        <section style={{ marginTop: 16 }}>
          <h3>说明</h3>
          <ul className="state-list">
            <li><span style={{ color: '#52c41a' }}>●</span> 当前版本支持</li>
            <li><span style={{ color: '#f5224d' }}>○</span> 当前版本不支持</li>
            <li><code>(v4+)</code> 表示仅 v4 支持；(v3) 表示仅 v3 支持</li>
            <li>切换版本（顶部 Header）后能力快照会更新</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
