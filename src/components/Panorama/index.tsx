/**
 * Panorama + PanoramaLabel 组件。
 *
 * - <Panorama> 独立容器，创建 Panorama 实例，不在 <Map> 内也可使用
 * - <PanoramaLabel> 是全景标注，必须作为 <Panorama> 子组件
 * - point 变化通过 setPosition 响应式更新
 * - 支持基本事件：onPositionChange/onPovChange
 */
import { memo, useLayoutEffect, useRef, useState, useMemo, useEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { createContext, useContext } from 'react';
import type { MapHandle, Point } from '../../types';

// Panorama Context（给 PanoramaLabel 用）
const PanoramaContext = createContext<MapHandle | null>(null);

export interface PanoramaProps {
  point?: Point;
  style?: CSSProperties;
  className?: string;
  children?: React.ReactNode;
  /** 全景位置变化回调 */
  onPositionChange?: (point: Point) => void;
  /** 视角变化回调 */
  onPovChange?: () => void;
}

export const Panorama = memo(function Panorama(props: PanoramaProps) {
  const { point, style, className, children, onPositionChange, onPovChange } = props;
  const { driver, status } = useBMapContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pano, setPano] = useState<MapHandle | null>(null);
  const cbRefs = useRef({ onPositionChange, onPovChange });
  cbRefs.current = { onPositionChange, onPovChange };

  // 创建全景实例
  useLayoutEffect(() => {
    if (status !== 'ready' || !driver || !containerRef.current) return;
    const handle = driver.createPanorama(containerRef.current, {});
    if (!handle) return;
    setPano(handle);

    // 注册事件
    const raw = (handle as any).raw;
    if (raw && typeof raw.addEventListener === 'function') {
      raw.addEventListener('position_changed', (e: any) => {
        // SDK 事件 payload 格式可能不同，尝试多种路径
        const pt = e?.point || e?.latLng || e?.data?.point || e?.data?.latLng;
        if (pt && typeof pt.lng === 'number') {
          cbRefs.current.onPositionChange?.({ lng: pt.lng, lat: pt.lat });
        } else if (typeof raw.getPosition === 'function') {
          // fallback: 直接调用 getPosition
          try {
            const pos = raw.getPosition();
            if (pos && typeof pos.lng === 'number') {
              cbRefs.current.onPositionChange?.({ lng: pos.lng, lat: pos.lat });
            }
          } catch { /* ignore */ }
        }
      });
      raw.addEventListener('pov_changed', () => cbRefs.current.onPovChange?.());
    }

    return () => {
      driver.destroyPanorama(handle);
      setPano(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, status]);

  // point 变化时调用 setPosition
  useEffect(() => {
    if (!pano || !point) return;
    const raw = (pano as any).raw;
    if (!raw) return;
    const SDK = (globalThis as any).BMap;
    if (SDK?.Point) {
      try { raw.setPosition?.(new SDK.Point(point.lng, point.lat)); } catch { /* ignore */ }
    }
  }, [pano, point?.lng, point?.lat]);

  const ctxVal = useMemo(() => pano, [pano]);

  return (
    <div ref={containerRef} className={className} style={style}>
      {ctxVal && <PanoramaContext.Provider value={ctxVal}>{children}</PanoramaContext.Provider>}
    </div>
  );
});

export interface PanoramaLabelProps {
  position: Point;
  altitude?: number;
  content?: string;
  children?: React.ReactNode;
}

export const PanoramaLabel = memo(function PanoramaLabel(props: PanoramaLabelProps) {
  const { driver } = useBMapContext();
  const pano = useContext(PanoramaContext);
  const labelRef = useRef<unknown>(null);

  const labelKey = useMemo(() => JSON.stringify([props.position, props.altitude, props.content]), [props.position, props.altitude, props.content]);

  useLayoutEffect(() => {
    if (!driver || !pano) return;
    // createPanoramaLabel 内部正确拆分参数：PanoramaLabel(content, {position, altitude})
    const label = driver.createPanoramaLabel(props);
    if (!label) return;
    labelRef.current = label;
    // PanoramaLabel 通过 panorama.addOverlay 添加
    const rawPano = (pano as any).raw;
    if (rawPano && typeof rawPano.addOverlay === 'function') {
      rawPano.addOverlay((label as any).raw);
    }
    return () => {
      if (rawPano && typeof rawPano.removeOverlay === 'function') {
        rawPano.removeOverlay((label as any).raw);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, pano, labelKey]);

  return null;
});
