import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { getOptions } from '../../hooks/useGetOptions';

const OPTIONS = ['anchor', 'offset', 'type', 'mapTypes'];

export const MapTypeControlPropsSchema = z.object({
  anchor: z.number().optional().describe('控件停靠位置'),
  offset: z.any().optional().describe('偏移量'),
  type: z.number().optional().describe('控件类型'),
  mapTypes: z.array(z.any()).optional().describe('地图类型列表'),
  map: z.any().optional(),
});

export type MapTypeControlProps = z.infer<typeof MapTypeControlPropsSchema>;

export const MapTypeControl: React.FC<MapTypeControlProps> = (props) => {
  const { map, api: B } = useBMap();
  const controlRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;
    if (controlRef.current) {
      map.removeControl(controlRef.current);
      controlRef.current = null;
    }
    const control = new B.MapTypeControl(getOptions(props, OPTIONS) as any);
    map.addControl(control);
    controlRef.current = control;
    return () => {
      map.removeControl(controlRef.current);
      controlRef.current = null;
    };
  }, [map, props.anchor, props.offset, props.type, props.mapTypes]);

  return null;
};

export default MapTypeControl;
