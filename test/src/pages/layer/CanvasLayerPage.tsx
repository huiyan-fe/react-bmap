/**
 * CanvasLayer 测试页 — 自定义 Canvas 图层。
 * dts 标记 @removed 4.0（v3-only），v4 下不可用。
 * 需要 update 回调来绘制内容。
 */
import React, { useMemo, useState } from 'react';
import { Map, CanvasLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const COLORS = ['#1890ff', '#52c41a', '#fa8c16', '#ff4d4f', '#722ed1'];

export function CanvasLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('CanvasLayer');
  const [visible, setVisible] = useState(true);
  const [zIndex, setZIndex] = useState<number | undefined>(undefined);
  const [colorIdx, setColorIdx] = useState(0);

  // update 回调：SDK 调用时 this 是 CanvasLayer 实例，通过 this.canvas 获取 canvas
  const update = useMemo(() => {
    return function(this: any) {
      const canvas = this?.canvas as HTMLCanvasElement;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const color = COLORS[colorIdx];
      for (let i = 0; i < 5; i++) {
        const cx = w * (0.2 + i * 0.15);
        const cy = h * (0.3 + Math.sin(i) * 0.2);
        const r = 40 + i * 10;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = color + '33';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };
  }, [colorIdx]);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={11} style={{ height: '100%' }}>
          {visible && supported && (
            <CanvasLayer key={colorIdx} zIndex={zIndex} update={update as any} />
          )}
        </Map>
      </div>
      <div className="test-controls">
        <h2>CanvasLayer</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'supported' : 'unsupported'}</span>
          <p className="muted small">
            自定义 Canvas 图层。dts 标记 @removed 4.0（v3-only），v4 下不可用。
            需要 update 回调绘制内容。
          </p>
        </section>

        <section>
          <h3>显示</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            显示图层（挂载 / 卸载）
          </label>
        </section>

        <section>
          <h3>update 回调（绘制内容）</h3>
          <p className="muted small">update 回调接收 CanvasRenderingContext2D，在 canvas 上绘制自定义内容。</p>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {COLORS.map((c, i) => (
              <button
                key={c}
                className={colorIdx === i ? 'active' : ''}
                style={{ fontSize: 10, background: c, color: '#fff' }}
                onClick={() => setColorIdx(i)}
              >{c}</button>
            ))}
          </div>
        </section>

        <section>
          <h3>zIndex</h3>
          <input type="number" placeholder="未设置" value={zIndex ?? ''} onChange={e => setZIndex(e.target.value === '' ? undefined : Number(e.target.value))} />
        </section>

        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => { setVisible(true); setZIndex(undefined); setColorIdx(0); }}>reset all</button>
          </div>
        </section>

        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`<Map defaultCenter={center} defaultZoom={11}>
  <CanvasLayer
    zIndex={5}
    update={function() {
      var ctx = this.canvas.getContext('2d');
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = '#1890ff33';
      ctx.fillRect(100, 100, 200, 200);
    }}
  />
</Map>`}
          </pre>
        </section>
      </div>
    </div>
  );
}
