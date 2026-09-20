/**
 * examples 首页「更新日志」数据。
 * 版本内容取自 git tag 历史（v2.0.1 / v2.0.2）与 v2.0.2 之后累积的待发布改动。
 * 发版时把顶部「未发布」改成正式版本号 + 日期即可。
 */
export interface ChangelogEntry {
  version: string;
  date?: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.0.4',
    date: '2026-09-20',
    changes: [
      'useLocalSearch：补齐 select / clearSelected / setLocation / enableAutoViewport / disableAutoViewport / enableFirstResultSelection / disableFirstResultSelection / setPageCapacity / getStatus 方法 + onPolylinesSet 回调',
      '路线 hook（Driving/Walking/Riding/Transit/Truck）：补 setPolylineStyle（运行时改路线折线样式）',
      'useBusLineSearch：补 enableAutoViewport / disableAutoViewport / setLocation / getStatus（clearResults 说明：SDK 无原生 clear，仅清 data 状态）',
      'useAutocomplete：补 setInputValue / setTypes / setLocation / getStatus',
      'useGeocoder：补 setOptions；useBoundary：补 parsebdStr',
      'MapMask：新增 points（任意多边形遮罩路径），bounds 改为可选（与 points 二选一，同时传以 points 为准）',
      'fix：路线 hook 首次 search 首帧不渲染的竞态（自动渲染模式下复用服务实例首搜不出线，现在首搜完成后同参补搜一次兜底，确保首帧出线；autoRender:false 不受影响）',
      '文档：use-driver 页补充「何时直接调 driver.createXxx」说明（仅当 handle 是组件给不了又必须传入的入参时才需要，如 Polyline icons）',
    ],
  },
  {
    version: '2.0.3',
    date: '2026-09-18',
    changes: [
      '全部渲染型 service hook 支持 autoRender: false（仅取数据、不自动渲染默认标注/路线）',
      'useConvertor：translate 内部按 100 点自动分批、并发请求再按序合并，支持 >100 点',
      'useGeocoder：新增 getPoints / getLocations 并发批量方法（Promise、保序、失败位 null）',
      'Map：新增 customArea prop（个性化生效区域，4.0+）',
      'Marker：支持 Label 作为子元素（随 marker 定位/拖拽跟随）',
      'Polygon：path 支持多坐标串 Point[][]（镂空 / 多环，对齐 JSAPI）',
      'InfoWindow：补 enableSearchTool（信息窗内搜索工具，4.0/GL）',
      '可编辑覆盖物支持 node / nodeT 编辑点图标（对齐 JSAPI）',
      'fix：Panorama albumsControl:false 隐藏失效；useTruckRoute 透传 waypoints；Map mapType 首帧闪烁',
    ],
  },
  {
    version: '2.0.2',
    changes: [
      'Panorama：补齐命令式句柄、控件开关、常量与全套事件',
      'service：回调型 hook 增加超时兜底；renderOptions.map 在 <Map> 内自动获取，新增 useMapReady',
      'Layer：Line / Fill / PointIcon 补齐事件、受控更新与数据驱动样式表达式',
      '新增 RawOverlay / RawControl（及同名 hook），挂载任意原生 Overlay / Control 实例',
      'Map：新增 displayOptions / bounds / enablePreferredLanguage / enableIconInfoWindow',
      'Control：新增 CustomControl 支持自定义控件',
      'fix：首帧个性化样式 / mapType 闪烁；能力矩阵版本归属校正',
    ],
  },
  {
    version: '2.0.1',
    changes: [
      'ThreeLayer 改为手写组件，补齐单测与文档',
      '补齐 L0–L4 自动化测试套件与上线前门禁',
      'BMapSDK 复用官方 jsapi 类型，几何转换获得真实类型',
      'Marker3D 重建时机改由 GL 就绪信号驱动，替换 500ms 盲等',
      'examples 改用 HashRouter，docs 构建产物不再入库',
    ],
  },
];
