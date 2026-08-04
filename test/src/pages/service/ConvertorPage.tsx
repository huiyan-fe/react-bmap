/**
 * useConvertor 测试页 — 坐标转换。
 * 覆盖：translate(points, from, to)
 */
import React, { useState } from 'react';
import { Map, useConvertor, useCapabilities } from 'react-bmap';
import type { Point } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const COORD_TYPES = [
  { label: 'GPS (WGS84)', value: 1 },
  { label: 'Google/Soso (GCJ02)', value: 3 },
  { label: 'Baidu (BD09)', value: 5 },
  { label: 'Baidu MC (BD09MC)', value: 6 },
];

export function ConvertorPage() {
  const caps = useCapabilities();
  const supported = caps.has('Convertor');
  const [lng, setLng] = useState('116.404');
  const [lat, setLat] = useState('39.915');
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(5);
  const { data, loading, error, translate, cancel } = useConvertor();

  const handleRun = () => {
    translate([{ lng: Number(lng), lat: Number(lat) } as Point], from, to);
  };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }} />
      </div>
      <div className="test-controls">
        <h2>useConvertor</h2>
        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'supported' : 'unsupported'}</span>
          <p className="muted small">全版本共有。坐标转换服务。</p>
        </section>
        <section>
          <h3>坐标</h3>
          <div className="input-row">
            <label>lng</label><input type="number" step={0.001} value={lng} onChange={e => setLng(e.target.value)} />
            <label>lat</label><input type="number" step={0.001} value={lat} onChange={e => setLat(e.target.value)} />
          </div>
        </section>
        <section>
          <h3>转换</h3>
          <label className="checkbox-row">from (源坐标系)
            <select value={from} onChange={e => setFrom(Number(e.target.value))}>
              {COORD_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
          <label className="checkbox-row">to (目标坐标系)
            <select value={to} onChange={e => setTo(Number(e.target.value))}>
              {COORD_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
        </section>
        <section>
          <h3>操作</h3>
          <div className="btn-group">
            <button onClick={handleRun} disabled={!supported || loading}>{loading ? 'converting...' : 'translate'}</button>
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
{`import { useConvertor } from 'react-bmap';

const { translate, data, loading, cancel } = useConvertor();
// from=1 (WGS84), to=5 (BD09)
translate([{ lng: 116.404, lat: 39.915 }], 1, 5);`}
          </pre>
        </section>
      </div>
    </div>
  );
}
