import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { getOptions } from '../../hooks/useGetOptions';

const OPTIONS = ['anchor', 'offset', 'size', 'isOpen'];

export const OverviewMapControlPropsSchema = z.object({
  anchor: z.number().optional().describe('控件停靠位置'),
  offset: z.any().optional().describe('偏移量'),
  size: z.any().optional().describe('缩略图尺寸'),
  isOpen: z.boolean().optional().describe('是否默认展开'),
  map: z.any().optional(),
});

export type OverviewMapControlProps = z.infer<typeof OverviewMapControlPropsSchema>;

export const OverviewMapControl: React.FC<OverviewMapControlProps> = (props) => {
  const { map, api: B } = useBMap();
  const controlRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;
    if (controlRef.current) {
      map.removeControl(controlRef.current);
      controlRef.current = null;
    }
    const control = new B.OverviewMapControl(getOptions(props, OPTIONS) as any);
    map.addControl(control);
    controlRef.current = control;
    return () => {
      map.removeControl(controlRef.current);
      controlRef.current = null;
    };
  }, [map, props.anchor, props.offset, props.size, props.isOpen]);

  return null;
};

export default OverviewMapControl;
