/**
 * useGeocoder 测试页 — 地理编码服务。
 * 覆盖：getPoint（地址→坐标）/ getLocation（坐标→地址）
 */
import React, { useState } from 'react';
import { Map, useGeocoder, useCapabilities } from 'react-bmap';
import type { Point } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

export function GeocoderPage() {
  const caps = useCapabilities();
  const supported = caps.has('Geocoder');
  const [mode, setMode] = useState<'getPoint' | 'getLocation'>('getPoint');
  const [address, setAddress] = useState('北京市天安门');
  const [lng, setLng] = useState('116.404');
  const [lat, setLat] = useState('39.915');
  const { data, loading, error, getPoint, getLocation, cancel } = useGeocoder();

  const handleRun = () => {
    if (mode === 'getPoint') {
      getPoint(address);
    } else {
      getLocation({ lng: Number(lng), lat: Number(lat) } as Point);
    }
  };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }} />
      </div>
      <div className="test-controls">
        <h2>useGeocoder</h2>
        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'supported' : 'unsupported'}</span>
          <p className="muted small">全版本共有。地理编码：地址↔坐标转换。</p>
        </section>
        <section>
          <h3>模式</h3>
          <div className="btn-group">
            <button className={mode === 'getPoint' ? 'active' : ''} onClick={() => setMode('getPoint')}>地址→坐标</button>
            <button className={mode === 'getLocation' ? 'active' : ''} onClick={() => setMode('getLocation')}>坐标→地址</button>
          </div>
        </section>
        {mode === 'getPoint' ? (
          <section>
            <h3>地址</h3>
            <input className="full-width" value={address} onChange={e => setAddress(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRun()} />
          </section>
        ) : (
          <section>
            <h3>坐标</h3>
            <div className="input-row">
              <label>lng</label><input type="number" step={0.001} value={lng} onChange={e => setLng(e.target.value)} />
              <label>lat</label><input type="number" step={0.001} value={lat} onChange={e => setLat(e.target.value)} />
            </div>
          </section>
        )}
        <section>
          <h3>操作</h3>
          <div className="btn-group">
            <button onClick={handleRun} disabled={!supported || loading}>{loading ? 'searching...' : 'run'}</button>
            <button onClick={cancel}>cancel</button>
          </div>
        </section>
        <section>
          <h3>状态</h3>
          <ul className="state-list">
            <li>loading: <code>{String(loading)}</code></li>
            <li>error: <code>{error?.message ?? 'null'}</code></li>
            <li>data: <code>{data ? '有结果' : 'null'}</code></li>
          </ul>
        </section>
        {data && (
          <section>
            <h3>结果</h3>
            <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto', maxHeight: 300 }}>
              {(() => { try { return JSON.stringify(data, (k, v) => v instanceof HTMLElement ? '<DOM>' : typeof v === 'function' ? '<fn>' : v, 2); } catch { return String(data); } })()}
            </pre>
          </section>
        )}
        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`import { useGeocoder } from 'react-bmap';

const { getPoint, getLocation, data, loading, cancel } = useGeocoder();
getPoint('北京市天安门');              // 地址→坐标
getLocation({ lng: 116.404, lat: 39.915 }); // 坐标→地址`}
          </pre>
        </section>
      </div>
    </div>
  );
}
