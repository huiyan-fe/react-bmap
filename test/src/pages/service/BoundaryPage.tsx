/**
 * useBoundary 测试页 — 行政区划边界。
 * 覆盖：get(name)
 */
import React, { useState } from 'react';
import { Map, useBoundary, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const PRESETS = ['北京市', '上海市', '广东省', '深圳市', '成都市'];

export function BoundaryPage() {
  const caps = useCapabilities();
  const supported = caps.has('Boundary');
  const [query, setQuery] = useState('北京市');
  const { data, loading, error, get, cancel } = useBoundary();

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={8} style={{ height: '100%' }} />
      </div>
      <div className="test-controls">
        <h2>useBoundary</h2>
        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'supported' : 'unsupported'}</span>
          <p className="muted small">全版本共有。行政区划边界查询。</p>
        </section>
        <section>
          <h3>查询（行政区名）</h3>
          <input className="full-width" value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && get(query)} />
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {PRESETS.map(p => <button key={p} style={{ fontSize: 11 }} onClick={() => { setQuery(p); get(p); }}>{p}</button>)}
          </div>
        </section>
        <section>
          <h3>操作</h3>
          <div className="btn-group">
            <button onClick={() => get(query)} disabled={!supported || loading}>{loading ? 'searching...' : 'get'}</button>
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
        {data != null && (
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
{`import { useBoundary } from 'react-bmap';

const { get, data, loading, error, cancel } = useBoundary();
get('北京市');`}
          </pre>
        </section>
      </div>
    </div>
  );
}
