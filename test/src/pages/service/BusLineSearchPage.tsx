/** useBusLineSearch 测试页 — 公交线路搜索。覆盖 getBusList/getBusLine/clearResults */
import React, { useCallback, useState } from 'react';
import { Map, useBusLineSearch, useCapabilities, useMapContext } from 'react-bmap';
import { BEIJING } from '../../TestProvider';
import { safeStringifySdkResult } from '../../utils/sdkResult';

function MapHandleCapture({ onMap }: { onMap: (map: unknown) => void }) {
  const { map } = useMapContext();
  React.useEffect(() => { if (map) onMap(map); }, [map, onMap]);
  return null;
}

export function BusLineSearchPage() {
  const caps = useCapabilities();
  const supported = caps.has('BusLineSearch');
  const [keyword, setKeyword] = useState('1路');
  const [mapHandle, setMapHandle] = useState<unknown>(null);
  const [panelEl, setPanelEl] = useState<HTMLElement | null>(null);
  const panelCallbackRef = useCallback((el: HTMLDivElement | null) => { setPanelEl(el); }, []);

  const { data, loading, error, getBusList, getBusLine, clearResults, cancel } = useBusLineSearch({
    location: mapHandle ?? '北京',
    renderOptions: { map: mapHandle ?? undefined, panel: panelEl ?? undefined, autoViewport: true },
    onGetBusListComplete: (r) => console.log('[BusLineSearch] onGetBusListComplete:', r),
    onGetBusLineComplete: (r) => console.log('[BusLineSearch] onGetBusLineComplete:', r),
  });

  return (
    <div className="test-page">
      <div className="test-map"><Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}><MapHandleCapture onMap={setMapHandle} /></Map></div>
      <div className="test-controls">
        <h2>useBusLineSearch</h2>
        <section><h3>能力</h3><span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'supported' : 'unsupported'}</span><p className="muted small">全版本共有。公交线路搜索。getBusList 搜索线路列表，getBusLine 获取具体线路。</p></section>
        <section><h3>关键词</h3><input className="full-width" value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && getBusList(keyword)} /></section>
        <section><h3>操作</h3><div className="btn-group" style={{ flexWrap: 'wrap' }}>
          <button onClick={() => getBusList(keyword)} disabled={!supported || loading}>{loading ? 'searching...' : 'getBusList'}</button>
          <button onClick={() => data && getBusLine((data as any)?.getBusListItem?.(0) ?? data)} disabled={!supported || loading}>getBusLine(0)</button>
          <button onClick={clearResults}>clear</button><button onClick={cancel}>cancel</button>
        </div></section>
        <section><h3>状态</h3><ul className="state-list"><li>loading: <code>{String(loading)}</code></li><li>error: <code>{error?.message ?? 'null'}</code></li><li>data: <code>{data ? '有结果' : 'null'}</code></li></ul></section>
        <section><h3>结果面板</h3><div ref={panelCallbackRef} style={{ minHeight: 60, background: '#f5f5f5', borderRadius: 4, padding: 4, fontSize: 12, border: '1px solid #ddd' }}><span className="muted small">搜索后显示线路列表</span></div></section>
        {data && <section><h3>结果（JSON）</h3><pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto', maxHeight: 200 }}>{safeStringifySdkResult(data)}</pre></section>}
        <section><h3>代码示例</h3><pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`const { getBusList, getBusLine, clearResults, data, cancel } = useBusLineSearch({
  location: '北京',
  renderOptions: { map, panel: domEl, autoViewport: true },
});
getBusList('1路'); // 搜索线路列表
getBusLine(item);  // 获取具体线路`}</pre></section>
      </div>
    </div>
  );
}
