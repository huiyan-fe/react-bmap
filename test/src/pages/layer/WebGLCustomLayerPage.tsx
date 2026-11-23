/** WebGLCustomLayer 测试页 — v4+ 自定义着色器图层。 */
import React, { useRef, useState } from 'react';
import { Map, WebGLCustomLayer, useCapabilities } from '@baidumap/react-bmap';
import type { WebGLCustomLayerRef } from '@baidumap/react-bmap';
import { BEIJING } from '../../TestProvider';
import { C, useEventLog, LogPanel } from './visualDemoUtils';

const VS = `attribute vec2 a_pos;
uniform mat4 u_mvpMatrix;
uniform float u_size;
uniform float u_pixelRatio;
uniform float u_time;
void main() {
  float breathe = 0.85 + 0.15 * sin(u_time * 3.0);
  gl_Position = u_mvpMatrix * vec4(a_pos, 0.0, 1.0);
  gl_PointSize = u_size * u_pixelRatio * breathe;
}`;

const FS = `precision mediump float;
uniform vec4 u_color;
uniform float u_opacity;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.0, d) * u_color.a * u_opacity;
  gl_FragColor = vec4(u_color.rgb, alpha);
}`;

export function WebGLCustomLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('WebGLCustomLayer');
  const [count, setCount] = useState(200);
  const [size, setSize] = useState(18);
  const [animation, setAnimation] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [points, setPoints] = useState<number[][]>(() => makePoints(200));
  const layerRef = useRef<WebGLCustomLayerRef>(null);
  const events = useEventLog();

  function makePoints(n: number) {
    return Array.from({ length: n }, () => [
      C.lng + (Math.random() - 0.5) * 0.14,
      C.lat + (Math.random() - 0.5) * 0.09,
    ]);
  }

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}>
          {supported && (
            <WebGLCustomLayer
              ref={layerRef}
              vertexShader={VS}
              fragmentShader={FS}
              referCenter={C}
              attributes={{ a_pos: { data: points, type: 'lnglat' } }}
              uniforms={{ u_color: [0.1, 0.6, 1, 1], u_size: size }}
              draw={{ mode: 'POINTS' }}
              opacity={opacity}
              animation={animation}
              onReady={() => events.push('onReady（着色器编译完成）')}
              onError={(e) => events.push(`error ${String(e)}`)}
            />
          )}
        </Map>
        <LogPanel state={events} hint="onReady / onError 日志" />
      </div>
      <div className="test-controls">
        <h2>WebGLCustomLayer</h2>
        <section>
          <h3>能力 <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span></h3>
          <p className="muted small">@since 4.0。自定义着色器图层。顶点用局部坐标；attributes 的 type 'lnglat' 会自动按 referCenter 投影。SDK 注入 u_mvpMatrix / u_size / u_pixelRatio / u_opacity，animation 时 u_time 持续推进。</p>
        </section>
        <section>
          <h3>点云数据</h3>
          <div className="btn-group">
            {[100, 200, 500].map(n => (
              <button key={n} style={{ fontSize: 11 }} className={count === n ? 'active' : ''} onClick={() => { setCount(n); setPoints(makePoints(n)); events.push(`重新生成 ${n} 个点`); }}>{n} 点</button>
            ))}
            <button style={{ fontSize: 11 }} onClick={() => { setPoints(makePoints(count)); events.push('重新生成点云'); }}>重新生成</button>
          </div>
        </section>
        <section>
          <h3>样式</h3>
          <label>u_size {size} <input type="range" min={4} max={40} value={size} onChange={e => setSize(+e.target.value)} /></label><br />
          <label>opacity {opacity} <input type="range" min={0} max={1} step={0.05} value={opacity} onChange={e => setOpacity(+e.target.value)} /></label><br />
          <label><input type="checkbox" checked={animation} onChange={e => setAnimation(e.target.checked)} /> animation（u_time 持续推进）</label>
        </section>
        <section>
          <h3>ref 句柄</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => { layerRef.current?.setUniforms({ u_size: size + 6 }); events.push(`setUniforms({ u_size: ${size + 6} })`); }}>setUniforms</button>
            <button style={{ fontSize: 11 }} onClick={() => { const p = makePoints(count); setPoints(p); layerRef.current?.setAttributes({ a_pos: { data: p, type: 'lnglat' } }); events.push('setAttributes（新点云）'); }}>setAttributes</button>
            <button style={{ fontSize: 11 }} onClick={() => { layerRef.current?.setDraw({ mode: 'POINTS' }); events.push('setDraw({ mode: POINTS })'); }}>setDraw</button>
            <button style={{ fontSize: 11 }} onClick={() => events.push(`getContext = ${layerRef.current?.getContext() ? 'ctx' : 'null'}，getStatus = ${layerRef.current?.getStatus()}`)}>getContext/getStatus</button>
          </div>
        </section>
        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`<WebGLCustomLayer
  vertexShader={vs} fragmentShader={fs} referCenter={center}
  attributes={{ a_pos: { data: points, type: 'lnglat' } }}
  uniforms={{ u_color: [0.1, 0.6, 1, 1], u_size: 18 }}
  draw={{ mode: 'POINTS' }} animation />`}</pre>
        </section>
      </div>
    </div>
  );
}
