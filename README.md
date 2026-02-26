# React-BMap

[![npm version](https://img.shields.io/npm/v/react-bmap.svg)](https://www.npmjs.com/package/react-bmap)
[![2.x In Progress](https://img.shields.io/badge/In%20Progress-v2.x-yellow)](https://github.com/huiyan-fe/react-bmap)

基于百度地图 JavaScript API 封装的 React 组件库，支持 BMap (JSAPI 2.0/3.0) 与 BMapGL (WebGL)。

## 版本说明

- **v2.x** (master): React 18 + TypeScript + Hooks，兼容 BMap 与 BMapGL
- **v1.x** (分支): 旧版 React 15，仅支持 BMap 2D

## 安装

```bash
npm install react-bmap
```

需安装 React 18+：
```bash
npm install react react-dom
```

## 使用前准备

在 HTML 中引入百度地图 API（二选一）：

```html
<!-- BMap 2D/3.0 -->
<script src="//api.map.baidu.com/api?v=3.0&ak=您的密钥"></script>

<!-- BMapGL WebGL -->
<script src="//api.map.baidu.com/api?v=1.0&type=webgl&ak=您的密钥"></script>
```

密钥申请： [百度地图开放平台](http://lbsyun.baidu.com/apiconsole/key)

## Hello World

```tsx
import { Map, Marker, NavigationControl, InfoWindow } from 'react-bmap';

function App() {
  return (
    <Map center={{ lng: 116.402544, lat: 39.928216 }} zoom={11}>
      <Marker position={{ lng: 116.402544, lat: 39.928216 }} />
      <NavigationControl />
      <InfoWindow
        position={{ lng: 116.402544, lat: 39.928216 }}
        text="内容"
        title="标题"
      />
    </Map>
  );
}
```

## BMapGL 支持

使用 GL 版本时，在 Map 上设置 `apiType="gl"`：

```tsx
<Map center={{ lng: 116.404, lat: 39.915 }} zoom={11} apiType="gl">
  <Marker position={{ lng: 116.404, lat: 39.915 }} />
</Map>
```

## 示例

```bash
npm run examples
```

启动 Vite 开发服务器，访问 http://localhost:8090

## 组件列表

| 类别 | 组件 |
|------|------|
| 地图 | Map, Marker, MarkerOrderTip, InfoWindow |
| 控件 | NavigationControl, OverviewMapControl, ScaleControl, MapTypeControl, PanoramaControl, GeolocationControl |
| 图形 | Circle, Polyline, Polygon |
| 场景 | Road, Boundary, MarkerList, MapvMarkerList, TrafficLayer |
| 可视化 | MapvLayer, MapvglLayer, MapvglView |
| 服务 | DrivingRoute, WalkingRoute |
| 其他 | PointLabel, Arc, ThickRay, MapListener, Autocomplete |
| 工具 | Merge |

## 获取 BMap/BMapGL 实例

```tsx
const mapRef = useRef<any>();

<Map ref={mapRef} center={...} zoom={11}>
  ...
</Map>

// 获取地图实例
const mapInstance = mapRef.current?.map;
```

## 技术栈

- React 18
- TypeScript
- Zod（Schema 校验）
- Vite
- mapv / mapvgl（可视化）

## 许可证

[MIT](./LICENSE)
