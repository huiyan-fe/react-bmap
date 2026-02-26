import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import * as mapvgl from 'mapvgl';

export const MapvglLayerPropsSchema = z.object({
  type: z.string().describe('MapVGL 图层类型'),
  data: z.any().optional().describe('图层数据'),
  options: z.any().optional().describe('图层配置'),
  view: z.any().optional().describe('MapvglView 实例'),
  map: z.any().optional(),
  onClick: z.any().optional().describe('点击回调'),
});

export type MapvglLayerProps = z.infer<typeof MapvglLayerPropsSchema>;

export const MapvglLayer: React.FC<MapvglLayerProps> = (props) => {
  const layerRef = useRef<any>(null);
  const createdRef = useRef(false);

  useEffect(() => {
    const { view, map, type, options, data } = props;
    if (!view || !map) return;

    const LayerClass = (mapvgl as any)[type];
    if (!LayerClass) {
      console.error(`mapvgl doesn't have layer ${type}!`);
      return;
    }

    if (!createdRef.current) {
      createdRef.current = true;
      layerRef.current = new LayerClass(options || {});
      view.addLayer(layerRef.current);
    }

    const layer = layerRef.current;
    if (props.options?.autoViewport && props.data?.length) {
      const B = (window as any).BMap || (window as any).BMapGL;
      if (B) {
        const projection = map.getMapType().getProjection();
        const getPoint = (coordinate: number[]) => {
          if (props.options.coordType === 'bd09mc') {
            return projection.pointToLngLat(new B.Pixel(coordinate[0], coordinate[1]));
          }
          return new B.Point(coordinate[0], coordinate[1]);
        };
        const points: any[] = [];
        props.data.forEach((item: any) => {
          if (item.geometry?.type === 'Point') {
            points.push(getPoint(item.geometry.coordinates));
          } else if (item.geometry?.type === 'LineString') {
            item.geometry.coordinates.forEach((c: number[]) => points.push(getPoint(c)));
          } else if (item.geometry?.type === 'Polygon' && item.geometry.coordinates?.[0]) {
            item.geometry.coordinates[0].forEach((c: number[]) => points.push(getPoint(c)));
          }
        });
        if (points.length) map.setViewport(points, props.options.viewportOptions);
      }
    }

    layer.setData?.(data || []);
    layer.setOptions?.(props.options || {});

    return () => {
      if (layerRef.current && view) {
        view.removeLayer?.(layerRef.current);
        layerRef.current.destroy?.();
        layerRef.current = null;
        createdRef.current = false;
      }
    };
  }, [
    props.view,
    props.map,
    props.type,
    JSON.stringify(props.data),
    JSON.stringify(props.options),
  ]);

  return null;
};

export default MapvglLayer;
