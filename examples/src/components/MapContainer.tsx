import React from 'react';
import { Map } from 'react-bmap';
import { useMapVersion } from '../context/MapModeContext';

/**
 * 包装 Map 组件，自动注入全局选择的地图版本 (3.0/gl/4.0)
 * Map 内部会根据 BMapProvider 加载的 version 自动推断 apiType
 * key 用于 version 变化时强制 remount，触发地图重新初始化
 */
export function MapContainer(props: React.ComponentProps<typeof Map>) {
  const version = useMapVersion();
  return <Map key={version} {...props} />;
}
