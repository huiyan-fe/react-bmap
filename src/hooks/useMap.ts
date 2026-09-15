import { useMapContext } from '../context/MapContext';
import type { MapHandle } from '../types';

/**
 * 拿 MapHandle（可能为 null）。
 *
 * ⚠️ 时序：地图从创建到首帧渲染完成（`tilesloaded` 事件，或 500ms 兜底）之前，返回 null。
 * - 在 `<Map>` **内部**的子组件里用：`<Map>` 的 MapContext 只在 map 就绪后才挂载，所以子组件
 *   首次拿到的就已经是非-null handle，可直接使用。
 * - 在 `<Map>` **外部**（如与 <Map> 同级、把 map 传给 service hook 的 `renderOptions.map`）：
 *   会先拿到 null，需等就绪后再用。**不要在 null 时把它传给需要地图实例的 API**（会静默失败或抛错）。
 *   拿就绪 handle 的推荐做法：给 `<Map onReady={setMap}>` 传回调，或在 `<Map>` 内放 `useMapReady`
 *   哨兵把 handle 上提到外层 state。
 */
export function useMap(): MapHandle | null {
  return useMapContext().map;
}
