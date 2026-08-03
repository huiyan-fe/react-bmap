import React from 'react';
import { Map, useCapabilities } from 'react-bmap';
import type { ControlAnchor, Size } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

export const ANCHOR_OPTIONS: Array<{ label: string; value: ControlAnchor }> = [
  { label: 'TOP_LEFT', value: 0 },
  { label: 'TOP_RIGHT', value: 1 },
  { label: 'BOTTOM_LEFT', value: 2 },
  { label: 'BOTTOM_RIGHT', value: 3 },
];

export const DEFAULT_CONTROL_OFFSET: Size = { width: 10, height: 10 };

interface ControlPageLayoutProps {
  title: string;
  capability?: string;
  versionNote?: string;
  children: React.ReactNode;
  controls: React.ReactNode;
  zoom?: number;
}

export function ControlPageLayout(props: ControlPageLayoutProps) {
  const { title, capability, versionNote, children, controls, zoom = 12 } = props;
  const caps = useCapabilities();
  const supported = !capability || caps.has(capability);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={zoom} style={{ height: '100%' }}>
          {supported && children}
        </Map>
      </div>
      <div className="test-controls">
        <h2>{title}</h2>
        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'supported' : 'unsupported'}</span>
          {versionNote && <p className="muted small">{versionNote}</p>}
        </section>
        {controls}
      </div>
    </div>
  );
}

export function VisibilityControl(props: { visible: boolean; onChange: (visible: boolean) => void }) {
  return (
    <section>
      <h3>显示</h3>
      <label className="checkbox-row">
        <input type="checkbox" checked={props.visible} onChange={e => props.onChange(e.target.checked)} />
        显示控件
      </label>
    </section>
  );
}

export function AnchorSelect(props: { value?: ControlAnchor; onChange: (value?: ControlAnchor) => void }) {
  return (
    <select value={props.value ?? ''} onChange={e => props.onChange(e.target.value === '' ? undefined : Number(e.target.value) as ControlAnchor)}>
      <option value="">默认</option>
      {ANCHOR_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  );
}

export function SizeInputs(props: { value?: Size; onChange: (value?: Size) => void }) {
  const size: Partial<Size> = props.value ?? {};
  const update = (field: keyof Size, raw: string) => {
    const next: Partial<Size> = { ...size, [field]: raw === '' ? undefined : Number(raw) };
    props.onChange(next.width == null && next.height == null ? undefined : next as Size);
  };

  return (
    <div className="input-row">
      <input type="number" placeholder="width" value={size.width ?? ''} onChange={e => update('width', e.target.value)} />
      <input type="number" placeholder="height" value={size.height ?? ''} onChange={e => update('height', e.target.value)} />
    </div>
  );
}

export function BooleanRow(props: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="checkbox-row">
      <input type="checkbox" checked={props.checked} onChange={e => props.onChange(e.target.checked)} />
      {props.label}
    </label>
  );
}

function safeJsonStringify(value: unknown, space?: number): string {
  const seen = new WeakSet<object>();
  try {
    const text = JSON.stringify(value, (_key, current) => {
      if (typeof current === 'object' && current !== null) {
        if (seen.has(current as object)) return '[Circular]';
        seen.add(current as object);
        if (typeof HTMLElement !== 'undefined' && current instanceof HTMLElement) {
          return `[HTMLElement ${current.tagName.toLowerCase()}]`;
        }
      }
      if (typeof current === 'function') return '[Function]';
      return current;
    }, space);
    return text === undefined ? String(value) : text;
  } catch {
    return String(value);
  }
}

export function PropsView(props: { value: unknown }) {
  return (
    <section>
      <h3>当前 Props</h3>
      <pre style={{ fontSize: 11, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
        {safeJsonStringify(props.value, 2)}
      </pre>
    </section>
  );
}

export function EventLog(props: { logs: string[] }) {
  return (
    <section>
      <h3>回调日志</h3>
      {props.logs.length === 0
        ? <p className="muted small">触发控件回调后显示日志</p>
        : <pre style={{ fontSize: 11, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{props.logs.join('\n')}</pre>}
    </section>
  );
}

export function formatEventValue(value: unknown, limit = 120): string {
  const text = safeJsonStringify(value);
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

export function logEvent(setLogs: React.Dispatch<React.SetStateAction<string[]>>, message: string) {
  setLogs(s => [`${new Date().toLocaleTimeString()} ${message}`, ...s].slice(0, 20));
}
