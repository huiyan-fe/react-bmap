import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { DataSet, baiduMapLayer, baiduMapAnimationLayer } from 'mapv';

export const MapvMarkerListPropsSchema = z.object({
  data: z.array(z.any()).optional().describe('GeoJSON 数据'),
  options: z.any().optional().describe('mapv 图层配置'),
  animation: z.boolean().optional().describe('是否开启动画'),
  map: z.any().optional(),
});

export type MapvMarkerListProps = z.infer<typeof MapvMarkerListPropsSchema>;

export const MapvMarkerList: React.FC<MapvMarkerListProps> = (props) => {
  const { map, api: B } = useBMap();
  const layerRef = useRef<any>(null);
  const dataSetRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !props.data?.length) return;

    if (!dataSetRef.current) {
      dataSetRef.current = new DataSet([]);
      const opts = props.options || {};
      layerRef.current = props.animation
        ? new baiduMapAnimationLayer(map, dataSetRef.current, opts)
        : new baiduMapLayer(map, dataSetRef.current, opts);
    }

    dataSetRef.current.set(props.data);

    return () => {
      if (layerRef.current) {
        layerRef.current.destroy();
        layerRef.current = null;
        dataSetRef.current = null;
      }
    };
  }, [map, JSON.stringify(props.data)]);

  return null;
};

export default MapvMarkerList;
