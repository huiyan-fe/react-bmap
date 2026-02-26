import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { getOptions } from '../../hooks/useGetOptions';

const OPTIONS = ['anchor', 'offset', 'type', 'showZoomInfo', 'enableGeolocation'];

export const NavigationControlPropsSchema = z.object({
  anchor: z.number().optional().describe('控件停靠位置'),
  offset: z.any().optional().describe('偏移量'),
  type: z.number().optional().describe('控件类型'),
  showZoomInfo: z.boolean().optional().describe('是否显示 zoom 信息'),
  enableGeolocation: z.boolean().optional().describe('是否启用定位'),
  map: z.any().optional(),
});

export type NavigationControlProps = z.infer<typeof NavigationControlPropsSchema>;

export const NavigationControl: React.FC<NavigationControlProps> = (props) => {
  const { map, api: B } = useBMap();
  const controlRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;
    if (controlRef.current) {
      map.removeControl(controlRef.current);
      controlRef.current = null;
    }
    const control = new B.NavigationControl(getOptions(props, OPTIONS) as any);
    map.addControl(control);
    controlRef.current = control;
    return () => {
      map.removeControl(controlRef.current);
      controlRef.current = null;
    };
  }, [map, props.anchor, props.offset, props.type]);

  return null;
};

export default NavigationControl;
