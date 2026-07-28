import React, { useState } from 'react';
import {
  Map, useLocalSearch, useGeocoder, useDrivingRoute, useWalkingRoute,
  useRidingRoute, useTransitRoute, useBusLineSearch, useAutocomplete,
  useBoundary, useGeolocation, useLocalCity, usePlaceDetail, useConvertor,
  usePanoramaService, useCapabilities,
} from 'react-bmap';
import { BEIJING } from '../TestProvider';

export function ServicesTestPage() {
  const caps = useCapabilities();
  const [results, setResults] = useState<Record<string, string>>({});

  const setResult = (name: string, msg: string) => setResults(s => ({ ...s, [name]: msg }));

  const capTag = (cap: string) => caps.has(cap)
    ? <span className="cap-tag ok">✓</span>
    : <span className="cap-tag no">✗</span>;

  // 各 Hook
  const localSearch = useLocalSearch('北京');
  const geocoder = useGeocoder();
  const driving = useDrivingRoute({ location: '北京' });
  const walking = useWalkingRoute({ location: '北京' });
  const riding = useRidingRoute({ location: '北京' });
  const transit = useTransitRoute({ location: '北京' });
  const busSearch = useBusLineSearch({ map: undefined });
  const autocomplete = useAutocomplete({ location: '北京' });
  const boundary = useBoundary();
  const geolocation = useGeolocation();
  const localCity = useLocalCity();
  const placeDetail = usePlaceDetail({});
  const convertor = useConvertor();
  const panoramaSvc = usePanoramaService();

  const hooks: Array<[string, React.ReactNode, { supported: boolean; loading: boolean; run: (q: unknown) => void; error: Error | null }]> = [
    ['useLocalSearch', <>LocalSearch {capTag('LocalSearch')}</>, localSearch],
    ['useGeocoder', <>Geocoder {capTag('Geocoder')}</>, geocoder],
    ['useDrivingRoute', <>DrivingRoute {capTag('DrivingRoute')}</>, driving],
    ['useWalkingRoute', <>WalkingRoute {capTag('WalkingRoute')}</>, walking],
    ['useRidingRoute', <>RidingRoute (v4+) {capTag('RidingRoute')}</>, riding],
    ['useTransitRoute', <>TransitRoute {capTag('TransitRoute')}</>, transit],
    ['useBusLineSearch', <>BusLineSearch {capTag('BusLineSearch')}</>, busSearch],
    ['useAutocomplete', <>Autocomplete {capTag('Autocomplete')}</>, autocomplete],
    ['useBoundary', <>Boundary {capTag('Boundary')}</>, boundary],
    ['useGeolocation', <>Geolocation (v4+) {capTag('Geolocation')}</>, geolocation],
    ['useLocalCity', <>LocalCity (v4+) {capTag('LocalCity')}</>, localCity],
    ['usePlaceDetail', <>PlaceDetail (v4+) {capTag('PlaceDetail')}</>, placeDetail],
    ['useConvertor', <>Convertor {capTag('Convertor')}</>, convertor],
    ['usePanoramaService', <>PanoramaService {capTag('PanoramaService')}</>, panoramaSvc],
  ];

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }} />
      </div>
      <div className="test-controls">
        <h2>Services（14 种 Hook）</h2>

        <section>
          <h3>服务状态 & 测试</h3>
          <table className="cap-table" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th>Hook</th>
                <th>supported</th>
                <th>loading</th>
                <th>error</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {hooks.map(([name, label, h]) => (
                <tr key={name}>
                  <td><code>{label}</code></td>
                  <td className={h.supported ? 'yes' : 'no'}>{h.supported ? '✓' : '✗'}</td>
                  <td>{h.loading ? '⏳' : ''}</td>
                  <td className="no" style={{ fontSize: 11 }}>{h.error?.message?.slice(0, 30) ?? ''}</td>
                  <td>
                    <button
                      onClick={() => h.run('餐厅')}
                      disabled={!h.supported || h.loading}
                      style={{ fontSize: 11, padding: '2px 6px' }}
                    >
                      run('餐厅')
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {Object.keys(results).length > 0 && (
          <section>
            <h3>结果</h3>
            {Object.entries(results).map(([k, v]) => (
              <div key={k} style={{ fontSize: 12, marginBottom: 4 }}>
                <code>{k}</code>: {v}
              </div>
            ))}
          </section>
        )}

        <p className="muted small">
          每个 Hook 内部在 effect 中创建 service 实例（render 阶段纯净）。
          v3 上 RidingRoute / Geolocation / LocalCity / PlaceDetail 不支持（supported=✗）。
        </p>
      </div>
    </div>
  );
}
