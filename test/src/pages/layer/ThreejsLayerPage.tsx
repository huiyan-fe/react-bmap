/** ThreejsLayer 测试页 — v4+ three.js 接入图层（示例站自动从 CDN 加载）。 */
import React, { useEffect, useRef, useState } from 'react';
import { Map, ThreejsLayer, useCapabilities } from '@baidumap/react-bmap';
import type { ThreejsLayerRef } from '@baidumap/react-bmap';
import { BEIJING } from '../../TestProvider';
import { loadThree, useEventLog, LogPanel } from './visualDemoUtils';

export function ThreejsLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('ThreejsLayer');
  const [ready, setReady] = useState(!!(globalThis as any).THREE);
  const [error, setError] = useState('');
  const [boxSize, setBoxSize] = useState(500);
  const [animation, setAnimation] = useState(true);
  const meshRef = useRef<any>(null);
  const layerRef = useRef<ThreejsLayerRef>(null);
  const events = useEventLog();

  useEffect(() => {
    if (ready) return;
    loadThree().then(() => setReady(true), (e: Error) => setError(e.message));
  }, [ready]);

  const onInit = (ctx: any) => {
    const THREE = (globalThis as any).THREE;
    if (!THREE) return;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(boxSize, boxSize, boxSize),
      new THREE.MeshBasicMaterial({ color: 0x1890ff }),
    );
    // projectToLayer：入参必须是 [lng, lat] 数组，返回相对于 referCenter 的局部坐标。
    // 这里取与 referCenter 相同的 BEIJING → [0,0]（否则会偏离地图中心，zoom 16 下很容易跑到视野外）。
    const [x, y] = ctx.projectToLayer([BEIJING.lng, BEIJING.lat]);
    mesh.position.set(x, y, boxSize / 2);
    ctx.layer.add(mesh);
    meshRef.current = mesh;
    events.push(`onInit：盒子 ${boxSize} 已加入场景`);
  };

  // animation 只负责「每帧重绘」，场景必须自己变化才能看到动画：
  // 这里在 preRender 里旋转盒子，并且只在 animation 开启时旋转——
  // preRender 在每次实际绘制时都会触发（包括首帧、瓦片加载、拖动等），
  // 若不加这个判断，animation=false 时也会在进入页面/拖动地图时「转一小下然后停住」。
  const preRender = () => {
    if (animation && meshRef.current) meshRef.current.rotation.y += 0.03;
  };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={16} style={{ height: '100%' }}>
          {supported && ready && <ThreejsLayer key={boxSize} ref={layerRef} referCenter={BEIJING} animation={animation} antialias zIndex={5} onInit={onInit} preRender={preRender} onError={(e) => events.push(`error ${String(e)}`)} />}
        </Map>
        <LogPanel state={events} hint="ThreejsLayer 生命周期 / 错误" />
      </div>
      <div className="test-controls">
        <h2>ThreejsLayer</h2>
        <section>
          <h3>能力 <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span></h3>
          <p className="muted small">@since 4.0。three.js 接入图层。three.js 由宿主工程引入并挂到全局 window.THREE（本组件不 import three）。</p>
        </section>
        <section>
          <h3>依赖状态</h3>
          <p className="muted small">{error ? `加载失败：${error}` : ready ? 'window.THREE 已就绪（0.137.5）' : '正在加载 three.js（CDN）…'}</p>
        </section>
        <section>
          <h3>盒子尺寸</h3>
          <div className="btn-group">
            {[200, 500, 1000].map(n => <button key={n} style={{ fontSize: 11 }} className={boxSize === n ? 'active' : ''} onClick={() => setBoxSize(n)}>{n}</button>)}
          </div>
          <p className="muted small">尺寸变化会重建图层（重新 onInit）。</p>
        </section>
        <section>
          <h3>选项</h3>
          <label><input type="checkbox" checked={animation} onChange={e => setAnimation(e.target.checked)} /> animation（逐帧重绘）</label>
          <p className="muted small">
            animation 只表示「每帧自动重绘」，不会自动让场景动起来——必须在 preRender / onRender 里修改场景（如本页旋转盒子）。
            关闭后不再逐帧回调，且本页只在 animation 开启时旋转，所以关闭后保持静止。
          </p>
        </section>
        <section>
          <h3>ref 句柄</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => { if (meshRef.current) { layerRef.current?.removeObject(meshRef.current); events.push('removeObject(mesh)'); } }}>removeObject</button>
            <button style={{ fontSize: 11 }} onClick={() => { if (meshRef.current) { layerRef.current?.add(meshRef.current); events.push('add(mesh) 重新加入'); } }}>add</button>
            <button style={{ fontSize: 11 }} onClick={() => events.push(`getStatus = ${layerRef.current?.getStatus()}`)}>getStatus</button>
            <button style={{ fontSize: 11 }} onClick={() => events.push(`projectToLayer(BEIJING) = ${JSON.stringify(layerRef.current?.projectToLayer([BEIJING.lng, BEIJING.lat]))}`)}>projectToLayer</button>
            <button style={{ fontSize: 11 }} onClick={() => events.push(`scene=${!!layerRef.current?.getScene()} camera=${!!layerRef.current?.getCamera()} renderer=${!!layerRef.current?.getRenderer()}`)}>getScene/Camera/Renderer</button>
            <button style={{ fontSize: 11 }} onClick={() => { layerRef.current?.startAnimation(); events.push(`startAnimation → isAnimating=${layerRef.current?.isAnimating()}`); }}>startAnimation</button>
            <button style={{ fontSize: 11 }} onClick={() => { layerRef.current?.stopAnimation(); events.push(`stopAnimation → isAnimating=${layerRef.current?.isAnimating()}`); }}>stopAnimation</button>
          </div>
          <p className="muted small">对应 JSAPI ThreejsLayer 的命令式句柄；GL 就绪前为 no-op。</p>
        </section>
        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`import * as THREE from 'three';
window.THREE = THREE;

// 必须传 referCenter（局部坐标原点），否则 projectToLayer 返回绝对墨卡托坐标、物体在视野外
<ThreejsLayer referCenter={mapCenter} animation antialias zIndex={5}
  preRender={() => { meshRef.current.rotation.y += 0.03; }}
  onInit={(ctx) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(500, 500, 500),
    new THREE.MeshBasicMaterial({ color: 0x1890ff }),
  );
  const [x, y] = ctx.projectToLayer([lng, lat]);
  mesh.position.set(x, y, 250);
  ctx.layer.add(mesh);
}} />`}</pre>
        </section>
      </div>
    </div>
  );
}
