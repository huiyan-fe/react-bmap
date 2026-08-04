/**
 * usePanoramaService 测试页 — 全景服务。
 * 覆盖：getPanoramaById / getPanoramaByLocation
 */
import React, { useState } from 'react';
import { Map, usePanoramaService, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

export function PanoramaServicePage() {
  const caps = useCapabilities();
  const supported = caps.has('PanoramaService');
  const [mode, setMode] = useState<'byId' | 'byLocation'>('byLocation');
  const [panoId, setPanoId] = useState('');
  const [lng, setLng] = useState('116.404');
  const [lat, setLat] = useState('39.915');
  const [radius, setRadius] = useState(100);
  const { data, loading, error, getPanoramaById, getPanoramaByLocation, cancel } = usePanoramaService();

  const handleRun = () => {
    if (mode === 'byId' && panoId) {
      getPanoramaById(panoId);
    } else if (mode === 'byLocation') {
      getPanoramaByLocation({ lng: Number(lng), lat: Number(lat) }, radius);
    }
  };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }} />
      </div>
      <div className="test-controls">
        <h2>usePanoramaService</h2>
        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'supported' : 'unsupported'}</span>
          <p className="muted small">全版本共有。全景服务，根据坐标或 ID 获取全景数据。</p>
        </section>
        <section>
          <h3>查询模式</h3>
          <div className="btn-group">
            <button className={mode === 'byLocation' ? 'active' : ''} onClick={() => setMode('byLocation')}>按坐标查询</button>
            <button className={mode === 'byId' ? 'active' : ''} onClick={() => setMode('byId')}>按 ID 查询</button>
          </div>
        </section>
        {mode === 'byLocation' ? (
          <section>
            <h3>坐标 + 半径</h3>
            <div className="input-row">
              <label>lng</label><input type="number" step={0.001} value={lng} onChange={e => setLng(e.target.value)} />
              <label>lat</label><input type="number" step={0.001} value={lat} onChange={e => setLat(e.target.value)} />
            </div>
            <label className="checkbox-row">半径 (m) <input type="number" value={radius} onChange={e => setRadius(Number(e.target.value))} /></label>
          </section>
        ) : (
          <section>
            <h3>全景 ID</h3>
            <input className="full-width" value={panoId} onChange={e => setPanoId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRun()} />
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
{`import { usePanoramaService } from 'react-bmap';

const { getPanoramaById, getPanoramaByLocation, data, cancel } = usePanoramaService();
getPanoramaByLocation({ lng: 116.404, lat: 39.915 }, 100); // 按坐标查
getPanoramaById('pano_id_here');                            // 按 ID 查`}
          </pre>
        </section>
      </div>
    </div>
  );
}
