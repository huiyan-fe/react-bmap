import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { View, BloomEffect, BrightEffect, BlurEffect } from 'mapvgl';

export const MapvglViewPropsSchema = z.object({
  effects: z.array(z.enum(['bloom', 'bright', 'blur'])).optional().describe('特效列表'),
  map: z.any().optional(),
});

export type MapvglViewProps = z.infer<typeof MapvglViewPropsSchema> & {
  children?: React.ReactNode;
};

export const MapvglView: React.FC<MapvglViewProps> = (props) => {
  const { map } = useBMap();
  const [view, setView] = useState<any>(null);

  useEffect(() => {
    if (!map) return;

    const effects: any[] = [];
    (props.effects || []).forEach((name) => {
      if (name === 'bloom') effects.push(new BloomEffect());
      else if (name === 'bright') effects.push(new BrightEffect());
      else if (name === 'blur') effects.push(new BlurEffect());
    });
    const v = new View({ mapType: 'bmap', effects, map });
    setView(v);

    return () => {
      v.destroy();
      setView(null);
    };
  }, [map]);

  const childrenWithProps = view
    ? React.Children.map(props.children, (child) => {
        if (!child || typeof (child as any)?.type === 'string') return child;
        return React.cloneElement(child as React.ReactElement<any>, {
          map,
          view,
        });
      })
    : null;

  return <div title="mapvgl view">{childrenWithProps}</div>;
};

export default MapvglView;
