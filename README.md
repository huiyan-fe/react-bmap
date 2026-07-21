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

无需在 HTML 中手动引入百度地图 script。通过 `BMapProvider` 在应用顶层提供 `ak` / `version` / `serviceHost`，框架内部会使用 `@baidumap/jsapi-loader` 自动加载 JSAPI。

```tsx
import { BMapProvider } from 'react-bmap';

function App() {
  return (
    <BMapProvider ak="您的密钥" version="gl">
      <YourApp />
    </BMapProvider>
  );
}
```

### BMapProvider Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `ak` | `string` | - | 开发者密钥，非代理模式必填 |
| `version` | `'3.0' \| 'gl' \| '4.0'` | `'4.0'` | JSAPI 版本。`'3.0'`/`'4.0'` → BMap 2D；`'gl'` → BMapGL WebGL |
| `serviceHost` | `string` | - | 代理模式服务地址（末尾需带 `/`），设置后启用代理且 URL 不携带 ak |
| `protocol` | `'https' \| 'http'` | `'https'` | 协议 |
| `timeout` | `number` | `0` | 加载超时（毫秒），0 表示不超时 |
| `globalConfig` | `{ apiVersion?, uiVersion?, coordType? }` | - | 创建地图前需全局声明的配置 |
| `fallback` | `ReactNode` | - | 加载中展示内容 |
| `errorFallback` | `ReactNode` | - | 加载失败展示内容 |

> 注意：`@baidumap/jsapi-loader` 同一页面仅支持加载一个 version。`version` 变化时会自动 `reset` 并重新加载。

### 代理模式

使用代理模式时，通过 `serviceHost` 指定代理服务地址，无需 `ak`：

```tsx
<BMapProvider serviceHost="https://your-proxy.example.com/" version="gl">
  <YourApp />
</BMapProvider>
```

### 向后兼容

若未使用 `BMapProvider` 包裹，`<Map>` 会回退到从 `window.BMap` / `window.BMapGL` 读取（即旧的 `<script>` 引入方式仍可用），但推荐使用 `BMapProvider`。

密钥申请： [百度地图开放平台](http://lbsyun.baidu.com/apiconsole/key)

## Hello World

```tsx
import { BMapProvider, Map, Marker, NavigationControl, InfoWindow } from 'react-bmap';

function App() {
  return (
    <BMapProvider ak="您的密钥" version="gl">
      <Map center={{ lng: 116.402544, lat: 39.928216 }} zoom={11}>
        <Marker position={{ lng: 116.402544, lat: 39.928216 }} />
        <NavigationControl />
        <InfoWindow
          position={{ lng: 116.402544, lat: 39.928216 }}
          text="内容"
          title="标题"
        />
      </Map>
    </BMapProvider>
  );
}
```

## BMapGL 支持

`version="gl"` 时加载 BMapGL，`<Map>` 会自动推断 `apiType`。也可显式指定：

```tsx
<BMapProvider ak="您的密钥" version="gl">
  <Map center={{ lng: 116.404, lat: 39.915 }} zoom={11} apiType="gl">
    <Marker position={{ lng: 116.404, lat: 39.915 }} />
  </Map>
</BMapProvider>
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
