/**
 * useGeocoder 测试页 — 地理编码服务。
 * 覆盖：getPoint（地址→坐标）/ getLocation（坐标→地址）/ 批量 getPoints·getLocations（并发）
 */
import React, { useState } from 'react';
import { Map, Marker, useGeocoder, useCapabilities } from 'react-bmap';
import type { Point } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const PRESET_ADDRESSES = [
  '北京市海淀区中关村',
  '北京市朝阳区国贸',
  '北京市东城区天安门',
  '北京市西城区西单',
  '北京市丰台区北京南站',
];

export function GeocoderPage() {
  const caps = useCapabilities();
  const supported = caps.has('Geocoder');
  const [mode, setMode] = useState<'getPoint' | 'getLocation' | 'batch'>('getPoint');
  const [address, setAddress] = useState('北京市天安门');
  const [lng, setLng] = useState('116.404');
  const [lat, setLat] = useState('39.915');
  const { data, loading, error, getPoint, getLocation, getPoints, getLocations, cancel } = useGeocoder();

  // 批量状态
  const [batchText, setBatchText] = useState(PRESET_ADDRESSES.join('\n'));
  const [batchRows, setBatchRows] = useState<{ address: string; point: Point | null }[]>([]);
  const [batchAddrs, setBatchAddrs] = useState<(string | null)[]>([]);
  const [batchBusy, setBatchBusy] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const batchAddresses = batchText.split('\n').map(s => s.trim()).filter(Boolean);
  const okPoints = batchRows.filter(r => r.point) as { address: string; point: Point }[];

  const handleRun = () => {
    if (mode === 'getPoint') {
      getPoint(address);
    } else if (mode === 'getLocation') {
      getLocation({ lng: Number(lng), lat: Number(lat) } as Point);
    }
  };

  const runGetPoints = async () => {
    setBatchBusy(true); setElapsed(null); setBatchAddrs([]);
    const t0 = performance.now();
    const points = await getPoints(batchAddresses);
    setElapsed(Math.round(performance.now() - t0));
    setBatchRows(batchAddresses.map((a, i) => ({ address: a, point: points[i] })));
    setBatchBusy(false);
  };

  const runGetLocations = async () => {
    const pts = okPoints.map(r => r.point);
    if (!pts.length) return;
    setBatchBusy(true);
    const results = await getLocations(pts);
    setBatchAddrs(results.map(r => r?.address ?? null));
    setBatchBusy(false);
  };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={mode === 'batch' ? 11 : 12} style={{ height: '100%' }}>
          {mode === 'batch' && okPoints.map((r, i) => (
            <Marker key={r.address} position={r.point} title={`${i + 1}. ${r.address}`} />
          ))}
        </Map>
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
            <button className={mode === 'batch' ? 'active' : ''} onClick={() => setMode('batch')}>批量(并发)</button>
          </div>
        </section>
        {mode !== 'batch' && (
          <>
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
          </>
        )}
        {mode === 'batch' && (
          <>
            <section>
              <h3>地址列表（每行一个）</h3>
              <textarea className="full-width" rows={6} value={batchText} onChange={e => setBatchText(e.target.value)}
                style={{ fontSize: 12, fontFamily: 'monospace' }} />
              <div className="btn-group" style={{ marginTop: 8 }}>
                <button onClick={runGetPoints} disabled={!supported || batchBusy || !batchAddresses.length}>getPoints（并发→坐标）</button>
                <button onClick={runGetLocations} disabled={!supported || batchBusy || !okPoints.length}>getLocations（并发→地址）</button>
              </div>
              {elapsed != null && (
                <p className="muted small">{batchAddresses.length} 个地址并发耗时 ≈ {elapsed}ms（成功 {okPoints.length}）</p>
              )}
            </section>
            <section>
              <h3>结果（保序，失败位 null）</h3>
              {batchRows.length === 0 && <p className="muted small">点上面按钮运行</p>}
              <ol style={{ fontSize: 12, paddingLeft: 20 }}>
                {batchRows.map((r, i) => (
                  <li key={r.address} style={{ marginBottom: 4 }}>
                    {r.address}
                    {r.point
                      ? <span style={{ color: '#2b8a3e' }}> → {r.point.lng.toFixed(5)}, {r.point.lat.toFixed(5)}</span>
                      : <span style={{ color: '#c92a2a' }}> → null</span>}
                    {batchAddrs[okPoints.findIndex(o => o.address === r.address)] && r.point && (
                      <span style={{ color: '#1971c2' }}> ↩ {batchAddrs[okPoints.findIndex(o => o.address === r.address)]}</span>
                    )}
                  </li>
                ))}
              </ol>
            </section>
            <section>
              <p className="muted small">
                批量方法直接返回 Promise（不经过 data/loading），内部并发 + Promise.all 保序、每项各带 10s 超时兜底。
                底层 Geocoder 实例并发安全，一个实例即可。
              </p>
            </section>
          </>
        )}
        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`import { useGeocoder } from 'react-bmap';

const { getPoint, getLocation, getPoints, getLocations, data, loading, cancel } = useGeocoder();
getPoint('北京市天安门');              // 单发 地址→坐标（结果落 data）
getLocation({ lng: 116.404, lat: 39.915 }); // 单发 坐标→地址

// 并发批量（直接返回 Promise，不经过 data/loading，保序、失败位 null）
const points = await getPoints(['北京', '上海', '广州']);
const addrs = await getLocations(points.filter(Boolean));`}
          </pre>
        </section>
      </div>
    </div>
  );
}
