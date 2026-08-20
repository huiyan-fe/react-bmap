# React-BMap

[![npm version](https://img.shields.io/npm/v/react-bmap.svg)](https://www.npmjs.com/package/react-bmap)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

用 React 组件写百度地图。地图、标注、路线、控件都是普通的 React 组件和 Hook，跟着 state 走，无需手动操作 DOM 或记 SDK 的命令式 API。一套代码同时支持百度地图 **JSAPI 3.0（2D）** 和 **4.0（WebGL）**。

```tsx
<BMapProvider ak="您的密钥">
  <Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
    <Marker position={{ lng: 116.404, lat: 39.915 }} />
  </Map>
</BMapProvider>
```

## 安装

```bash
npm install react-bmap
```

需要 React 18+（`react` / `react-dom` 为 peer 依赖）。

在 [百度地图开放平台](https://lbsyun.baidu.com/apiconsole/key) 申请一个浏览器端 `ak` 密钥即可，**不用**在 `index.html` 里手动加 `<script>`，组件库会自动加载地图脚本。

## 上手

### 1. 顶层放一个 Provider

`BMapProvider` 负责加载地图并把密钥、版本传下去，通常放在应用最外层，只写一次。

```tsx
import { BMapProvider } from 'react-bmap';

function Root() {
  return (
    <BMapProvider ak="您的密钥" version="4.0">
      <App />
    </BMapProvider>
  );
}
```

- `version="4.0"`（默认）：WebGL 三维地图，支持旋转、俯仰、3D。
- `version="3.0"`：传统 2D 地图，更轻量。

### 2. 放一张地图

`Map` 必须有确定的宽高，容器没高度会看不到地图。

```tsx
import { Map } from 'react-bmap';

<div style={{ width: '100%', height: 500 }}>
  <Map center={{ lng: 116.404, lat: 39.915 }} zoom={12} />
</div>
```

### 3. 往地图里塞东西

覆盖物、控件都作为 `Map` 的子元素：

```tsx
import { Map, Marker, InfoWindow, NavigationControl, ScaleControl } from 'react-bmap';

<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <Marker position={{ lng: 116.404, lat: 39.915 }} />
  <InfoWindow position={{ lng: 116.404, lat: 39.915 }} content="天安门" />
  <NavigationControl />
  <ScaleControl />
</Map>
```

## 常见用法

### 点击地图 / 标注

覆盖物的点击回调会拿到经纬度：

```tsx
<Map
  center={{ lng: 116.404, lat: 39.915 }}
  zoom={12}
  onClick={(e) => console.log('点了地图', e.point)}
>
  <Marker
    position={{ lng: 116.404, lat: 39.915 }}
    onClick={(point) => console.log('点了标注', point)}
  />
</Map>
```

### 用 state 驱动标注

标注就是数据的映射，增删改直接改 state：

```tsx
function Markers() {
  const [points, setPoints] = useState([{ lng: 116.404, lat: 39.915 }]);

  return (
    <Map
      center={{ lng: 116.404, lat: 39.915 }}
      zoom={12}
      onClick={(e) => setPoints((prev) => [...prev, e.point])}
    >
      {points.map((p, i) => (
        <Marker key={i} position={p} />
      ))}
    </Map>
  );
}
```

### 画线、画圆

```tsx
<Map center={{ lng: 116.404, lat: 39.915 }} zoom={12}>
  <Polyline
    path={[
      { lng: 116.399, lat: 39.910 },
      { lng: 116.405, lat: 39.920 },
    ]}
    strokeColor="#3388ff"
    strokeWeight={4}
  />
  <Circle
    center={{ lng: 116.404, lat: 39.915 }}
    radius={800}
    fillColor="#3388ff"
    fillOpacity={0.3}
  />
</Map>
```

### 自定义标注图标

```tsx
<Marker
  position={{ lng: 116.404, lat: 39.915 }}
  icon={{ url: '/pin.png', size: { width: 32, height: 32 } }}
/>
```

### 规划路线

检索类功能都以 Hook 提供，返回强类型结果，也可让它直接画到地图上：

```tsx
import { Map, useDrivingRoute } from 'react-bmap';

function RouteDemo() {
  const { search, data } = useDrivingRoute({ location: '北京' });

  return (
    <>
      <button
        onClick={() =>
          search({ lng: 116.404, lat: 39.915 }, { lng: 116.373, lat: 39.907 })
        }
      >
        驾车路线
      </button>
      <Map center={{ lng: 116.404, lat: 39.915 }} zoom={12} />
      {data && <p>共 {data.getNumPlans()} 条方案</p>}
    </>
  );
}
```

### 地址转坐标（地理编码）

```tsx
import { useGeocoder } from 'react-bmap';

const { getPoint, getLocation, data } = useGeocoder();
getPoint('北京市海淀区上地十街10号'); // 地址转坐标，data.point 即坐标
// getLocation({ lng: 116.404, lat: 39.915 }); // 反向：坐标转地址
```

## 命令式操作地图

需要主动控制地图（飞到某点、缩放、坐标转换等）时，给 `Map` 一个 `ref`：

```tsx
import { useRef } from 'react';
import { Map, type MapRef } from 'react-bmap';

function Demo() {
  const map = useRef<MapRef>(null);

  return (
    <>
      <button onClick={() => map.current?.panTo({ lng: 116.404, lat: 39.915 })}>回到中心</button>
      <button onClick={() => map.current?.setZoom(15)}>放大</button>
      <Map ref={map} center={{ lng: 116.404, lat: 39.915 }} zoom={12} />
    </>
  );
}
```

`ref` 上提供了地图的全量方法：`panTo` / `flyTo` / `setZoom` / `setViewport` / `getBounds` / `pointToPixel` / `getScreenshot` / 街景 / 视角动画等。

## 能用哪些组件

从 `react-bmap` 顶层直接 import，每个组件都带 TypeScript 类型。

- **覆盖物**：`Marker`、`Label`、`Polyline`、`Polygon`、`Circle`、`Rectangle`、`BezierCurve`、`Prism`、`GroundOverlay`、`GroundPoint`、`PointCollection`、`InfoWindow`、`SimpleInfoWindow`、`Symbol`、`Icon`、`IconSequence`、`Hotspot`、`CustomOverlay`、`Marker3D`、`MapMask`、`PlaceDetail`、`PlaceDetailPanel`
- **控件**：`NavigationControl`、`NavigationControl3D`、`ScaleControl`、`OverviewMapControl`、`MapTypeControl`、`CopyrightControl`、`GeolocationControl`、`PanoramaControl`、`ZoomControl`、`CityListControl`、`LocationControl`、`LogoControl`
- **图层**：`TileLayer`、`NormalLayer`、`GeoJSONLayer`、`DistrictLayer`、`TrafficLayer`、`CustomLayer`、`CanvasLayer`、`RasterTileLayer`、`FeatureLayer`、`FillLayer`、`DOMLayer`、`PointIconLayer`、`PointShapeLayer`、`PanoramaCoverageLayer`、`LineLayer`、`PixelLayer`、`BaiduLayer`、`ThreeLayer`
- **右键菜单**：`ContextMenu`、`MenuItem`
- **全景**：`Panorama`、`PanoramaLabel`
- **检索 Hook**：`useDrivingRoute`、`useWalkingRoute`、`useRidingRoute`、`useTransitRoute`、`useTruckRoute`、`useLocalSearch`、`useAutocomplete`、`useBusLineSearch`、`usePlaceDetail`、`useGeocoder`、`useBoundary`、`useLocalCity`、`useConvertor`、`useGeolocation`、`usePanoramaService`

> 部分组件只在 4.0（WebGL）下可用（如 `Prism`、`MapMask`、`Marker3D`）。在不支持的版本使用时，默认会打印一条警告并跳过，不会让页面崩溃。

## 常见问题

**地图不显示？** 检查 `Map` 的容器是否有明确的宽高，`ak` 是否有效、是否配置了域名白名单。

**报错「只能加载一个版本」？** 同一个页面只能加载一个 JSAPI 版本，确保只有一个 `BMapProvider`，且 `version` 保持一致。

**要用代理、隐藏 ak？** 给 `BMapProvider` 传 `serviceHost`（代理地址，末尾带 `/`），此时不需要 `ak`。

## 本地跑示例

```bash
npm install
npm run examples
```

启动后在浏览器里可以看到每个组件的交互示例和 API 表格。

## 许可证

[MIT](./LICENSE)
