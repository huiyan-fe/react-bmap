/** SimpleInfoWindow 测试页 */
import React, { useState } from 'react';
import { Map, SimpleInfoWindow, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

export function SimpleInfoWindowPage() {
  const caps = useCapabilities();
  const supported = caps.has('Map.setHeading');
  const [title, setTitle] = useState('天安门');
  const [content, setContent] = useState('这是一个简易信息窗口');
  const [open, setOpen] = useState(true);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={14} style={{ height: '100%' }}>
          {supported && <SimpleInfoWindow position={BEIJING} open={open} title={title} content={content} />}
        </Map>
      </div>
      <div className="test-controls">
        <h2>SimpleInfoWindow</h2>
        <section><h3>能力</h3><span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span><p className="muted small">@since 4.0。简易信息窗口。</p></section>
        <section><h3>title</h3><input className="full-width" value={title} onChange={e => setTitle(e.target.value)} /></section>
        <section><h3>content</h3><input className="full-width" value={content} onChange={e => setContent(e.target.value)} /></section>
        <section><h3>open</h3><label className="checkbox-row"><input type="checkbox" checked={open} onChange={e => setOpen(e.target.checked)} />显示信息窗口</label></section>
        <section><h3>代码示例</h3><pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{`<SimpleInfoWindow position={pt} open={true} title="标题" content="内容" />`}</pre></section>
      </div>
    </div>
  );
}
