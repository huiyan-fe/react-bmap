import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { DataSet, baiduMapLayer } from 'mapv';

export const MapvLayerPropsSchema = z.object({
  data: z.array(z.any()).optional().describe('GeoJSON 数据数组'),
  options: z.any().optional().describe('mapv 图层配置'),
  onClick: z.any().optional().describe('点击回调'),
  map: z.any().optional(),
});

export type MapvLayerProps = z.infer<typeof MapvLayerPropsSchema>;

export const MapvLayer: React.FC<MapvLayerProps> = (props) => {
  const { map, api: B } = useBMap();
  const layerRef = useRef<any>(null);
  const dataSetRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    if (!dataSetRef.current) {
      dataSetRef.current = new DataSet([]);
      layerRef.current = new baiduMapLayer(map, dataSetRef.current, {
        enableMassClear: false,
      });
    }

    const layer = layerRef.current;
    const dataSet = dataSetRef.current;

    if (props.options?.autoViewport && props.data?.length) {
      const projection = map.getMapType().getProjection();
      const getPoint = (coordinate: number[]) => {
        if (props.options.coordType === 'bd09mc') {
          return projection.pointToLngLat(
            new B.Pixel(coordinate[0], coordinate[1])
          );
        }
        return new B.Point(coordinate[0], coordinate[1]);
      };
      const points: any[] = [];
      props.data.forEach((item: any) => {
        if (item.geometry?.type === 'Point') {
          points.push(getPoint(item.geometry.coordinates));
        } else if (item.geometry?.type === 'Polygon' && item.geometry.coordinates?.[0]) {
          item.geometry.coordinates[0].forEach((c: number[]) => points.push(getPoint(c)));
        }
      });
      if (points.length) map.setViewport(points, props.options.viewportOptions);
    }

    dataSet.set(props.data || []);
    layer.update?.({ options: props.options || {} });

    return () => {
      if (layerRef.current) {
        layerRef.current.destroy();
        layerRef.current = null;
        dataSetRef.current = null;
      }
    };
  }, [map, JSON.stringify(props.data), JSON.stringify(props.options)]);

  return null;
};

export default MapvLayer;
