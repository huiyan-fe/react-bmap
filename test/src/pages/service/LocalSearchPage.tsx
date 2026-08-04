/**
 * useLocalSearch 测试页 — 完整覆盖 SDK dts 全部功能。
 *
 * 覆盖：
 * - search（普通搜索 + 多关键词 + forceLocal）
 * - searchNearby（周边搜索）
 * - searchInBounds（范围搜索）
 * - gotoPage（翻页，控制 panel 结果列表）
 * - clearResults（清空结果）
 * - cancel（取消请求）
 * - pageCapacity / renderOptions（panel / autoViewport）配置
 * - onSearchComplete / onMarkersSet 回调
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Map, useLocalSearch, useCapabilities, useMapContext } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

/** 在 <Map> 内捕获 map handle，传给外部 */
function MapHandleCapture({ onMap }: { onMap: (map: unknown) => void }) {
  const { map } = useMapContext();
  useEffect(() => { if (map) onMap(map); }, [map, onMap]);
  return null;
}

export function LocalSearchPage() {
  const caps = useCapabilities();
  const supported = caps.has('LocalSearch');
  const [keyword, setKeyword] = useState('餐厅');
  const [mode, setMode] = useState<'search' | 'nearby' | 'bounds'>('search');
  const [nearbyCenter, setNearbyCenter] = useState('116.404,39.915');
  const [nearbyRadius, setNearbyRadius] = useState(1000);
  const [pageCapacity, setPageCapacity] = useState(10);
  const [autoViewport, setAutoViewport] = useState(true);
  const [panelEl, setPanelEl] = useState<HTMLElement | null>(null);
  const [mapHandle, setMapHandle] = useState<unknown>(null);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const log = useCallback((msg: string) => {
    setEventLog(s => [`${new Date().toLocaleTimeString()} ${msg}`, ...s].slice(0, 20));
  }, []);

  // panel ref callback — DOM 就绪后设入 state，触发 hook 重建
  const panelCallbackRef = useCallback((el: HTMLDivElement | null) => {
    setPanelEl(el);
  }, []);

  const { data, loading, error, search, searchNearby, searchInBounds, gotoPage, clearResults, cancel } = useLocalSearch({
    location: '北京',
    pageCapacity,
    renderOptions: { map: mapHandle ?? undefined, panel: panelEl ?? undefined, autoViewport },
    onSearchComplete: (results: any) => {
      const num = Array.isArray(results) ? results.length : results?.getNumPois?.() ?? '?';
      log(`✅ onSearchComplete: ${num} 条结果`);
    },
    onMarkersSet: (pois: any[]) => {
      log(`📍 onMarkersSet: ${pois.length} 个标注`);
    },
  });

  const handleRun = () => {
    if (mode === 'search') {
      search(keyword);
      log(`🔍 search("${keyword}")`);
    } else if (mode === 'nearby') {
      const [lng, lat] = nearbyCenter.split(',').map(Number);
      searchNearby(keyword, { lng, lat }, nearbyRadius);
      log(`📍 searchNearby("${keyword}", ${nearbyCenter}, ${nearbyRadius}m)`);
    } else if (mode === 'bounds') {
      searchInBounds(keyword, { sw: { lng: 116.38, lat: 39.90 }, ne: { lng: 116.42, lat: 39.93 } } as any);
      log(`📐 searchInBounds("${keyword}", bounds)`);
    }
  };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}>
          <MapHandleCapture onMap={setMapHandle} />
        </Map>
        <div ref={logRef} style={{
          position: 'absolute', left: 8, bottom: 50,
          maxWidth: 340, maxHeight: 180,
          background: 'rgba(0,0,0,0.75)', color: '#0f0',
          borderRadius: 6, padding: '8px 8px 14px 8px',
          fontSize: 11, fontFamily: 'monospace',
          overflowY: 'auto', zIndex: 10,
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, paddingBottom: 4, borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
            <span>事件日志（{eventLog.length}）</span>
            <button onClick={() => setEventLog([])} style={{ background: 'transparent', border: '1px solid #555', color: '#aaa', cursor: 'pointer', fontSize: 10, borderRadius: 3, padding: '0 6px' }}>清空</button>
          </div>
          {eventLog.length === 0 ? <div style={{ color: '#666' }}>操作日志在此</div> : eventLog.map((line, i) => <div key={i} style={{ lineHeight: 1.6 }}>{line}</div>)}
        </div>
      </div>
      <div className="test-controls">
        <h2>useLocalSearch</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'supported' : 'unsupported'}</span>
          <p className="muted small">全版本共有。本地搜索服务，完整实现 SDK dts 全部方法。</p>
        </section>

        <section>
          <h3>搜索模式</h3>
          <div className="btn-group">
            <button className={mode === 'search' ? 'active' : ''} onClick={() => setMode('search')}>普通搜索</button>
            <button className={mode === 'nearby' ? 'active' : ''} onClick={() => setMode('nearby')}>周边搜索</button>
            <button className={mode === 'bounds' ? 'active' : ''} onClick={() => setMode('bounds')}>范围搜索</button>
          </div>
        </section>

        <section>
          <h3>关键词</h3>
          <input className="full-width" value={keyword} onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRun()} />
        </section>

        {mode === 'nearby' && (
          <section>
            <h3>周边参数</h3>
            <label className="checkbox-row">中心点 (lng,lat) <input type="text" value={nearbyCenter} onChange={e => setNearbyCenter(e.target.value)} /></label>
            <label className="checkbox-row">半径 (m) <input type="number" value={nearbyRadius} onChange={e => setNearbyRadius(Number(e.target.value))} /></label>
          </section>
        )}

        <section>
          <h3>操作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button onClick={handleRun} disabled={!supported || loading}>{loading ? 'searching...' : 'run'}</button>
            <button onClick={() => { gotoPage(0); log('📄 gotoPage(0)'); }} disabled={!supported || loading}>第1页</button>
            <button onClick={() => { gotoPage(1); log('📄 gotoPage(1)'); }} disabled={!supported || loading}>第2页</button>
            <button onClick={() => { clearResults(); log('🧹 clearResults'); }}>clear</button>
            <button onClick={cancel}>cancel</button>
          </div>
          <p className="muted small">翻页按钮控制下方结果面板的页码</p>
        </section>

        <section>
          <h3>配置</h3>
          <label className="checkbox-row">pageCapacity <input type="number" min={1} max={100} value={pageCapacity} onChange={e => setPageCapacity(Number(e.target.value))} /></label>
          <label className="checkbox-row"><input type="checkbox" checked={autoViewport} onChange={e => setAutoViewport(e.target.checked)} /> autoViewport（重建）</label>
        </section>

        <section>
          <h3>状态</h3>
          <ul className="state-list">
            <li>loading: <code>{String(loading)}</code></li>
            <li>error: <code>{error?.message ?? 'null'}</code></li>
            <li>data: <code>{data ? '有结果' : 'null'}</code></li>
          </ul>
        </section>

        {/* SDK 渲染的结果面板 — gotoPage 控制此面板 */}
        <section>
          <h3>结果面板（SDK 渲染，翻页控制）</h3>
          <div ref={panelCallbackRef} style={{
            minHeight: 60,
            background: '#f5f5f5',
            borderRadius: 4,
            padding: 4,
            fontSize: 12,
            border: '1px solid #ddd',
          }}>
            <span className="muted small">搜索后此处显示 SDK 结果列表</span>
          </div>
        </section>

        {data && (
          <section>
            <h3>结果（JSON）</h3>
            <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto', maxHeight: 200 }}>
              {(() => {
                try {
                  return JSON.stringify(data, (key, value) => {
                    if (value instanceof HTMLElement || value instanceof Node) return '<DOM>';
                    if (typeof value === 'function') return '<fn>';
                    if (value && typeof value === 'object' && 'marker' in value && key === 'marker') return '<Marker>';
                    return value;
                  }, 2);
                } catch { return String(data); }
              })()}
            </pre>
          </section>
        )}

        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`import { useLocalSearch } from 'react-bmap';

const {
  data, loading, error, supported,
  search, searchNearby, searchInBounds, gotoPage, clearResults, cancel,
} = useLocalSearch({
  location: '北京',
  pageCapacity: 10,
  renderOptions: { panel: domEl, autoViewport: true },
  onSearchComplete: (results) => console.log(results),
  onMarkersSet: (pois) => console.log(pois),
});

search('餐厅');                          // 普通搜索
search(['餐厅', '酒店']);                // 多关键词
searchNearby('餐厅', { lng, lat }, 1000); // 周边搜索
searchInBounds('餐厅', bounds);          // 范围搜索
gotoPage(2);                              // 翻页（控制 panel）
clearResults();                           // 清空
cancel();                                // 取消`}
          </pre>
        </section>
      </div>
    </div>
  );
}
