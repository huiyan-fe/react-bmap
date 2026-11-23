/**
 * TrackLine 官方示例复刻 — 对应 JSAPI 示例中心「轨迹动画」的 3 个案例：
 *   1. 基本用法（base）
 *   2. 调整速度（speed）
 *   3. 调整样式（style）
 */
import React, { useRef, useState } from 'react';
import { Map, TrackLine, useCapabilities } from '@baidumap/react-bmap';
import type { TrackLineRef } from '@baidumap/react-bmap';
import { useEventLog, LogPanel } from './visualDemoUtils';

type CaseId = 'base' | 'speed' | 'style';
const CASES: Array<{ id: CaseId; label: string }> = [
  { id: 'base', label: '基本用法' },
  { id: 'speed', label: '调整速度' },
  { id: 'style', label: '调整样式' },
];

// 官方示例坐标（[经度, 纬度]）
const COORDS: Array<[number, number]> = [
  [116.310823, 40.003418], [116.311538, 39.994606], [116.312181, 39.991014],
  [116.334538, 39.991369], [116.360841, 39.991777], [116.387144, 39.992185],
  [116.413447, 39.992593], [116.439750, 39.992990], [116.468679, 39.993441],
  [116.468894, 39.985586], [116.469144, 39.976160], [116.469394, 39.966734],
  [116.469679, 39.955737],
];
const DATA = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: COORDS } };
const STROKE_TEXTURE_URL = 'https://mapopen-pub-jsapi.bj.bcebos.com/jsapiGlgeo/img/down.png';
const CAR_URL = 'https://jsapi-demo.bj.bcebos.com/images/markers/car.png';
const MOVE_POINT = { type: 'ground', url: CAR_URL, size: [22, 44], adjustSize: true };
const MAP_CENTER = { lng: 116.39, lat: 39.99 };

