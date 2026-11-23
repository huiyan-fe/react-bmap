/** TrackLine 测试页 — v4+ 轨迹线（命令式播放控制）。 */
import React, { useRef, useState } from 'react';
import { Map, TrackLine, useCapabilities } from '@baidumap/react-bmap';
import type { TrackLineRef } from '@baidumap/react-bmap';
import { BEIJING } from '../../TestProvider';
import { trackData, useEventLog, LogPanel } from './visualDemoUtils';

export function TrackLinePage() {
  const caps = useCapabilities();
  const supported = caps.has('TrackLine');
  const [duration, setDuration] = useState(30);
  const [speedMode, setSpeedMode] = useState(1);
  const [autoStart, setAutoStart] = useState(true);
  const [autoFollow, setAutoFollow] = useState(true);
  const [lineVisible, setLineVisible] = useState(true);
  const [passedColor, setPassedColor] = useState('#999999');
  const [progress, setProgress] = useState('—');
  const ref = useRef<TrackLineRef>(null);
  const events = useEventLog();

  const data = trackData(40);
  const movePoint = {
    type: 'ground',
    url: 'https://jsapi-demo.bj.bcebos.com/images/markers/car.png',
    size: [22, 44],
    adjustSize: true,
  };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={13} style={{ height: '100%' }}>
          {supported && (
            <TrackLine
              ref={ref}
              data={data as any}
              duration={duration}
              speedMode={speedMode}
              autoStart={autoStart}
              autoFollow={autoFollow}
              movePoint={movePoint}
              lineVisible={lineVisible}
              passedColor={passedColor}
              strokeColor="#3385ff"
              onProgress={(e: any) => setProgress(`${Math.round((e?.value?.process ?? 0) * 100)}%`)}
              onStatusChange={(e: any) => events.push(`statuschange ${e?.value?.statusName ?? e?.value?.status ?? ''}`)}
            />
          )}
        </Map>
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 99, display: 'flex', gap: 8, background: 'rgba(255,255,255,.95)', padding: 8, borderRadius: 6 }}>
          <button onClick={() => ref.current?.start()}>播放</button>
          <button onClick={() => ref.current?.resume()}>继续</button>
          <button onClick={() => ref.current?.pause()}>暂停</button>
          <button onClick={() => ref.current?.stop()}>停止</button>
          <button onClick={() => ref.current?.setSpeed(2)}>2x</button>
          <button onClick={() => { ref.current?.setFollowOptions({ tilt: 45 }); events.push('setFollowOptions({ tilt: 45 })'); }}>followOptions</button>
          <span style={{ fontSize: 12 }}>进度：{progress}</span>
        </div>
        <LogPanel state={events} hint="播放状态变化会记录在这里" />
      </div>
      <div className="test-controls">
        <h2>TrackLine</h2>
        <section>
          <h3>能力 <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span></h3>
          <p className="muted small">@since 4.0。轨迹线，data 为 GeoJSON LineString；播放时间线默认取 properties.time（与 coordinates 等长）。播放控制走 ref 句柄（start/resume/pause/stop/setSpeed/setAutoFollow/setOptions）。</p>
        </section>
        <section>
          <h3>播放</h3>
          <label>duration {duration}s <input type="range" min={5} max={120} step={5} value={duration} onChange={e => setDuration(+e.target.value)} /></label><br />
          <label>speedMode <input type="range" min={0} max={1} value={speedMode} onChange={e => setSpeedMode(+e.target.value)} /></label>
          <p className="muted small">speedMode=1 按时间戳变速；0 匀速。</p>
          <label><input type="checkbox" checked={autoStart} onChange={e => setAutoStart(e.target.checked)} /> autoStart</label><br />
          <label><input type="checkbox" checked={autoFollow} onChange={e => setAutoFollow(e.target.checked)} /> autoFollow（视野跟随车辆）</label>
        </section>
        <section>
          <h3>样式</h3>
          <label><input type="checkbox" checked={lineVisible} onChange={e => setLineVisible(e.target.checked)} /> lineVisible</label><br />
          <label>已走过颜色 <input type="color" value={passedColor} onChange={e => setPassedColor(e.target.value)} /></label>
        </section>
        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`const trackRef = useRef<TrackLineRef>(null);

<TrackLine ref={trackRef} data={lineGeoJSON} duration={30}
  autoStart autoFollow movePoint={movePoint}
  onProgress={(e) => console.log(e.value.process)} />

trackRef.current?.start();
trackRef.current?.setSpeed(2);
trackRef.current?.setAutoFollow(true);`}</pre>
        </section>
      </div>
    </div>
  );
}
