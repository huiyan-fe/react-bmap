/**
 * PlaceDetailPanel — 地点详情面板组件（独立面板模式）。
 *
 * 与 PlaceDetail overlay 不同，此组件不需要 Marker，直接渲染到容器 DOM。
 * uid 变化时自动调用 render(uid)。
 * 卸载时自动 dispose。
 *
 * @since 4.0
 */
import React, { useEffect, useRef } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { debugWarn } from '../../utils/debugWarn';
import type { PlaceDetailRenderOptions } from './PlaceDetail';

export interface PlaceDetailPanelProps {
  /** 地点 uid，变化时自动 render */
  uid?: string;
  /** 紧凑模式 */
  compact?: boolean;
  /** 渲染选项 */
  renderOptions?: PlaceDetailRenderOptions;
  /** 渲染完成回调（SDK 异步请求后触发） */
  onRender?: () => void;
  /** DOM 属性 */
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const PlaceDetailPanel = React.memo(function PlaceDetailPanel(props: PlaceDetailPanelProps) {
  const { uid, compact, renderOptions, onRender, className, style, children } = props;
  const { driver } = useBMapContext();
  const rawRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 创建/重建 PlaceDetail 实例，卸载时自动 dispose
  useEffect(() => {
    if (!driver || !containerRef.current) return;
    const opts: Record<string, unknown> = { container: containerRef.current };
    if (compact !== undefined) opts.compact = compact;
    if (renderOptions !== undefined) opts.renderOptions = renderOptions;

    const handle = driver.createPlaceDetail(opts);
    if (handle.isNull) return;
    rawRef.current = (handle as any).raw;

    // 实例创建后自动渲染当前 uid
    if (uid) {
      try { rawRef.current.render?.(uid); onRender?.(); } catch (e) { debugWarn('PlaceDetailPanel.render', e); }
    }

    return () => { rawRef.current?.dispose?.(); rawRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, compact, renderOptions]);

  // uid 变化时自动 render（实例未重建的情况）
  useEffect(() => {
    if (!rawRef.current || !uid) return;
    try { rawRef.current.render?.(uid); onRender?.(); } catch (e) { debugWarn('PlaceDetailPanel.render', e); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  return (
    <div ref={containerRef} className={className} style={style}>
      {children}
    </div>
  );
});
