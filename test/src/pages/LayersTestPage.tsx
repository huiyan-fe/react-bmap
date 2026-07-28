import React, { useState } from 'react';
import {
  Map, TileLayer, NormalLayer, GeoJSONLayer, DistrictLayer, TrafficLayer, CustomLayer, CanvasLayer, useCapabilities,
} from 'react-bmap';
import { BEIJING } from '../TestProvider';

export function LayersTestPage() {
  const caps = useCapabilities();
  const [show, setShow] = useState<Record<string, boolean>>({});

  const toggle = (k: string) => setShow(s => ({ ...s, [k]: !s[k] }));
  const capTag = (cap: string) => caps.has(cap)
    ? <span className="cap-tag ok">✓</span>
    : <span className="cap-tag no">✗</span>;

  const layers: Array<[string, React.ReactNode, React.ReactNode]> = [
    ['tile', <>TileLayer {capTag('TileLayer')}</>, show.tile && <TileLayer tileUrlTemplate="https://api.map.baidu.com/customimage/tile?&x={X}&y={Y}&z={Z}&styles=pl&udt=20150601" />],
    ['normal', <>NormalLayer (v4+) {capTag('NormalLayer')}</>, show.normal && <NormalLayer opacity={0.5} />],
    ['geojson', <>GeoJSONLayer (v4+) {capTag('GeoJSONLayer')}</>, show.geojson && <GeoJSONLayer dataSource={{}} />],
    ['district', <>DistrictLayer (v4+) {capTag('DistrictLayer')}</>, show.district && <DistrictLayer name="北京市" strokeColor="#1890ff" fillColor="#1890ff33" />],
    ['traffic', <>TrafficLayer {capTag('TrafficLayer')}</>, show.traffic && <TrafficLayer />],
    ['custom', <>CustomLayer {capTag('CustomLayer')}</>, show.custom && <CustomLayer databoxId="test" />],
    ['canvas', <>CanvasLayer (v4+) {capTag('CanvasLayer')}</>, show.canvas && <CanvasLayer />],
  ];

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={11} style={{ height: '100%' }}>
          {layers.filter(([, , node]) => node).map(([, , node]) => node)}
        </Map>
      </div>
      <div className="test-controls">
        <h2>Layers（7 种）</h2>
        <div className="btn-group">
          <button onClick={() => setShow(Object.fromEntries(layers.map(([k]) => [k, true])))}>全部显示</button>
          <button onClick={() => setShow({})}>全部隐藏</button>
        </div>
        <section>
          <h3>图层开关</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {layers.map(([key, label]) => (
              <label key={key} className="checkbox-row">
                <input type="checkbox" checked={!!show[key]} onChange={() => toggle(key)} />
                {label}
              </label>
            ))}
          </div>
        </section>
        <p className="muted small">
          v3 上 NormalLayer / GeoJSONLayer / DistrictLayer 不支持。v4 上 TileLayer 已移除（用 NormalLayer 替代）。
        </p>
      </div>
    </div>
  );
}
