import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { getOptions } from '../../hooks/useGetOptions';

const OPTIONS = ['anchor', 'offset'];

export const PanoramaControlPropsSchema = z.object({
  anchor: z.number().optional().describe('控件停靠位置'),
  offset: z.any().optional().describe('偏移量'),
  map: z.any().optional(),
});

export type PanoramaControlProps = z.infer<typeof PanoramaControlPropsSchema>;

export const PanoramaControl: React.FC<PanoramaControlProps> = (props) => {
  const { map, api: B } = useBMap();
  const controlRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;
    if (controlRef.current) {
      map.removeControl(controlRef.current);
      controlRef.current = null;
    }
    const control = new (B as any).PanoramaControl(getOptions(props, OPTIONS) as any);
    map.addControl(control);
    controlRef.current = control;
    return () => {
      map.removeControl(controlRef.current);
      controlRef.current = null;
    };
  }, [map, props.anchor, props.offset]);

  return null;
};

export default PanoramaControl;
