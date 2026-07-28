import React, { useState } from 'react';
import { Map, useLocalSearch } from 'react-bmap';
import type { MapHandle } from 'react-bmap';
import { BEIJING } from '../TestProvider';

/**
 * useLocalSearch Hook 测试。
 *
 * 覆盖：
 * - render 阶段不创建 service（service 在 effect 内 new）
 * - 入参变化自动重建
 * - run / cancel / loading / error / supported
 * - 过期请求保护（连续 search 时只显示最新结果）
 */
export function LocalSearchTestPage() {
  // callback ref 拿 map 实例（useMap 必须在 <Map> 内；这里用 ref 留到外层）
  const [map, setMap] = useState<MapHandle | null>(null);
  const [keyword, setKeyword] = useState('餐厅');
  const [city, setCity] = useState('北京');

  // 注：onReady 在 map 创建时触发，把 MapHandle 抛到外层
  const { loading, error, supported, run, cancel } = useLocalSearch({
    location: city,
    renderOptions: map ? { map, autoViewport: true } : undefined,
  });

  return (
    <div className="test-page">
      <div className="test-map">
        <Map
          defaultCenter={BEIJING}
          defaultZoom={12}
          style={{ height: '100%' }}
          onReady={setMap}
        />
      </div>

      <div className="test-controls">
        <h2>useLocalSearch</h2>

        <section>
          <h3>能力</h3>
          <div className={`cap-tag ${supported ? 'ok' : 'no'}`}>
            {supported ? 'supported' : 'unsupported (current version)'}
          </div>
        </section>

        <section>
          <h3>查询参数</h3>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="city"
            className="full-width"
          />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="keyword"
            className="full-width"
          />
          <div className="btn-group">
            <button onClick={() => run(keyword)} disabled={!supported || loading}>
              {loading ? 'searching...' : 'search'}
            </button>
            <button onClick={cancel}>cancel</button>
          </div>
        </section>

        <section>
          <h3>状态</h3>
          <ul className="state-list">
            <li>supported: <code>{String(supported)}</code></li>
            <li>loading: <code>{String(loading)}</code></li>
            <li>error: <code>{error?.message ?? 'null'}</code></li>
            <li>map ready: <code>{map ? 'yes' : 'no'}</code></li>
          </ul>
        </section>

        <section>
          <h3>说明</h3>
          <p className="muted small">
            本用例验证服务 Hook 生命周期：service 在 effect 中创建（render 纯净）、
            连续 search 时旧请求被 <code>requestIdRef</code> 忽略。
          </p>
          <p className="muted small">
            通过 <code>onReady</code> 把 <code>MapHandle</code> 抛到外层，
            作为 <code>renderOptions.map</code> 传给 Hook。
          </p>
        </section>
      </div>
    </div>
  );
}
