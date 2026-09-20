/**
 * useConvertor 测试页 — 坐标转换。
 * 覆盖：translate(points, from, to)
 */
import React, { useState } from 'react';
import { Map, useConvertor, useCapabilities } from '@baidumap/react-bmap';
import type { Point } from '@baidumap/react-bmap';
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
  const [batchN, setBatchN] = useState(250);

  const handleRun = () => {
    translate([{ lng: Number(lng), lat: Number(lat) } as Point], from, to);
  };

  // 生成 N 个点，演示 >100 自动分批（原生 translate 单请求上限 100，本 hook 内部按 100 分批并发再合并）
  const runBatch = () => {
    const pts: Point[] = Array.from({ length: batchN }, (_v, i) => ({
      lng: 116.3 + (i % 50) * 0.002,
      lat: 39.8 + Math.floor(i / 50) * 0.002,
    }));
    translate(pts, from, to);
  };

  const outCount = (data as { points?: unknown[] } | undefined)?.points?.length ?? 0;

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
            <button onClick={handleRun} disabled={!supported || loading}>{loading ? 'converting...' : 'translate（单点）'}</button>
            <button onClick={cancel}>cancel</button>
          </div>
        </section>
        <section>
          <h3>批量（&gt;100 点自动分批）</h3>
          <div className="input-row">
            <label>点数</label>
            <input type="number" min={1} max={2000} value={batchN} onChange={e => setBatchN(Number(e.target.value))} style={{ width: 80 }} />
            <button onClick={runBatch} disabled={!supported || loading}>{loading ? 'converting...' : `转换 ${batchN} 个点`}</button>
          </div>
          <p className="muted small">
            原生 translate 单请求上限约 100 点、&gt;100 会静默失败；本 hook 内部按 100 分批、并发请求再按序合并。
            当前结果点数：<code>{outCount}</code>
          </p>
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
{`import { useConvertor } from '@baidumap/react-bmap';

const { translate, data, loading, cancel } = useConvertor();
// from=1 (WGS84), to=5 (BD09)
translate([{ lng: 116.404, lat: 39.915 }], 1, 5);

// >100 点也可直接传：hook 内部按 100 自动分批、并发再合并
translate(manyPoints /* 例如 250 个点 */, 1, 5);`}
          </pre>
        </section>
      </div>
    </div>
  );
}
