/**
 * 可视化图层通用工厂 —— 对齐 vue-bmap 1.0.6 的实现语义：
 * - 构造期选项（含 visible/opacity/zIndex 等）变化 → 重建图层
 * - data 变化 → raw.setData()（不重建）
 * - 事件通过 driver.addEventListener(handle, sdkEvent, handler) 绑定
 *
 * 各图层的 optionKeys 决定哪些 props 进构造函数；data 单独走 setData。
 */
import { useEffect, useLayoutEffect, useRef } from 'react';
import type { ComponentType } from 'react';
import { useMapContext } from '../../context/MapContext';
import { useLatest } from '../../utils/useLatest';
import { stableStringify } from '../../utils/stableStringify';
import { debugWarn } from '../../utils/debugWarn';
import type { BMapDriver } from '../../drivers/types';
import type { LayerHandle } from '../../types';

export interface VisualLayerBaseProps {
  /** GeoJSON 数据源；变化时调用 raw.setData() */
  data?: object;
  /** setData 第二参（部分图层支持，如 { changeCenter: true }） */
  setDataParams?: object;
}

export interface CreateVisualLayerConfig {
  displayName: string;
  factory: (driver: BMapDriver, opts: Record<string, unknown>) => LayerHandle | null;
  /** 进入构造函数选项的 prop 名 */
  optionKeys: string[];
  /** SDK 事件名 → 组件 prop 名 */
  events?: Array<{ sdk: string; prop: string }>;
}

export function createVisualLayer<P extends VisualLayerBaseProps>(cfg: CreateVisualLayerConfig): ComponentType<P> {
  const Comp = function VisualLayer(props: P): null {
    const { map, driver } = useMapContext();
    const handleRef = useRef<LayerHandle | null>(null);
    const handlersRef = useLatest(props);
    const appliedDataKeyRef = useRef<string | null>(null);

    const ctorKey = stableStringify(cfg.optionKeys.map((k) => (props as Record<string, unknown>)[k]));
    const dataKey = props.data !== undefined ? stableStringify(props.data) : '';

    useLayoutEffect(() => {
      if (!map || !driver) return;
      const opts: Record<string, unknown> = {};
      for (const k of cfg.optionKeys) {
        const v = (props as Record<string, unknown>)[k];
        if (v !== undefined) opts[k] = v;
      }
      const h = cfg.factory(driver, opts);
      if (!h) return;
      handleRef.current = h;
      driver.addLayer(map, h);

      const unsubs: Array<() => void> = [];
      for (const { sdk, prop } of cfg.events ?? []) {
        try {
          unsubs.push(driver.addEventListener(h, sdk, (e: unknown) => {
            const fn = (handlersRef.current as Record<string, unknown>)[prop];
            if (typeof fn === 'function') (fn as (e: unknown) => void)(e);
          }));
        } catch { /* 事件不支持时忽略 */ }
      }

      if (props.data !== undefined) {
        try { (h.raw as any)?.setData?.(props.data, props.setDataParams); }
        catch (e) { debugWarn(`${cfg.displayName}.setData`, e); }
      }
      appliedDataKeyRef.current = dataKey;

      return () => {
        unsubs.forEach((u) => { try { u(); } catch { /* ignore */ } });
        try { driver.removeLayer(map, h); } catch { /* ignore */ }
        handleRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, driver, ctorKey]);

    // data 变化 → setData（首帧已由创建 effect 应用，避免重复）
    useEffect(() => {
      if (!handleRef.current || props.data === undefined) return;
      if (appliedDataKeyRef.current === dataKey) return;
      try { (handleRef.current.raw as any)?.setData?.(props.data, props.setDataParams); }
      catch { /* noop */ }
      appliedDataKeyRef.current = dataKey;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataKey]);

    return null;
  };
  Comp.displayName = cfg.displayName;
  return Comp;
}
