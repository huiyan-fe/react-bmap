import React from 'react';
import { Map } from 'react-bmap';
import { useMapMode } from '../context/MapModeContext';

/**
 * 包装 Map 组件，自动注入全局选择的地图模式 (2d/gl)
 * key 用于 apiType 变化时强制 remount，触发地图重新初始化
 */
export function MapContainer(props: React.ComponentProps<typeof Map>) {
  const apiType = useMapMode();
  return <Map key={apiType} apiType={apiType} {...props} />;
}
