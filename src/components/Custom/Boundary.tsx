import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { DataSet, baiduMapLayer } from 'mapv';

export const BoundaryPropsSchema = z.object({
  data: z.array(z.object({ name: z.string(), count: z.number().optional() })).optional().describe('行政区划数据'),
  options: z.any().optional().describe('mapv 图层配置'),
  autoViewport: z.boolean().optional(),
  viewportOptions: z.any().optional(),
  map: z.any().optional(),
});

export type BoundaryProps = z.infer<typeof BoundaryPropsSchema>;

export const Boundary: React.FC<BoundaryProps> = (props) => {
  const { map, api: B } = useBMap();
  const layerRef = useRef<any>(null);
  const dataSetRef = useRef<any>(null);
  const requestRef = useRef<Record<string, boolean>>({});
  const backDataRef = useRef<Record<string, any[]>>({});

  useEffect(() => {
    if (!map || !props.data?.length) return;

    if (!layerRef.current) {
      dataSetRef.current = new DataSet([]);
      layerRef.current = new baiduMapLayer(map, dataSetRef.current, props.options || {
        gradient: { 0: 'yellow', 1: 'red' },
        max: 100,
        globalAlpha: 0.8,
        draw: 'intensity',
      });
    }

    const bdary = new B.Boundary();
    const dataSetData: any[] = [];

    const isAllComplete = () => {
      let flag = true;
      for (const key in requestRef.current) {
        if (!requestRef.current[key]) {
          flag = false;
          break;
        }
      }
      if (flag) {
        dataSetRef.current.set(dataSetData);
        const points: any[] = [];
        dataSetData.forEach((item) => {
          (item.geometry?.coordinates?.[0] || []).forEach((c: number[]) => {
            points.push(new B.Point(c[0], c[1]));
          });
        });
        if (points.length && props.autoViewport !== false) {
          map.setViewport(points, props.viewportOptions);
        }
      }
    };

    props.data.forEach((item) => {
      requestRef.current[item.name] = false;
      if (backDataRef.current[item.name]) {
        dataSetData.push(...backDataRef.current[item.name]);
        requestRef.current[item.name] = true;
      }
    });
    isAllComplete();

    props.data.forEach((item) => {
      if (requestRef.current[item.name]) return;
      (bdary as any).get(item.name, (result: any) => {
        const boundaries = result.boundaries || [];
        const features = boundaries.map((coords: string) => {
          const coordinates = coords.split(';').map((p) => p.split(',').map(Number));
          return {
            geometry: {
              type: 'Polygon',
              coordinates: [coordinates],
            },
            count: item.count,
          };
        });
        backDataRef.current[item.name] = features;
        dataSetData.push(...features);
        requestRef.current[item.name] = true;
        isAllComplete();
      });
    });

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

export default Boundary;
