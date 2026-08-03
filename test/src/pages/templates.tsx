/**
 * 测试页模板工厂 — 为每种组件/Hook 生成独立的测试页。
 * 避免为 50+ 个类各写一个完整文件。
 */
import React, { useMemo, useState } from 'react';
import { Map, useCapabilities } from 'react-bmap';
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
type ControlEditorType = 'anchor' | 'size' | 'number' | 'text' | 'boolean' | 'select';

interface ControlEditor {
  key: string;
  label: string;
  type: ControlEditorType;
  options?: Array<{ label: string; value: unknown }>;
}

interface ControlTestConfig {
  capability?: string;
  versionNote?: string;
  editors?: ControlEditor[];
  callbacks?: Array<{ prop: string; label: string }>;
  presets?: Array<{ label: string; props: Record<string, unknown> }>;
}

const ANCHORS = [
  { label: 'TOP_LEFT', value: 0 },
  { label: 'TOP_RIGHT', value: 1 },
  { label: 'BOTTOM_LEFT', value: 2 },
  { label: 'BOTTOM_RIGHT', value: 3 },
];

export function makeControlTestPage(
  name: string,
  Component: React.ComponentType<any>,
  defaultProps?: Record<string, unknown>,
  config: ControlTestConfig = {},
): React.FC {
  return function ControlTestPage() {
    const caps = useCapabilities();
    const [visible, setVisible] = useState(true);
    const [props, setProps] = useState(defaultProps ?? {});
    const [eventLog, setEventLog] = useState<string[]>([]);
    const supported = !config.capability || caps.has(config.capability);

    const update = (key: string, value: unknown) => setProps(p => ({ ...p, [key]: value }));
    const reset = () => {
      setProps(defaultProps ?? {});
      setVisible(true);
      setEventLog(s => [`${new Date().toLocaleTimeString()} reset all`, ...s].slice(0, 20));
    };
    const log = (msg: string) => setEventLog(s => [`${new Date().toLocaleTimeString()} ${msg}`, ...s].slice(0, 20));

    const callbackProps = useMemo(() => {
      const out: Record<string, unknown> = {};
      for (const cb of config.callbacks ?? []) {
        out[cb.prop] = (raw: unknown) => log(`${cb.label} ${raw ? JSON.stringify(raw).slice(0, 120) : ''}`);
      }
      return out;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.callbacks]);

    const controlProps = { ...props, ...callbackProps };

    const renderEditor = (ed: ControlEditor) => {
      const value = props[ed.key];
      if (ed.type === 'anchor') {
        return <select value={(value as number | undefined) ?? ''} onChange={e => update(ed.key, e.target.value === '' ? undefined : Number(e.target.value))}>
          <option value="">默认</option>
          {ANCHORS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>;
      }
      if (ed.type === 'size') {
        const size = (value as { width?: number; height?: number } | undefined) ?? {};
        return <div className="input-row">
          <input type="number" placeholder="width" value={size.width ?? ''} onChange={e => update(ed.key, { ...size, width: Number(e.target.value) })} />
          <input type="number" placeholder="height" value={size.height ?? ''} onChange={e => update(ed.key, { ...size, height: Number(e.target.value) })} />
        </div>;
      }
      if (ed.type === 'boolean') {
        return <label className="checkbox-row">
          <input type="checkbox" checked={!!value} onChange={e => update(ed.key, e.target.checked)} />
          {ed.label}
        </label>;
      }
      if (ed.type === 'number') {
        return <input type="number" className="full-width" value={(value as number | undefined) ?? ''} onChange={e => update(ed.key, e.target.value === '' ? undefined : Number(e.target.value))} />;
      }
      if (ed.type === 'select') {
        return <select value={(value as string | number | undefined) ?? ''} onChange={e => {
          const opt = ed.options?.find(o => String(o.value) === e.target.value);
          update(ed.key, e.target.value === '' ? undefined : opt?.value ?? e.target.value);
        }}>
          <option value="">默认</option>
          {ed.options?.map(opt => <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>)}
        </select>;
      }
      return <input className="full-width" value={(value as string | undefined) ?? ''} onChange={e => update(ed.key, e.target.value)} />;
    };

    return (
      <div className="test-page">
        <div className="test-map">
          <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}>
            {visible && supported && <Component {...controlProps} />}
          </Map>
        </div>
        <div className="test-controls">
          <h2>{name}</h2>
          <section>
            <h3>能力</h3>
            <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'supported' : 'unsupported'}</span>
            {config.versionNote && <p className="muted small">{config.versionNote}</p>}
          </section>
          <section>
            <h3>显示</h3>
            <label className="checkbox-row">
              <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
              显示控件（挂载 addControl / 卸载 removeControl）
            </label>
          </section>
          {config.editors?.map(ed => (
            <section key={ed.key}>
              <h3>{ed.label}</h3>
              {renderEditor(ed)}
            </section>
          ))}
          <section>
            <h3>动作</h3>
            <div className="btn-group" style={{ flexWrap: 'wrap' }}>
              <button onClick={reset}>reset all</button>
              {config.presets?.map(preset => (
                <button key={preset.label} onClick={() => { setProps(p => ({ ...p, ...preset.props })); log(preset.label); }}>{preset.label}</button>
              ))}
            </div>
          </section>
          {(config.callbacks?.length || eventLog.length > 0) && <section>
            <h3>回调日志</h3>
            {eventLog.length === 0
              ? <p className="muted small">触发控件回调后显示日志</p>
              : <pre style={{ fontSize: 11, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{eventLog.join('\n')}</pre>}
          </section>}
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

// ─── Layer 测试页 ───────────────
export function makeLayerTestPage(
  name: string,
  Component: React.ComponentType<any>,
  defaultProps?: Record<string, unknown>,
  config?: {
    capability?: string;
    versionNote?: string;
    presets?: Array<{ label: string; props: Record<string, unknown> }>;
  },
): React.FC {
  return function LayerTestPage() {
    const caps = useCapabilities();
    const [visible, setVisible] = useState(true);
    const [props, setProps] = useState<Record<string, unknown>>(defaultProps ?? {});
    const supported = !config?.capability || caps.has(config.capability);

    const reset = () => { setProps(defaultProps ?? {}); setVisible(true); };

    return (
      <div className="test-page">
        <div className="test-map">
          <Map defaultCenter={BEIJING} defaultZoom={11} style={{ height: '100%' }}>
            {visible && supported && <Component {...props} />}
          </Map>
        </div>
        <div className="test-controls">
          <h2>{name}</h2>
          <section>
            <h3>能力</h3>
            <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'supported' : 'unsupported'}</span>
            {config?.versionNote && <p className="muted small">{config.versionNote}</p>}
          </section>
          <section>
            <h3>显示</h3>
            <label className="checkbox-row">
              <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
              显示图层（挂载 addLayer / 卸载 removeLayer）
            </label>
          </section>
          {config?.presets && config.presets.length > 0 && (
            <section>
              <h3>预设</h3>
              <div className="btn-group" style={{ flexWrap: 'wrap' }}>
                <button onClick={reset}>reset all</button>
                {config.presets.map(preset => (
                  <button key={preset.label} onClick={() => setProps(p => ({ ...p, ...preset.props }))}>{preset.label}</button>
                ))}
              </div>
            </section>
          )}
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