export function TrackLineDemoPage() {
  const caps = useCapabilities();
  const supported = caps.has('TrackLine');
  const [caseId, setCaseId] = useState<CaseId>('base');
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const ref = useRef<TrackLineRef>(null);
  const events = useEventLog(30);

  const start = () => {
    if (paused) { ref.current?.resume(); setPaused(false); events.push('resume() 从暂停处继续'); }
    else { ref.current?.start(); events.push('start() 从头播放'); }
  };
  const pause = () => { ref.current?.pause(); setPaused(true); events.push('pause()'); };
  const reset = () => {
    ref.current?.stop(); setPaused(false);
    if (caseId === 'speed') { ref.current?.setSpeed(1); setSpeed(1); }
    events.push('stop() 停止并回到起点');
  };
  const changeSpeed = (n: number) => {
    ref.current?.setSpeed(n);
    const actual = ref.current?.getSpeed?.() ?? n;
    setSpeed(actual);
    events.push(`setSpeed(${n}) → getSpeed() = ${actual}`);
  };
  const applyLinear = (stops: Array<[number, string]> | null) => {
    if (stops) { ref.current?.setOptions({ isLinear: true, linearTexture: stops }); events.push(`isLinear = true, linearTexture = ${JSON.stringify(stops)}`); }
    else { ref.current?.setOptions({ isLinear: false }); events.push('isLinear = false（恢复 strokeColor）'); }
  };

  const switchCase = (id: CaseId) => {
    setCaseId(id); setPaused(false); setSpeed(1);
    events.push(`切换到案例：${CASES.find(c => c.id === id)?.label}`);
  };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={MAP_CENTER} defaultZoom={14} displayOptions={{ poi: false }} style={{ height: '100%' }}>
          {supported && (
            <TrackLine
              key={caseId}
              ref={ref}
              data={DATA as any}
              duration={10}
              strokeWeight={10}
              passedColor="rgba(153, 153, 153, 1)"
              strokeTextureUrl={STROKE_TEXTURE_URL}
              strokeTextureWidth={64}
              strokeTextureHeight={32}
              strokeTextureSpaced
              strokeTextureGap={32}
              movePoint={MOVE_POINT}
              renderStage={caseId === 'style' ? 'poi' : undefined}
              onProgress={(e: any) => {
                const v = e?.value ?? e;
                if (!v) return;
                events.push(`progress ${((v.process ?? 0) * 100).toFixed(1)}% elapsed=${Number(v.elapsed).toFixed(1)}s distance=${Math.round(v.distance ?? 0)}m`);
              }}
              onStatusChange={(e: any) => {
                const v = e?.value ?? e;
                events.push(`statuschange ${v?.statusName ?? v?.status ?? ''}`);
              }}
            />
          )}
        </Map>
        <LogPanel state={events} hint="progress / statuschange 及操作日志" />
      </div>
      <div className="test-controls">
        <h2>TrackLine 官方示例（3 案例）</h2>
        <section>
          <h3>能力 <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span></h3>
          <p className="muted small">复刻 JSAPI 示例中心「轨迹动画」的基本用法 / 调整速度 / 调整样式（不含综合案例）。</p>
        </section>
        <section>
          <h3>案例</h3>
          <div className="btn-group">
            {CASES.map(c => <button key={c.id} style={{ fontSize: 11 }} className={caseId === c.id ? 'active' : ''} onClick={() => switchCase(c.id)}>{c.label}</button>)}
          </div>
        </section>
        <section>
          <h3>播放控制</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={start}>{paused ? '继续播放' : '开始播放'}</button>
            <button style={{ fontSize: 11 }} onClick={pause}>暂停</button>
            <button style={{ fontSize: 11 }} onClick={reset}>重置</button>
          </div>
          <p className="muted small">暂停后再点「开始播放」从暂停处继续（resume），否则从头播放（start）。</p>
        </section>
        {caseId === 'speed' && (
          <section>
            <h3>调整速度（当前 {speed} 倍速）</h3>
            <div className="btn-group">
              {[0.5, 1, 2].map(n => <button key={n} style={{ fontSize: 11 }} className={speed === n ? 'active' : ''} onClick={() => changeSpeed(n)}>{n}×</button>)}
            </div>
          </section>
        )}
        {caseId === 'style' && (
          <>
            <section>
              <h3>线性渐变（isLinear / linearTexture）</h3>
              <div className="btn-group" style={{ flexWrap: 'wrap' }}>
                <button style={{ fontSize: 11 }} onClick={() => applyLinear([[0, '#00c853'], [0.5, '#ffd600'], [1, '#d50000']])}>绿→黄→红</button>
                <button style={{ fontSize: 11 }} onClick={() => applyLinear([[0, 'purple'], [0.5, 'red'], [1, 'green']])}>紫→红→绿</button>
                <button style={{ fontSize: 11 }} onClick={() => applyLinear(null)}>关闭渐变</button>
              </div>
            </section>
            <section>
              <h3>已走过路段颜色（passedColor）</h3>
              <div className="btn-group">
                <button style={{ fontSize: 11 }} onClick={() => { ref.current?.setOptions({ passedColor: 'rgba(153,153,153,1)' }); events.push('passedColor = 灰色'); }}>灰色</button>
                <button style={{ fontSize: 11 }} onClick={() => { ref.current?.setOptions({ passedColor: 'rgba(230,30,30,1)' }); events.push('passedColor = 红色'); }}>红色</button>
                <button style={{ fontSize: 11 }} onClick={() => { ref.current?.setOptions({ passedColor: 'none' }); events.push('passedColor = none'); }}>隐藏</button>
              </div>
            </section>
            <section>
              <h3>线宽（strokeWeight）</h3>
              <div className="btn-group">
                {[6, 10, 16].map(w => <button key={w} style={{ fontSize: 11 }} onClick={() => { ref.current?.setOptions({ strokeWeight: w }); events.push(`strokeWeight = ${w}`); }}>{w}</button>)}
              </div>
              <p className="muted small">样式修改走 setOptions，播放进度会保留。</p>
            </section>
          </>
        )}
        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`<TrackLine ref={trackRef} data={data} duration={10}
  strokeWeight={10} passedColor="rgba(153,153,153,1)"
  strokeTextureUrl=".../down.png" strokeTextureWidth={64}
  strokeTextureHeight={32} strokeTextureSpaced strokeTextureGap={32}
  movePoint={movePoint} onProgress={onProgress} />

// 播放：start / resume / pause / stop
// 速度：trackRef.current.setSpeed(2) / getSpeed()
// 样式：trackRef.current.setOptions({ isLinear: true, linearTexture: [...] })`}</pre>
        </section>
      </div>
    </div>
  );
}
