/**
 * useLocalCity 测试页 — 城市定位。
 * 覆盖：get()
 */
import React from 'react';
import { Map, useLocalCity, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

export function LocalCityPage() {
  const caps = useCapabilities();
  const supported = caps.has('LocalCity');
  const { data, loading, error, get, cancel } = useLocalCity();

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }} />
      </div>
      <div className="test-controls">
        <h2>useLocalCity</h2>
        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span>
          <p className="muted small">@since 4.0。城市定位服务。v3 不支持。</p>
        </section>
        <section>
          <h3>操作</h3>
          <div className="btn-group">
            <button onClick={() => get()} disabled={!supported || loading}>{loading ? 'locating...' : '获取城市'}</button>
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
{`import { useLocalCity } from 'react-bmap';

const { get, data, loading, error, cancel } = useLocalCity();
get(); // 获取当前城市`}
          </pre>
        </section>
      </div>
    </div>
  );
}
