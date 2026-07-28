/**
 * 测试页模板工厂 — 为每种组件/Hook 生成独立的测试页。
 * 避免为 50+ 个类各写一个完整文件。
 */
import React, { useState } from 'react';
import { Map } from 'react-bmap';
import { BEIJING } from '../TestProvider';
import type { Point } from 'react-bmap';

// ─── Overlay 测试页 ───────────────
interface OverlayTestConfig<P> {
  name: string;
  Component: React.FC<P>;
  defaultProps: P;
  /** 关键属性编辑器配置 */
  editors?: Array<{
    key: keyof P;
    label: string;
    type: 'point' | 'path' | 'color' | 'number' | 'text' | 'boolean';
  }>;
}

export function makeOverlayTestPage<P extends Record<string, unknown>>(
  config: OverlayTestConfig<P>,
): React.FC {
  return function OverlayTestPage() {
    const [props, setProps] = useState<P>(config.defaultProps);

    const update = (key: keyof P, value: unknown) => setProps(p => ({ ...p, [key]: value }));

    return (
      <div className="test-page">
        <div className="test-map">
          <Map defaultCenter={BEIJING} defaultZoom={13} style={{ height: '100%' }}>
            <config.Component {...props} />
          </Map>
        </div>
        <div className="test-controls">
          <h2>{config.name}</h2>
          {config.editors?.map(ed => (
            <section key={String(ed.key)}>
              <h3>{ed.label}</h3>
              {ed.type === 'text' && (
                <input className="full-width" value={props[ed.key] as string} onChange={e => update(ed.key, e.target.value)} />
              )}
              {ed.type === 'number' && (
                <input type="number" className="full-width" value={props[ed.key] as number} onChange={e => update(ed.key, Number(e.target.value))} />
              )}
              {ed.type === 'color' && (
                <div className="input-row">
                  <input type="color" value={props[ed.key] as string} onChange={e => update(ed.key, e.target.value)} />
                  <code>{props[ed.key] as string}</code>
                </div>
              )}
              {ed.type === 'boolean' && (
                <label className="checkbox-row">
                  <input type="checkbox" checked={props[ed.key] as boolean} onChange={e => update(ed.key, e.target.checked)} />
                  {ed.label}
                </label>
              )}
              {ed.type === 'point' && (
                <div className="input-row">
                  <input type="number" step={0.001} value={(props[ed.key] as Point)?.lng ?? 0} onChange={e => update(ed.key, { ...(props[ed.key] as Point), lng: Number(e.target.value) })} />
                  <input type="number" step={0.001} value={(props[ed.key] as Point)?.lat ?? 0} onChange={e => update(ed.key, { ...(props[ed.key] as Point), lat: Number(e.target.value) })} />
                </div>
              )}
            </section>
          ))}
          <section>
            <h3>当前 Props</h3>
            <pre style={{ fontSize: 11, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
              {JSON.stringify(props, null, 2)}
            </pre>
          </section>
        </div>
      </div>
    );
  };
}

// ─── Control 测试页 ───────────────
export function makeControlTestPage(
  name: string,
  Component: React.ComponentType<any>,
  defaultProps?: Record<string, unknown>,
): React.FC {
  return function ControlTestPage() {
    const [visible, setVisible] = useState(true);
    const [props] = useState(defaultProps ?? {});
    return (
      <div className="test-page">
        <div className="test-map">
          <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}>
            {visible && <Component {...props} />}
          </Map>
        </div>
        <div className="test-controls">
          <h2>{name}</h2>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            显示控件
          </label>
          <p className="muted small">anchor 默认 TOP_LEFT。组件挂载即 addControl，卸载即 removeControl。</p>
        </div>
      </div>
    );
  };
}

// ─── Layer 测试页 ───────────────
export function makeLayerTestPage(
  name: string,
  Component: React.ComponentType<any>,
  defaultProps?: Record<string, unknown>,
): React.FC {
  return function LayerTestPage() {
    const [visible, setVisible] = useState(true);
    return (
      <div className="test-page">
        <div className="test-map">
          <Map defaultCenter={BEIJING} defaultZoom={11} style={{ height: '100%' }}>
            {visible && <Component {...(defaultProps ?? {})} />}
          </Map>
        </div>
        <div className="test-controls">
          <h2>{name}</h2>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            显示图层
          </label>
        </div>
      </div>
    );
  };
}

// ─── Service Hook 测试页 ───────────────
interface ServiceTestConfig {
  name: string;
  hook: (location?: unknown, opts?: unknown) => {
    data: unknown; loading: boolean; error: Error | null;
    supported: boolean; run: (q: unknown) => void; cancel: () => void;
  };
  defaultQuery?: string;
}

export function makeServiceTestPage(config: ServiceTestConfig): React.FC {
  return function ServiceTestPage() {
    const svc = config.hook();
    const [query, setQuery] = useState(config.defaultQuery ?? '餐厅');
    return (
      <div className="test-page">
        <div className="test-map">
          <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }} />
        </div>
        <div className="test-controls">
          <h2>{config.name}</h2>
          <section>
            <h3>能力</h3>
            <div className={`cap-tag ${svc.supported ? 'ok' : 'no'}`}>
              {svc.supported ? 'supported' : 'unsupported'}
            </div>
          </section>
          <section>
            <h3>查询</h3>
            <input className="full-width" value={query} onChange={e => setQuery(e.target.value)} />
            <div className="btn-group">
              <button onClick={() => svc.run(query)} disabled={!svc.supported || svc.loading}>
                {svc.loading ? 'searching...' : 'run'}
              </button>
              <button onClick={svc.cancel}>cancel</button>
            </div>
          </section>
          <section>
            <h3>状态</h3>
            <ul className="state-list">
              <li>loading: <code>{String(svc.loading)}</code></li>
              <li>error: <code>{svc.error?.message ?? 'null'}</code></li>
              <li>data: <code>{svc.data ? JSON.stringify(svc.data).slice(0, 100) : 'null'}</code></li>
            </ul>
          </section>
        </div>
      </div>
    );
  };
}
