import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { getOptions } from '../../hooks/useGetOptions';

const OPTIONS = ['anchor', 'offset', 'showAddressBar', 'enableAutoLocation', 'locationIcon'];

export const GeolocationControlPropsSchema = z.object({
  anchor: z.number().optional().describe('控件停靠位置'),
  offset: z.any().optional().describe('偏移量'),
  showAddressBar: z.boolean().optional().describe('是否显示地址栏'),
  enableAutoLocation: z.boolean().optional().describe('是否启用自动定位'),
  locationIcon: z.any().optional().describe('定位图标'),
  map: z.any().optional(),
});

export type GeolocationControlProps = z.infer<typeof GeolocationControlPropsSchema>;

export const GeolocationControl: React.FC<GeolocationControlProps> = (props) => {
  const { map, api: B } = useBMap();
  const controlRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;
    if (controlRef.current) {
      map.removeControl(controlRef.current);
      controlRef.current = null;
    }
    const control = new B.GeolocationControl(getOptions(props, OPTIONS) as any);
    map.addControl(control);
    controlRef.current = control;
    return () => {
      map.removeControl(controlRef.current);
      controlRef.current = null;
    };
  }, [map, props.anchor, props.offset]);

  return null;
};

export default GeolocationControl;
