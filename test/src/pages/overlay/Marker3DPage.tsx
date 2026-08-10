/** Marker3D 测试页 */
import React, { useState } from 'react';
import { Map, Marker3D, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

export function Marker3DPage() {
  const caps = useCapabilities();
  const supported = caps.has('Map.setHeading');
  const [height, setHeight] = useState(100);
  const [shape, setShape] = useState(1);
  const [size, setSize] = useState(50);
  const [color, setColor] = useState('#1890ff');

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={14} style={{ height: '100%' }}>
          {supported && <Marker3D position={BEIJING} height={height} shape={shape} size={size} fillColor={color} />}
        </Map>
      </div>
      <div className="test-controls">
        <h2>Marker3D</h2>
        <section><h3>能力</h3><span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span><p className="muted small">@since 4.0。3D 标注。</p></section>
        <section><h3>height: {height}</h3><input type="range" min={10} max={500} value={height} onChange={e => setHeight(Number(e.target.value))} className="full-width" /></section>
        <section><h3>shape</h3><div className="btn-group"><button className={shape === 1 ? 'active' : ''} onClick={() => setShape(1)}>圆形(1)</button><button className={shape === 2 ? 'active' : ''} onClick={() => setShape(2)}>方形(2)</button></div></section>
        <section><h3>size: {size}</h3><input type="range" min={10} max={200} value={size} onChange={e => setSize(Number(e.target.value))} className="full-width" /></section>
        <section><h3>color</h3><input type="color" value={color || '#1890ff'} onChange={e => setColor(e.target.value)} /></section>
        <section><h3>代码示例</h3><pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`<Marker3D position={pt} height={100} shape={1} size={50} fillColor="#1890ff" />`}</pre></section>
      </div>
    </div>
  );
}
