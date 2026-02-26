import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { DataSet, baiduMapLayer, baiduMapAnimationLayer } from 'mapv';

export const MarkerListPropsSchema = z.object({
  data: z.array(z.looseObject({ text: z.string().optional(), location: z.string() })).optional().describe('标注数据'),
  fillStyle: z.string().optional(),
  animation: z.boolean().optional().describe('是否开启动画'),
  isShowShadow: z.boolean().optional(),
  isShowText: z.boolean().optional(),
  multiple: z.boolean().optional(),
  mini: z.boolean().optional(),
  autoViewport: z.boolean().optional(),
  coordType: z.string().optional(),
  textOptions: z.any().optional(),
  splitList: z.record(z.string(), z.string()).optional(),
  showIndex: z.number().optional(),
  map: z.any().optional(),
});

export type MarkerListProps = z.infer<typeof MarkerListPropsSchema>;

export const MarkerList: React.FC<MarkerListProps> = (props) => {
  const { map, api: B } = useBMap();
  const textLayerRef = useRef<any>(null);
  const animationLayerRef = useRef<any>(null);
  const dataSetRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !props.data?.length) return;

    if (!dataSetRef.current) {
      dataSetRef.current = new DataSet([]);
      const textOptions = props.textOptions || {
        fillStyle: '#666666',
        shadowBlur: 5,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        globalAlpha: 0.9,
        textAlign: 'left',
        offset: { x: props.mini ? 10 : 15, y: 0 },
        coordType: props.coordType,
        avoid: true,
        size: 12,
        textKey: 'text',
        draw: 'text',
      };
      if (props.isShowText !== false) {
        textLayerRef.current = new baiduMapLayer(map, dataSetRef.current, textOptions);
      }
      if (props.animation) {
        const splitList = props.splitList || {};
        splitList.other = props.fillStyle || 'rgba(50, 50, 255, 0.5)';
        animationLayerRef.current = new baiduMapAnimationLayer(map, dataSetRef.current, {
          styleType: 'stroke',
          strokeStyle: props.fillStyle || 'rgba(20, 249, 255, 0.5)',
          coordType: props.coordType,
          splitList,
          globalAlpha: 0.4,
          size: (props.multiple || props.mini) ? 20 : 26,
          minSize: (props.multiple || props.mini) ? 10 : 13,
          draw: 'category',
        });
      }
    }

    const projection = map.getMapType().getProjection();
    const mapvData: any[] = [];

    props.data.forEach((item, i) => {
      if (props.showIndex !== undefined && props.showIndex !== i) return;
      const location = item.location?.split(',') || [];
      let point: any;
      if (props.coordType === 'bd09mc') {
        point = projection.pointToLngLat(new B.Pixel(parseFloat(location[0]), parseFloat(location[1])));
      } else {
        point = new B.Point(parseFloat(location[0]), parseFloat(location[1]));
      }
      mapvData.push({
        geometry: { type: 'Point', coordinates: [point.lng, point.lat] },
        text: item.text || '',
        ...item,
      });
    });

    dataSetRef.current.set(mapvData);

    if (props.autoViewport && mapvData.length) {
      const points = mapvData.map((d) => new B.Point(d.geometry.coordinates[0], d.geometry.coordinates[1]));
      map.setViewport(points);
    }

    return () => {
      if (textLayerRef.current) {
        textLayerRef.current.destroy();
        textLayerRef.current = null;
      }
      if (animationLayerRef.current) {
        animationLayerRef.current.destroy();
        animationLayerRef.current = null;
      }
      dataSetRef.current = null;
    };
  }, [map, JSON.stringify(props.data)]);

  return null;
};

export default MarkerList;
