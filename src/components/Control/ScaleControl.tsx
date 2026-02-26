import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { getOptions } from '../../hooks/useGetOptions';

const OPTIONS = ['anchor', 'offset'];

export const ScaleControlPropsSchema = z.object({
  anchor: z.number().optional().describe('控件停靠位置'),
  offset: z.any().optional().describe('偏移量'),
  map: z.any().optional(),
});

export type ScaleControlProps = z.infer<typeof ScaleControlPropsSchema>;

export const ScaleControl: React.FC<ScaleControlProps> = (props) => {
  const { map, api: B } = useBMap();
  const controlRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;
    if (controlRef.current) {
      map.removeControl(controlRef.current);
      controlRef.current = null;
    }
    const control = new B.ScaleControl(getOptions(props, OPTIONS) as any);
    map.addControl(control);
    controlRef.current = control;
    return () => {
      map.removeControl(controlRef.current);
      controlRef.current = null;
    };
  }, [map, props.anchor, props.offset]);

  return null;
};

export default ScaleControl;
