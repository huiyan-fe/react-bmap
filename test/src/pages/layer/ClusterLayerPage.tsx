/** ClusterLayer 测试页 — v4+ 点聚合图层。 */
import React, { useState } from 'react';
import { Map, ClusterLayer, useCapabilities } from '@baidumap/react-bmap';
import { BEIJING } from '../../TestProvider';
import { randomPointsData, useEventLog, LogPanel } from './visualDemoUtils';

const COUNT_OPTIONS = [500, 2000, 5000];

export function ClusterLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('ClusterLayer');
  const [count, setCount] = useState(2000);
  const [data, setData] = useState(() => randomPointsData(2000, false));
  const [radius, setRadius] = useState(60);
  const [minPoints, setMinPoints] = useState(2);
  const [updateRealTime, setUpdateRealTime] = useState(false);
  const [fitViewOnClick, setFitViewOnClick] = useState(true);
  const events = useEventLog();

  const regenerate = (n = count) => { setCount(n); setData(randomPointsData(n, false)); events.push(`重新生成 ${n} 个点`); };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={11} style={{ height: '100%' }}>
          {supported && (
            <ClusterLayer
              data={data as any}
              clusterRadius={radius}
              clusterMinPoints={minPoints}
              updateRealTime={updateRealTime}
              fitViewOnClick={fitViewOnClick}
              onClick={(e: any) => {
                const v = e?.value;
                events.push(v?.isCluster ? `聚合 ${v.pointCount} 个点 @ ${e?.latLng?.lng},${e?.latLng?.lat}` : `点击单点 ${v?.properties?.name ?? ''}`);
              }}
              onChange={() => events.push('change（聚合结果变化）')}
            />
          )}
        </Map>
        <LogPanel state={events} hint="点击聚合点 / 单点触发事件" />
      </div>
      <div className="test-controls">
        <h2>ClusterLayer</h2>
        <section>
          <h3>能力 <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span></h3>
          <p className="muted small">@since 4.0。点聚合图层，data 为 GeoJSON；点击聚合点自动 fitView（fitViewOnClick 默认 true）。</p>
        </section>
        <section>
          <h3>数据</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {COUNT_OPTIONS.map(n => <button key={n} style={{ fontSize: 11 }} className={count === n ? 'active' : ''} onClick={() => regenerate(n)}>{n} 点</button>)}
            <button style={{ fontSize: 11 }} onClick={() => regenerate()}>重新生成</button>
          </div>
          <p className="muted small">当前 {data.features.length} 个点；data 变化调用 setData()。</p>
        </section>
        <section>
          <h3>clusterRadius: {radius}</h3>
          <input type="range" min={20} max={120} value={radius} onChange={e => setRadius(+e.target.value)} className="full-width" />
        </section>
        <section>
          <h3>clusterMinPoints: {minPoints}</h3>
          <input type="range" min={2} max={10} value={minPoints} onChange={e => setMinPoints(+e.target.value)} className="full-width" />
        </section>
        <section>
          <h3>选项</h3>
          <label><input type="checkbox" checked={updateRealTime} onChange={e => setUpdateRealTime(e.target.checked)} /> 拖动/缩放实时刷新</label><br />
          <label><input type="checkbox" checked={fitViewOnClick} onChange={e => setFitViewOnClick(e.target.checked)} /> 点击聚合点自动调整视野</label>
        </section>
        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`<ClusterLayer data={geojson} clusterRadius={60} clusterMinPoints={2}
  fitViewOnClick updateRealTime={false}
  onClick={(e) => {
    const v = e.value;
    if (v?.isCluster) console.log('聚合', v.pointCount, e.latLng);
  }} />`}</pre>
        </section>
      </div>
    </div>
  );
}
