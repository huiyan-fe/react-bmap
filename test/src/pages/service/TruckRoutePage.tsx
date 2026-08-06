/** useTruckRoute 测试页 — 货车路线规划。 */
import React, { useCallback, useState } from 'react';
import { Map, useTruckRoute, useCapabilities, useMapContext } from 'react-bmap';
import { BEIJING } from '../../TestProvider';
import { safeStringifySdkResult } from '../../utils/sdkResult';

function MapHandleCapture({ onMap }: { onMap: (map: unknown) => void }) {
  const { map } = useMapContext();
  React.useEffect(() => { if (map) onMap(map); }, [map, onMap]);
  return null;
}

export function TruckRoutePage() {
  const caps = useCapabilities();
  const supported = caps.has('TruckRoute');
  const [start, setStart] = useState('116.404,39.915');
  const [end, setEnd] = useState('116.397,39.908');
  const [autoViewport, setAutoViewport] = useState(true);
  const [mapHandle, setMapHandle] = useState<unknown>(null);
  const [panelEl, setPanelEl] = useState<HTMLElement | null>(null);
  const panelCallbackRef = useCallback((el: HTMLDivElement | null) => { setPanelEl(el); }, []);

  const { data, loading, error, search, clearResults, enableAutoViewport, disableAutoViewport, getStatus, cancel } = useTruckRoute({
    location: '北京',
    renderOptions: { map: mapHandle ?? undefined, panel: panelEl ?? undefined, autoViewport },
  });

  const parsePoint = (s: string) => { const [lng, lat] = s.split(',').map(Number); return { lng, lat }; };
  const handleSearch = () => search(parsePoint(start), parsePoint(end));

  return (
    <div className="test-page">
      <div className="test-map"><Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}><MapHandleCapture onMap={setMapHandle} /></Map></div>
      <div className="test-controls">
        <h2>useTruckRoute</h2>
        <section><h3>能力</h3><span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span><p className="muted small">@since 4.0。货车路线规划。search 只接受坐标(Point)。</p></section>
        <section><h3>起点 (lng,lat)</h3><input className="full-width" value={start} onChange={e => setStart(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} /></section>
        <section><h3>终点 (lng,lat)</h3><input className="full-width" value={end} onChange={e => setEnd(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} /></section>
        <section><h3>操作</h3><div className="btn-group" style={{ flexWrap: 'wrap' }}>
          <button onClick={handleSearch} disabled={!supported || loading}>{loading ? 'searching...' : 'search'}</button>
          <button onClick={clearResults}>clear</button><button onClick={cancel}>cancel</button>
        </div>
        <div className="btn-group" style={{ flexWrap: 'wrap', marginTop: 4 }}>
          <button style={{ fontSize: 11 }} className={autoViewport ? 'active' : ''} onClick={() => { setAutoViewport(true); enableAutoViewport(); }}>enableAutoViewport</button>
          <button style={{ fontSize: 11 }} className={!autoViewport ? 'active' : ''} onClick={() => { setAutoViewport(false); disableAutoViewport(); }}>disableAutoViewport</button>
        </div></section>
        <section><h3>状态</h3><ul className="state-list"><li>loading: <code>{String(loading)}</code></li><li>error: <code>{error?.message ?? 'null'}</code></li><li>status: <code>{String(getStatus())}</code></li><li>data: <code>{data && Object.keys(data as object).length > 0 ? '有结果' : '空/无结果'}</code></li></ul></section>
        <section><h3>结果面板</h3><div ref={panelCallbackRef} style={{ minHeight: 60, background: '#f5f5f5', borderRadius: 4, padding: 4, fontSize: 12, border: '1px solid #ddd' }}><span className="muted small">搜索后显示路线结果</span></div></section>
        {data && <section><h3>结果（JSON）</h3><pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto', maxHeight: 200 }}>{safeStringifySdkResult(data)}</pre></section>}
        <section><h3>代码示例</h3><pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`const { search, clearResults, getStatus, data, cancel } = useTruckRoute({
  location: '北京',
  renderOptions: { map, panel: domEl, autoViewport: true },
});
search({ lng: 116.404, lat: 39.915 }, { lng: 116.397, lat: 39.908 });`}</pre></section>
      </div>
    </div>
  );
}
