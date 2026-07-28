/**
 * Panorama + PanoramaLabel 组件。
 *
 * - <Panorama> 独立容器，创建 Panorama 实例，不在 <Map> 内也可使用
 * - <PanoramaLabel> 是全景标注，必须作为 <Panorama> 子组件
 */
import { memo, useLayoutEffect, useRef, useState, useMemo } from 'react';
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
}

export const Panorama = memo(function Panorama({ point, style, className, children }: PanoramaProps) {
  const { driver, status } = useBMapContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pano, setPano] = useState<MapHandle | null>(null);

  useLayoutEffect(() => {
    if (status !== 'ready' || !driver || !containerRef.current) return;
    const handle = driver.createPanorama(containerRef.current, point ? { point } : {});
    if (!handle) return;
    setPano(handle);
    return () => {
      driver.destroyPanorama(handle);
      setPano(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, status]);

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

  useLayoutEffect(() => {
    if (!driver || !pano) return;
    const label = driver.createPanoramaLabel(props);
    if (!label) return;
    labelRef.current = label;
    // PanoramaLabel 通过 panorama.addLabel 添加
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
  }, [driver, pano]);

  return null;
});
