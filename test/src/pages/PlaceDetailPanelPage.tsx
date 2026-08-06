/**
 * PlaceDetail Panel 测试页 — 使用框架的 PlaceDetailPanel 组件。
 * 通过条件渲染显示/隐藏面板，uid 变化自动 render。
 */
import React, { useState } from 'react';
import { Map, PlaceDetailPanel, useCapabilities } from 'react-bmap';
import { BEIJING } from '../TestProvider';

const PRESET_UIDS = [
  { label: '故宫', uid: '06d2dffda107b0ef89f15db6' },
];

const RENDER_OPTS = [
  { key: 'displayCarousel', label: '照片轮播' },
  { key: 'displayTag', label: '标签' },
  { key: 'displayRating', label: '评分' },
  { key: 'displayPrice', label: '价格' },
  { key: 'displayBangdan', label: '排名' },
  { key: 'displayTradeTag', label: '行业标签' },
  { key: 'displayShopHours', label: '营业时间' },
  { key: 'displayContactInformation', label: '联系方式' },
  { key: 'displayAddress', label: '地址' },
  { key: 'displayComment', label: '评论' },
  { key: 'displayCommentTotalCount', label: '评论总数' },
] as const;

export function PlaceDetailPanelPage() {
  const caps = useCapabilities();
  const supported = caps.has('PlaceDetail');
  const [uid, setUid] = useState(PRESET_UIDS[0].uid);
  const [compact, setCompact] = useState(false);
  const [visible, setVisible] = useState(true);
  const [rerenderKey, setRerenderKey] = useState(0);
  const [contactCount, setContactCount] = useState(3);
  const [opts, setOpts] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(RENDER_OPTS.map(o => [o.key, true]))
  );

  const renderOptions = { ...opts, contactInformationCount: contactCount };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={14} style={{ height: '100%' }} />
        {/* 详情面板通过条件渲染显示/隐藏 */}
        {visible && (
          <PlaceDetailPanel
            key={rerenderKey}
            uid={uid}
            compact={compact}
            renderOptions={renderOptions}
            style={{
              position: 'absolute', top: 10, left: 10, zIndex: 10,
              width: '440px', background: '#fff', borderRadius: 8, padding: 4,
              fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              overflow: 'auto', maxHeight: 'calc(100% - 20px)',
            }}
          />
        )}
      </div>
      <div className="test-controls">
        <h2>PlaceDetail Panel 模式</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span>
          <p className="muted small">@since 4.0。组件方式渲染，uid 变化自动 render。</p>
        </section>

        <section>
          <h3>预设地点</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            {PRESET_UIDS.map(p => (
              <button key={p.uid} className={uid === p.uid ? 'active' : ''}
                onClick={() => setUid(p.uid)} disabled={!supported}>
                {p.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>uid</h3>
          <input className="full-width" value={uid} onChange={e => setUid(e.target.value)} />
        </section>

        <section>
          <h3>显示控制</h3>
          <div className="btn-group">
            <button className={visible ? 'active' : ''} onClick={() => setVisible(v => !v)}>
              {visible ? '隐藏面板' : '显示面板'}
            </button>
            <button style={{ fontSize: 11 }} onClick={() => setRerenderKey(k => k + 1)}>
              重建（rerender）
            </button>
          </div>
        </section>

        <section>
          <h3>选项</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={compact} onChange={e => setCompact(e.target.checked)} />
            compact（紧凑模式）
          </label>
        </section>

        <section>
          <h3>渲染选项（renderOptions）</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {RENDER_OPTS.map(o => (
              <label key={o.key} className="checkbox-row" style={{ marginBottom: 4, fontSize: 12 }}>
                <input type="checkbox" checked={opts[o.key] ?? false}
                  onChange={e => setOpts(s => ({ ...s, [o.key]: e.target.checked }))} />
                {o.label}
              </label>
            ))}
          </div>
          <div className="input-row" style={{ marginTop: 8 }}>
            <label style={{ fontSize: 12 }}>联系方式数量</label>
            <input type="number" min={1} max={10} value={contactCount}
              onChange={e => setContactCount(Number(e.target.value))} style={{ width: 60 }} />
          </div>
        </section>
      </div>
    </div>
  );
}
