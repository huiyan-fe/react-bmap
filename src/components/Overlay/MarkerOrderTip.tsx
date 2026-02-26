import React from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { objectMerge } from '../../utils/common';
import { Marker } from './Marker';
import { PointLikeSchema } from '../../schemas';

export const MarkerOrderTipPropsSchema = z.looseObject({
    position: z
      .union([PointLikeSchema, z.tuple([z.number(), z.number()])])
      .describe('位置'),
    num: z.union([z.string(), z.number()]).optional(),
    rate: z.string().optional(),
    name: z.string().optional(),
    order: z.union([z.string(), z.number()]).optional(),
    visible: z.boolean().optional(),
    active: z.boolean().optional(),
    rightModule: z.any().optional(),
    leftStyle: z.record(z.string(), z.any()).optional(),
    rightStyle: z.record(z.string(), z.any()).optional(),
    style: z.record(z.string(), z.any()).optional(),
    zIndex: z.number().optional(),
    map: z.any().optional(),
    autoViewport: z.boolean().optional(),
});

export type MarkerOrderTipProps = z.infer<typeof MarkerOrderTipPropsSchema> & {
  rightModule?: React.ReactNode;
  [key: string]: any;
};

const defaultOverlayStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  background: '#FFFFFF',
  alignItems: 'stretch',
  boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.22)',
  borderRadius: '3px 0 0 3px',
  minWidth: '155px',
  minHeight: '50px',
  marginTop: '-25px',
};

const defaultOrderStyle: React.CSSProperties = {
  minWidth: '30px',
  background: '#999999',
  color: 'white',
  padding: 'auto 0',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const defaultRightStyle: React.CSSProperties = {
  flex: '1',
  padding: '6px',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '12px',
  color: '#8D93A3',
  letterSpacing: '0.6px',
};

const UP_IMG = '//huiyan.baidu.com/cms/react-bmap/up.png';
const DOWN_IMG = '//huiyan.baidu.com/cms/react-bmap/down.png';

export const MarkerOrderTip: React.FC<MarkerOrderTipProps> = (props) => {
  const { map, api: B } = useBMap();
  const visible = props.visible !== false;

  if (!visible) return null;

  let up = true;
  let rate = props.rate;
  if (rate) {
    if (rate.indexOf('-') > -1) {
      up = false;
      rate = rate.replace('-', '');
    }
    if (rate.indexOf('+') > -1) {
      up = true;
      rate = rate.replace('+', '');
    }
    if (!rate.length) rate = '_';
  }

  const orderStyle = objectMerge(
    { ...defaultOrderStyle },
    props.active ? { background: '#F5533D' } : {},
    props.leftStyle || {}
  );

  const overlayStyle = objectMerge(
    { ...defaultOverlayStyle },
    props.style || {}
  );

  const rightStyle = objectMerge(
    { ...defaultRightStyle },
    props.rightStyle || {}
  );

  const position = Array.isArray(props.position)
    ? { lng: props.position[0], lat: props.position[1] }
    : props.position;

  return React.createElement(
    Marker,
    {
      key: `${position.lng}-${position.lat}-${Math.random()}`,
      map,
      position,
      zIndex: props.zIndex,
    },
    React.createElement(
      'div',
      { style: overlayStyle },
      React.createElement('div', { style: orderStyle }, props.order),
      React.createElement(
        'div',
        { style: rightStyle },
        !props.rightModule && (
          <>
            {'  '}
            {props.num}
            {'('}
            {rate}
            {up ? (
              <img
                style={{ width: '8px', height: 'auto', margin: '1px' }}
                src={UP_IMG}
                alt=""
              />
            ) : (
              <img
                style={{ width: '8px', height: 'auto', margin: '1px' }}
                src={DOWN_IMG}
                alt=""
              />
            )}
            {')'}
          </>
        ),
        props.rightModule || (
          <>
            {'  '}
            {props.name}{' '}
          </>
        )
      )
    )
  );
};

export default MarkerOrderTip;
