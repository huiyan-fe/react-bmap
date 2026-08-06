/** useTransitRoute 测试页 — 公交路线规划，完整覆盖。 */
import React, { useCallback, useState } from 'react';
import { Map, useTransitRoute, useCapabilities, useMapContext } from 'react-bmap';
import { BEIJING } from '../../TestProvider';
import { safeStringifySdkResult } from '../../utils/sdkResult';

function MapHandleCapture({ onMap }: { onMap: (map: unknown) => void }) {
  const { map } = useMapContext();
  React.useEffect(() => { if (map) onMap(map); }, [map, onMap]);
  return null;
}

function getPolicyValue(constantName: string, fallback: number): number {
  const SDK = (window as any).BMap;
  return SDK?.[constantName] ?? fallback;
}

export function TransitRoutePage() {
  const caps = useCapabilities();
  const supported = caps.has('TransitRoute');
  const [start, setStart] = useState('116.404,39.915');
  const [end, setEnd] = useState('116.326,39.989');
  const [policy, setPolicy] = useState(0);
  const [autoViewport, setAutoViewport] = useState(true);
  const [mapHandle, setMapHandle] = useState<unknown>(null);
  const [panelEl, setPanelEl] = useState<HTMLElement | null>(null);
  const panelCallbackRef = useCallback((el: HTMLDivElement | null) => { setPanelEl(el); }, []);

  const { data, loading, error, search, clearResults, enableAutoViewport, disableAutoViewport, setPolicy: hookSetPolicy, setPageCapacity, getStatus, cancel } = useTransitRoute({
    location: '北京',
    policy,
    renderOptions: { map: mapHandle ?? undefined, panel: panelEl ?? undefined, autoViewport },
  });

  const parsePoint = (s: string) => { const [lng, lat] = s.split(',').map(Number); return { lng, lat }; };
  const handleSearch = () => search(parsePoint(start), parsePoint(end));

  return (
    <div className="test-page">
      <div className="test-map"><Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}><MapHandleCapture onMap={setMapHandle} /></Map></div>
      <div className="test-controls">
        <h2>useTransitRoute</h2>
        <section><h3>能力</h3><span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'supported' : 'unsupported'}</span><p className="muted small">全版本共有。公交路线规划。search 只接受坐标(Point)。</p></section>
        <section><h3>起点 (lng,lat)</h3><input className="full-width" value={start} onChange={e => setStart(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} /><p className="muted small">默认：天安门(116.404,39.915)</p></section>
        <section><h3>终点 (lng,lat)</h3><input className="full-width" value={end} onChange={e => setEnd(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} /><p className="muted small">默认：中关村(116.326,39.989)</p></section>
        <section><h3>策略 (policy)</h3><div className="btn-group">
          <button className={policy === 0 ? 'active' : ''} style={{ fontSize: 11 }} onClick={() => { setPolicy(0); hookSetPolicy(0); }}>默认</button>
          <button className={policy === getPolicyValue('BMAP_TRANSIT_POLICY_LEAST_TIME', 0) ? 'active' : ''} style={{ fontSize: 11 }} onClick={() => { const v = getPolicyValue('BMAP_TRANSIT_POLICY_LEAST_TIME', 0); setPolicy(v); hookSetPolicy(v); }}>最少时间</button>
          <button className={policy === getPolicyValue('BMAP_TRANSIT_POLICY_LEAST_TRANSFER', 1) ? 'active' : ''} style={{ fontSize: 11 }} onClick={() => { const v = getPolicyValue('BMAP_TRANSIT_POLICY_LEAST_TRANSFER', 1); setPolicy(v); hookSetPolicy(v); }}>最少换乘</button>
          <button className={policy === getPolicyValue('BMAP_TRANSIT_POLICY_LEAST_WALKING', 2) ? 'active' : ''} style={{ fontSize: 11 }} onClick={() => { const v = getPolicyValue('BMAP_TRANSIT_POLICY_LEAST_WALKING', 2); setPolicy(v); hookSetPolicy(v); }}>最少步行</button>
          <button className={policy === getPolicyValue('BMAP_TRANSIT_POLICY_NO_SUBWAY', 3) ? 'active' : ''} style={{ fontSize: 11 }} onClick={() => { const v = getPolicyValue('BMAP_TRANSIT_POLICY_NO_SUBWAY', 3); setPolicy(v); hookSetPolicy(v); }}>不坐地铁</button>
        </div></section>
        <section><h3>操作</h3><div className="btn-group" style={{ flexWrap: 'wrap' }}>
          <button onClick={handleSearch} disabled={!supported || loading}>{loading ? 'searching...' : 'search'}</button>
          <button onClick={clearResults}>clear</button><button onClick={cancel}>cancel</button>
        </div>
        <div className="btn-group" style={{ flexWrap: 'wrap', marginTop: 4 }}>
          <button style={{ fontSize: 11 }} className={autoViewport ? 'active' : ''} onClick={() => { setAutoViewport(true); enableAutoViewport(); }}>enableAutoViewport</button>
          <button style={{ fontSize: 11 }} className={!autoViewport ? 'active' : ''} onClick={() => { setAutoViewport(false); disableAutoViewport(); }}>disableAutoViewport</button>
          <button style={{ fontSize: 11 }} onClick={() => setPageCapacity(5)}>setPageCapacity(5)</button>
        </div></section>
        <section><h3>状态</h3><ul className="state-list"><li>loading: <code>{String(loading)}</code></li><li>error: <code>{error?.message ?? 'null'}</code></li><li>status: <code>{String(getStatus())}</code></li><li>data: <code>{data && Object.keys(data as object).length > 0 ? '有结果' : '空/无结果'}</code></li></ul></section>
        <section><h3>结果面板</h3><div ref={panelCallbackRef} style={{ minHeight: 60, background: '#f5f5f5', borderRadius: 4, padding: 4, fontSize: 12, border: '1px solid #ddd' }}><span className="muted small">搜索后显示路线结果</span></div></section>
        {data && <section><h3>结果（JSON）</h3><pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto', maxHeight: 200 }}>{safeStringifySdkResult(data)}</pre></section>}
        <section><h3>代码示例</h3><pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`const { search, clearResults, setPolicy, setPageCapacity, getStatus, data, cancel } = useTransitRoute({
  location: '北京',
  policy: 0,
  renderOptions: { map, panel: domEl, autoViewport: true },
});
search({ lng: 116.404, lat: 39.915 }, { lng: 116.326, lat: 39.989 });
setPolicy(BMAP_TRANSIT_POLICY_LEAST_TRANSFER);
setPageCapacity(5);`}</pre></section>
      </div>
    </div>
  );
}
