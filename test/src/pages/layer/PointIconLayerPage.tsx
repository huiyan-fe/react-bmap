/**
 * PointIconLayer 测试页 — v4+。图标点图层。
 * 支持 setData（GeoJSON 数据）、style（图标样式）。
 *
 * 组件方式：
 * <PointIconLayer style={{ icon: 'url', width: 25, height: 25 }} data={geojson} />
 */
import React, { useMemo, useState } from 'react';
import { Map, PointIconLayer, useCapabilities } from 'react-bmap';
import type { PointIconStyle } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const ICON_URL = 'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_1.png';

const DEMO_DATA = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.404, 39.915] }, properties: { id: 1, name: '天安门' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.415, 39.910] }, properties: { id: 2, name: '故宫' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.397, 39.913] }, properties: { id: 3, name: '中山公园' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.417, 39.928] }, properties: { id: 4, name: '北海公园' } },
  ],
};

export function PointIconLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('PointIconLayer');
  const [visible, setVisible] = useState(true);
  const [isFlat, setIsFlat] = useState(true);
  const [isFixed, setIsFixed] = useState(true);
  const [iconUrl, setIconUrl] = useState(ICON_URL);
  const [width, setWidth] = useState(25);
  const [height, setHeight] = useState(25);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(1);

  const style = useMemo<PointIconStyle>(() => ({
    icon: iconUrl,
    sizes: [width, height],
    scale,
    rotation,
    opacity,
  }), [iconUrl, width, height, scale, rotation, opacity]);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={14} style={{ height: '100%' }}>
          {visible && supported && (
            <PointIconLayer
              isFlat={isFlat}
              isFixed={isFixed}
              idKey="id"
              style={style}
              data={DEMO_DATA}
            />
          )}
        </Map>
      </div>
      <div className="test-controls">
        <h2>PointIconLayer</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span>
          <p className="muted small">@since 4.0。图标点图层，支持贴地/非贴地图标渲染。通过 setData 加载 GeoJSON 数据。v3 不支持。</p>
        </section>

        <section>
          <h3>显示</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            显示图层（挂载 / 卸载）
          </label>
        </section>

        <section>
          <h3>数据</h3>
          <p className="muted small">{DEMO_DATA.features.length} 个点标注（天安门/故宫/中山公园/北海公园）。</p>
        </section>

        <section>
          <h3>isFlat（贴地）</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={isFlat} onChange={e => setIsFlat(e.target.checked)} />
            贴地（重建）
          </label>
        </section>

        <section>
          <h3>isFixed（固定大小）</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={isFixed} onChange={e => setIsFixed(e.target.checked)} />
            图标不随缩放改变尺寸（重建）
          </label>
        </section>

        <section>
          <h3>icon（图标 URL）</h3>
          <input type="text" className="full-width" value={iconUrl} onChange={e => setIconUrl(e.target.value)} />
        </section>

        <section>
          <h3>width: {width}px</h3>
          <input type="range" min={5} max={100} value={width} onChange={e => setWidth(Number(e.target.value))} className="full-width" />
        </section>

        <section>
          <h3>height: {height}px</h3>
          <input type="range" min={5} max={100} value={height} onChange={e => setHeight(Number(e.target.value))} className="full-width" />
        </section>

        <section>
          <h3>scale: {scale}</h3>
          <input type="range" min={0.1} max={5} step={0.1} value={scale} onChange={e => setScale(Number(e.target.value))} className="full-width" />
        </section>

        <section>
          <h3>rotation: {rotation}°</h3>
          <input type="range" min={0} max={360} value={rotation} onChange={e => setRotation(Number(e.target.value))} className="full-width" />
        </section>

        <section>
          <h3>opacity: {opacity}</h3>
          <input type="range" min={0} max={1} step={0.1} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="full-width" />
        </section>

        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => { setVisible(true); setIsFlat(true); setIsFixed(true); setIconUrl(ICON_URL); setWidth(25); setHeight(25); setScale(1); setRotation(0); setOpacity(1); }}>reset all</button>
          </div>
        </section>

        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`<Map defaultCenter={center} defaultZoom={14}>
  <PointIconLayer
    isFlat
    isFixed
    idKey="id"
    style={{
      icon: 'https://jsapi-demo.bj.bcebos.com/images/markers/marker_demo_1.png',
      width: 25,
      height: 25,
      scale: 1,
      rotation: 0,
    }}
    data={{
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'Point', coordinates: [116.404, 39.915] }, properties: { id: 1 } },
      ],
    }}
  />
</Map>`}
          </pre>
        </section>
      </div>
    </div>
  );
}
