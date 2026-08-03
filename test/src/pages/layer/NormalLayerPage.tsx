/**
 * NormalLayer 测试页 — NormalLayer 是抽象基类（@hide），不能直接使用。
 * 用户需要继承并实现 onAdd / render 方法。
 *
 * 本页使用 <NormalLayer /> 组件方式演示：
 * - 组件内部通过 driver 创建 noop 子类（不报错，但无可见效果）
 * - 真正使用需要继承 NormalLayer 自行实现 WebGL 渲染
 */
import React, { useState } from 'react';
import { Map, NormalLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

export function NormalLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('NormalLayer');
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={11} style={{ height: '100%' }}>
          {visible && supported && (
            <NormalLayer key={`${opacity}`} opacity={opacity} />
          )}
        </Map>
      </div>
      <div className="test-controls">
        <h2>NormalLayer</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span>
          <p className="muted small">
            NormalLayer 是抽象基类（@hide），不能直接使用。
            用户需要继承并实现 <code>onAdd</code> / <code>render</code> 方法。
            具体子类包括：FeatureLayer、FillLayer、PointIconLayer、PointShapeLayer。
          </p>
        </section>

        <section>
          <h3>显示</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            显示图层（挂载 / 卸载）
          </label>
          <p className="muted small">
            组件内部创建 noop 子类，不会报错，但也无可见渲染效果。
            需要 WebGL 自定义渲染请参考下方代码示例。
          </p>
        </section>

        <section>
          <h3>opacity: {opacity}</h3>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={opacity}
            onChange={e => setOpacity(Number(e.target.value))}
            className="full-width"
          />
          <p className="muted small">opacity 变化时通过 key 重建图层</p>
        </section>

        <section>
          <h3>代码示例 — 组件方式</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`import { Map, NormalLayer } from 'react-bmap';

<Map defaultCenter={center} defaultZoom={11}>
  <NormalLayer opacity={0.5} />
</Map>`}
          </pre>
        </section>

        <section>
          <h3>代码示例 — 自定义子类（WebGL 渲染）</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`class MyLayer extends BMap.NormalLayer {
  onAdd(map, gl) {
    // 初始化 WebGL 资源
  }
  render(gl, matrix) {
    // 执行 WebGL 绘制逻辑
  }
}
const myLayer = new MyLayer({ opacity: 0.5 });
map.addLayer(myLayer);`}
          </pre>
        </section>
      </div>
    </div>
  );
}
