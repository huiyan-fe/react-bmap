/**
 * PlaceDetail 测试页 — Service panel 方式。
 * render(uid) 渲染地点详情到面板容器。
 */
import React, { useCallback, useState } from 'react';
import { Map, usePlaceDetail, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const DEFAULT_UID = '06d2dffda107b0ef89f15db6';

export function PlaceDetailPage() {
  const caps = useCapabilities();
  const supported = caps.has('PlaceDetail');
  const [uid, setUid] = useState(DEFAULT_UID);
  const [panelEl, setPanelEl] = useState<HTMLElement | null>(null);
  const panelCallbackRef = useCallback((el: HTMLDivElement | null) => { setPanelEl(el); }, []);

  const { data, loading, error, render, rerender, dispose } = usePlaceDetail({
    container: panelEl ?? undefined,
    renderOptions: {
      displayCarousel: true,
      displayTag: true,
      displayRating: true,
      displayPrice: true,
      displayBangdan: true,
      displayTradeTag: true,
      displayShopHours: true,
      displayContactInformation: true,
      contactInformationCount: 3,
      displayAddress: true,
      displayComment: true,
      displayCommentTotalCount: true,
    },
  });

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={14} style={{ height: '100%' }} />
      </div>
      <div className="test-controls">
        <h2>PlaceDetail</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span>
          <p className="muted small">@since 4.0。地点详情面板模式。render(uid) 渲染到容器。</p>
        </section>

        <section>
          <h3>uid</h3>
          <input className="full-width" value={uid} onChange={e => setUid(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && render(uid)} />
        </section>

        <section>
          <h3>操作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button onClick={() => render(uid)} disabled={!supported || loading}>{loading ? 'rendering...' : 'render'}</button>
            <button style={{ fontSize: 11 }} onClick={rerender}>rerender</button>
            <button style={{ fontSize: 11 }} onClick={dispose}>dispose</button>
          </div>
        </section>

        <section>
          <h3>状态</h3>
          <ul className="state-list">
            <li>loading: <code>{String(loading)}</code></li>
            <li>error: <code>{error?.message ?? 'null'}</code></li>
            <li>data: <code>{data ? '有结果' : 'null'}</code></li>
          </ul>
        </section>

        <section>
          <h3>详情面板</h3>
          <div ref={panelCallbackRef} style={{
            minHeight: 100, background: '#fff', borderRadius: 4, padding: 4,
            fontSize: 12, border: '1px solid #ccc', overflow: 'auto', maxHeight: 300,
          }}>
            <span className="muted small">render 后显示地点详情</span>
          </div>
        </section>

        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`const { render, rerender, dispose, data } = usePlaceDetail({
  container: domEl,
  renderOptions: {
    displayCarousel: true,
    displayTag: true,
    displayRating: true,
    displayPrice: true,
    displayAddress: true,
    displayComment: true,
  },
});
render('06d2dffda107b0ef89f15db6'); // 天安门 uid`}
          </pre>
        </section>
      </div>
    </div>
  );
}
