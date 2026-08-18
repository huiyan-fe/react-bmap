/**
 * 图层测试页公共件 — 页面骨架、NormalLayer 系公共参数控件、SDK 类存在性探测。
 */
import React, { useState } from 'react';
import { Map, useCapabilities, useDriver } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

export { PropsView } from '../control/shared';

export interface LayerBaseOptions {
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
}

export const DEFAULT_BASE_OPTIONS: LayerBaseOptions = { visible: true };

export type SdkClassPresence = 'present' | 'missing' | 'unknown';

/**
 * 能力矩阵（src/drivers/capabilityMatrix.ts）是按版本硬编码的，而 createLayerFactory
 * 在构造失败时会静默返回 null。所以再探一次 SDK 上的构造函数是否真的存在。
 */
export function useSdkClassPresence(className: string): SdkClassPresence {
  const driver = useDriver();
  if (!driver) return 'unknown';
  const raw = driver.rawSDK as Record<string, unknown> | null | undefined;
  if (!raw) return 'unknown';
  return typeof raw[className] === 'function' ? 'present' : 'missing';
}

const PRESENCE_TEXT: Record<SdkClassPresence, string> = {
  present: 'SDK 类存在',
  missing: 'SDK 类缺失',
  unknown: 'SDK 未就绪',
};

interface LayerPageLayoutProps {
  title: string;
  /** 能力矩阵里的能力名，通常与 SDK 构造函数同名 */
  capability: string;
  versionNote?: string;
  zoom?: number;
  /** 图层节点，仅在能力支持且已挂载时渲染 */
  children: React.ReactNode;
  controls?: React.ReactNode;
  code?: string;
}

export function LayerPageLayout(props: LayerPageLayoutProps) {
  const { title, capability, versionNote, zoom = 11, children, controls, code } = props;
  const caps = useCapabilities();
  const supported = caps.has(capability);
  const presence = useSdkClassPresence(capability);
  const [mounted, setMounted] = useState(true);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={zoom} style={{ height: '100%' }}>
          {supported && mounted && children}
        </Map>
      </div>
      <div className="test-controls">
        <h2>{title}</h2>
        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span>
          <span className={`cap-tag ${presence === 'present' ? 'ok' : 'no'}`}>{PRESENCE_TEXT[presence]}</span>
          {versionNote && <p className="muted small">{versionNote}</p>}
          <p className="muted small">
            左边是能力矩阵（按版本硬编码）的结论，右边是运行时在 SDK 上探测 <code>{capability}</code> 构造函数的结果。
            两者不一致说明能力矩阵与实际 SDK 有偏差，此时图层会被静默跳过。
          </p>
        </section>
        <section>
          <h3>挂载</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={mounted} onChange={e => setMounted(e.target.checked)} />
            挂载图层（勾掉验证 removeLayer 是否干净卸载）
          </label>
        </section>
        {controls}
        {code && (
          <section>
            <h3>代码示例</h3>
            <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>{code}</pre>
          </section>
        )}
      </div>
    </div>
  );
}

function NumberField(props: { label: string; value?: number; onChange: (value?: number) => void }) {
  return (
    <label className="checkbox-row" style={{ justifyContent: 'space-between' }}>
      {props.label}
      <input
        type="number"
        style={{ width: 80 }}
        value={props.value ?? ''}
        onChange={e => props.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
      />
    </label>
  );
}

/**
 * NormalLayer 系（LineLayer / PixelLayer / BaiduLayer / ThreeLayer）共有参数。
 * 图层没有 setter 抽象，改这些值会走 layerKey 触发重建 —— 页面刻意不加 key，用来验证这一点。
 */
export function LayerBaseOptionControls(props: { value: LayerBaseOptions; onChange: (value: LayerBaseOptions) => void }) {
  const { value, onChange } = props;
  const patch = (next: Partial<LayerBaseOptions>) => onChange({ ...value, ...next });

  return (
    <section>
      <h3>公共参数</h3>
      <label className="checkbox-row">
        <input type="checkbox" checked={value.visible !== false} onChange={e => patch({ visible: e.target.checked })} />
        visible
      </label>
      <label className="checkbox-row" style={{ justifyContent: 'space-between' }}>
        opacity: {value.opacity ?? '默认'}
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={value.opacity ?? 1}
          onChange={e => patch({ opacity: Number(e.target.value) })}
        />
      </label>
      <NumberField label="minZoom" value={value.minZoom} onChange={v => patch({ minZoom: v })} />
      <NumberField label="maxZoom" value={value.maxZoom} onChange={v => patch({ maxZoom: v })} />
      <NumberField label="zIndex" value={value.zIndex} onChange={v => patch({ zIndex: v })} />
      <button className="reset-btn" onClick={() => onChange({ ...DEFAULT_BASE_OPTIONS })}>重置公共参数</button>
      <p className="muted small">图层无 setter，改动通过 layerKey 触发重建；页面未使用手写 key。</p>
    </section>
  );
}
