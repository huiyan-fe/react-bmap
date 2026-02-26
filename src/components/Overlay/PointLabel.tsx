import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { createDraggingTipOverlay } from './createDraggingTipOverlay';
import { PointLikeSchema } from '../../schemas';

export const PointLabelDataItemSchema = z.object({
  point: PointLikeSchema,
  name: z.string().optional(),
  index: z.number().optional(),
  color: z.string().optional(),
  numberDirection: z.enum(['left', 'right']).optional(),
  isShowNumber: z.boolean().optional(),
  tipStyle: z.record(z.string(), z.any()).optional(),
  textStyle: z.record(z.string(), z.any()).optional(),
  numberStyle: z.record(z.string(), z.any()).optional(),
  draggable: z.boolean().optional(),
});

export type PointLabelDataItem = z.infer<typeof PointLabelDataItemSchema>;

export const PointLabelPropsSchema = z.object({
  data: z.array(PointLabelDataItemSchema).optional().describe('标注数据数组'),
  changePosition: z.any().optional().describe('位置变化回调'),
  autoViewport: z.boolean().optional(),
  viewportOptions: z.any().optional(),
  map: z.any().optional(),
});

export type PointLabelProps = z.infer<typeof PointLabelPropsSchema>;

export const PointLabel: React.FC<PointLabelProps> = (props) => {
  const { map, api: B } = useBMap();
  const tipsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!map) return;

    tipsRef.current.forEach((tip) => tip.hide());
    tipsRef.current = [];

    if (props.data?.length) {
      const DraggingTip = createDraggingTipOverlay(B);
      const points: any[] = [];

      props.data.forEach((item, index) => {
        const point =
          typeof item.point.lng === 'number'
            ? new B.Point(item.point.lng, item.point.lat)
            : item.point;

        const tip = new (DraggingTip as any)({
          isShowTipArrow: true,
          changePosition: (pt: any) => {
            props.changePosition?.(pt, index);
          },
          map,
          numberDirection: item.numberDirection,
          isShowNumber: item.isShowNumber,
          point,
          name: item.name,
          index: item.index !== undefined ? item.index : index + 1,
          color: item.color,
          tipStyle: item.tipStyle,
          textStyle: item.textStyle,
          numberStyle: item.numberStyle,
          draggable: item.draggable,
        });
        points.push(item.point);
        tip.show();
        tipsRef.current.push(tip);
      });

      if (props.autoViewport && points.length > 0) {
        const viewportPoints = points.map(
          (p) => new B.Point(p.lng, p.lat)
        );
        map.setViewport?.(viewportPoints, props.viewportOptions);
      }
    }

    return () => {
      tipsRef.current.forEach((tip) => tip.hide());
      tipsRef.current = [];
    };
  }, [map, JSON.stringify(props.data), props.autoViewport]);

  return null;
};

export default PointLabel;
