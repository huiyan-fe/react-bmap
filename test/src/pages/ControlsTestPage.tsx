import React, { useState } from 'react';
import {
  Map, NavigationControl, NavigationControl3D, ScaleControl, OverviewMapControl,
  MapTypeControl, CopyrightControl, GeolocationControl, PanoramaControl,
  ZoomControl, CityListControl, LocationControl, LogoControl, useCapabilities,
} from 'react-bmap';
import { BEIJING } from '../TestProvider';

export function ControlsTestPage() {
  const caps = useCapabilities();
  const [show, setShow] = useState<Record<string, boolean>>({ navigation: true, scale: true });

  const toggle = (k: string) => setShow(s => ({ ...s, [k]: !s[k] }));
  const capTag = (cap: string) => caps.has(cap)
    ? <span className="cap-tag ok">✓</span>
    : <span className="cap-tag no">✗</span>;

  const controls: Array<[string, React.ReactNode, React.ReactNode]> = [
    ['navigation', <>NavigationControl {capTag('NavigationControl')}</>, show.navigation && <NavigationControl anchor={0} />],
    ['navigation3D', <>NavigationControl3D (v4+) {capTag('NavigationControl3D')}</>, show.navigation3D && <NavigationControl3D />],
    ['scale', <>ScaleControl {capTag('ScaleControl')}</>, show.scale && <ScaleControl anchor={2} />],
    ['overview', <>OverviewMapControl {capTag('OverviewMapControl')}</>, show.overview && <OverviewMapControl anchor={3} isOpen />],
    ['mapType', <>MapTypeControl {capTag('MapTypeControl')}</>, show.mapType && <MapTypeControl anchor={1} />],
    ['copyright', <>CopyrightControl {capTag('CopyrightControl')}</>, show.copyright && <CopyrightControl anchor={2} />],
    ['geolocation', <>GeolocationControl {capTag('GeolocationControl')}</>, show.geolocation && <GeolocationControl anchor={0} />],
    ['panorama', <>PanoramaControl {capTag('PanoramaControl')}</>, show.panorama && <PanoramaControl anchor={1} />],
    ['zoom', <>ZoomControl (v4+) {capTag('ZoomControl')}</>, show.zoom && <ZoomControl />],
    ['cityList', <>CityListControl (v4+) {capTag('CityListControl')}</>, show.cityList && <CityListControl />],
    ['location', <>LocationControl (v4+) {capTag('LocationControl')}</>, show.location && <LocationControl />],
    ['logo', <>LogoControl (v4+) {capTag('LogoControl')}</>, show.logo && <LogoControl />],
  ];

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}>
          {controls.filter(([, , node]) => node).map(([, , node]) => node)}
        </Map>
      </div>
      <div className="test-controls">
        <h2>Controls（12 种）</h2>
        <div className="btn-group">
          <button onClick={() => setShow(Object.fromEntries(controls.map(([k]) => [k, true])))}>全部显示</button>
          <button onClick={() => setShow({})}>全部隐藏</button>
        </div>
        <section>
          <h3>控件开关</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {controls.map(([key, label]) => (
              <label key={key} className="checkbox-row" style={{ minWidth: 200 }}>
                <input type="checkbox" checked={!!show[key]} onChange={() => toggle(key)} />
                {label}
              </label>
            ))}
          </div>
        </section>
        <p className="muted small">
          v3 上 NavigationControl3D / ZoomControl / CityListControl / LocationControl / LogoControl 不支持。
        </p>
      </div>
    </div>
  );
}
