/** useDrivingRoute 测试页 — 驾车路线规划，完整覆盖 SDK dts。 */
import React, { useCallback, useState } from 'react';
import { Map, useDrivingRoute, useCapabilities, useMapContext } from 'react-bmap';
import { BEIJING } from '../../TestProvider';
import { safeStringifySdkResult } from '../../utils/sdkResult';

function MapHandleCapture({ onMap }: { onMap: (map: unknown) => void }) {
  const { map } = useMapContext();
  React.useEffect(() => { if (map) onMap(map); }, [map, onMap]);
  return null;
}

const STATUS_MEANING: Record<number, string> = {
  0: '成功', 1: '无路线', 2: '结果无效', 3: '未找到', 4: '未知位置', 5: '搜索失败',
};

function getPolicyValue(constantName: string, fallback: number): number {
  const SDK = (window as any).BMapGL || (window as any).BMap;
  return SDK?.[constantName] ?? fallback;
}

export function DrivingRoutePage() {
  const caps = useCapabilities();
  const supported = caps.has('DrivingRoute');
  const [start, setStart] = useState('116.404,39.915');
  const [end, setEnd] = useState('116.397,39.908');
  const [waypoints, setWaypoints] = useState('');
  const [policy, setPolicy] = useState(getPolicyValue('BMAP_DRIVING_POLICY_LEAST_TIME', 0));
  const [autoViewport, setAutoViewport] = useState(true);
  const [mapHandle, setMapHandle] = useState<unknown>(null);
  const [panelEl, setPanelEl] = useState<HTMLElement | null>(null);

  const panelCallbackRef = useCallback((el: HTMLDivElement | null) => { setPanelEl(el); }, []);

  const { data, loading, error, search, clearResults, enableAutoViewport, disableAutoViewport, setPolicy: hookSetPolicy, getStatus, cancel } = useDrivingRoute({
    location: '北京',
    policy,
    renderOptions: { map: mapHandle ?? undefined, panel: panelEl ?? undefined, autoViewport },
    onMarkersSet: (pois) => console.log('[DrivingRoute] onMarkersSet:', pois?.length, 'pois'),
    onPolylinesSet: (pls) => console.log('[DrivingRoute] onPolylinesSet:', pls?.length, 'polylines'),
  });

  const parsePoint = (s: string) => {
    const [lng, lat] = s.split(',').map(Number);
    return { lng, lat };
  };

  const handleSearch = () => {
    const wpList = waypoints ? waypoints.split(';').map(s => s.trim()).filter(Boolean).map(parsePoint) : [];
    search(parsePoint(start), parsePoint(end), wpList.length > 0 ? { waypoints: wpList } : undefined);
  };

  const status = getStatus();

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}>
          <MapHandleCapture onMap={setMapHandle} />
        </Map>
      </div>
      <div className="test-controls">
        <h2>useDrivingRoute</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'supported' : 'unsupported'}</span>
          <p className="muted small">全版本共有。驾车路线规划。注意：search 只接受坐标(Point)，不支持字符串地址。</p>
        </section>

        <section>
          <h3>起点 (lng,lat)</h3>
          <input className="full-width" value={start} onChange={e => setStart(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <p className="muted small">默认：天安门(116.404,39.915)</p>
        </section>

        <section>
          <h3>终点 (lng,lat)</h3>
          <input className="full-width" value={end} onChange={e => setEnd(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <p className="muted small">默认：西单(116.397,39.908)</p>
        </section>

        <section>
          <h3>途经点（分号分隔，可选）</h3>
          <input className="full-width" placeholder="如：116.400,39.912;116.410,39.910" value={waypoints} onChange={e => setWaypoints(e.target.value)} />
        </section>

        <section>
          <h3>策略 (policy)</h3>
          <div className="btn-group">
            <button key="default" className={policy === getPolicyValue('BMAP_DRIVING_POLICY_LEAST_TIME', 0) ? 'active' : ''} style={{ fontSize: 11 }}
              onClick={() => { const v = getPolicyValue('BMAP_DRIVING_POLICY_LEAST_TIME', 0); setPolicy(v); hookSetPolicy(v); }}>默认</button>
            <button key="avoid" className={policy === getPolicyValue('BMAP_DRIVING_POLICY_AVOID_HIGHWAYS', 1) ? 'active' : ''} style={{ fontSize: 11 }}
              onClick={() => { const v = getPolicyValue('BMAP_DRIVING_POLICY_AVOID_HIGHWAYS', 1); setPolicy(v); hookSetPolicy(v); }}>避高速</button>
            <button key="short" className={policy === getPolicyValue('BMAP_DRIVING_POLICY_SHORTEST', 2) ? 'active' : ''} style={{ fontSize: 11 }}
              onClick={() => { const v = getPolicyValue('BMAP_DRIVING_POLICY_SHORTEST', 2); setPolicy(v); hookSetPolicy(v); }}>最短</button>
            <button key="jam" className={policy === getPolicyValue('BMAP_DRIVING_POLICY_AVOID_TRAFFIC_JAM', 3) ? 'active' : ''} style={{ fontSize: 11 }}
              onClick={() => { const v = getPolicyValue('BMAP_DRIVING_POLICY_AVOID_TRAFFIC_JAM', 3); setPolicy(v); hookSetPolicy(v); }}>避开拥堵</button>
          </div>
          <p className="muted small">策略值从 SDK 常量读取，当前 policy = {policy}</p>
        </section>

        <section>
          <h3>操作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button onClick={handleSearch} disabled={!supported || loading}>{loading ? 'searching...' : 'search'}</button>
            <button onClick={clearResults}>clear</button>
            <button onClick={cancel}>cancel</button>
          </div>
          <div className="btn-group" style={{ flexWrap: 'wrap', marginTop: 4 }}>
            <button style={{ fontSize: 11 }} className={autoViewport ? 'active' : ''} onClick={() => { setAutoViewport(true); enableAutoViewport(); }}>enableAutoViewport</button>
            <button style={{ fontSize: 11 }} className={!autoViewport ? 'active' : ''} onClick={() => { setAutoViewport(false); disableAutoViewport(); }}>disableAutoViewport</button>
          </div>
        </section>

        <section>
          <h3>状态</h3>
          <ul className="state-list">
            <li>loading: <code>{String(loading)}</code></li>
            <li>error: <code>{error?.message ?? 'null'}</code></li>
            <li>status: <code>{String(status)}</code> ({status !== undefined ? STATUS_MEANING[status] ?? '未知' : 'N/A'})</li>
            <li>data: <code>{data && Object.keys(data as object).length > 0 ? '有结果' : '空/无结果'}</code></li>
          </ul>
          {status !== undefined && status !== 0 && (
            <p className="muted small" style={{ color: '#ff4d4f' }}>
              ⚠️ 搜索失败（status={status}）。可能是策略不支持该路线，或坐标无效。先试"默认"策略确认搜索能工作。
            </p>
          )}
        </section>

        <section>
          <h3>结果面板（SDK 渲染）</h3>
          <div ref={panelCallbackRef} style={{ minHeight: 60, background: '#f5f5f5', borderRadius: 4, padding: 4, fontSize: 12, border: '1px solid #ddd' }}>
            <span className="muted small">搜索后此处显示 SDK 路线结果</span>
          </div>
        </section>

        {data && (
          <section>
            <h3>结果（JSON）</h3>
            <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto', maxHeight: 200 }}>{safeStringifySdkResult(data)}</pre>
          </section>
        )}

        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`import { useDrivingRoute } from 'react-bmap';

const {
  search, clearResults, enableAutoViewport, disableAutoViewport,
  setPolicy, getStatus, data, loading, cancel,
} = useDrivingRoute({
  location: mapHandle,
  policy: 0,
  renderOptions: { map: mapHandle, panel: domEl, autoViewport: true },
  onSearchComplete: (results) => console.log(results),
  onMarkersSet: (pois) => console.log(pois),
});

// search 只接受 Point（{lng,lat}），不支持字符串地址
search({ lng: 116.404, lat: 39.915 }, { lng: 116.397, lat: 39.908 });

// 途经点
search(start, end, { waypoints: [{ lng, lat }] });

setPolicy(1); // 避高速
enableAutoViewport();
getStatus(); // 0=成功`}
          </pre>
        </section>
      </div>
    </div>
  );
}
