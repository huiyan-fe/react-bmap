/**
 * CustomControl — React children based custom control.
 *
 * 对照 CustomOverlay.tsx 的手法：手动建一个容器 div，交给 driver 的
 * createCustomControl(domCreate) 挂到地图容器上（固定像素位置，不随地图平移缩放），
 * 再用 createPortal 把 children 渲染进这个容器。
 *
 * 与 CustomOverlay 的本质区别：CustomOverlay 绑定地理坐标（point），会随地图移动；
 * CustomControl 固定于地图容器的像素位置（anchor + offset），不随地图移动。
 */
import { memo, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useMapContext } from '../../context/MapContext';
import { stableStringify } from '../../utils/stableStringify';
import type { ControlHandle } from '../../types';
import type { ControlAnchor } from '../../constants';
import type { Size } from '../../types';

export interface CustomControlProps {
  /** 停靠位置，默认由 SDK 决定（通常为左上角） */
  anchor?: ControlAnchor;
  /** 相对停靠位置的像素偏移 */
  offset?: Size;
  /** 控制显示/隐藏。undefined 或 true = 显示，false = 隐藏 */
  visible?: boolean;
  /** 自定义控件内容，会被渲染到挂载在地图容器上的 DOM 节点内 */
  children?: React.ReactNode;
}

const CTOR_ONLY_PROPS: Array<keyof CustomControlProps> = ['anchor', 'offset'];

function pickCtorOptions(props: CustomControlProps): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of CTOR_ONLY_PROPS) {
    const value = props[key];
    if (value !== undefined && value !== null) out[key] = value;
  }
  return out;
}

export const CustomControl = memo(function CustomControl(props: CustomControlProps) {
  const { map, driver } = useMapContext();
  const controlRef = useRef<ControlHandle | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  if (!containerRef.current && typeof document !== 'undefined') {
    containerRef.current = document.createElement('div');
  }

  const ctorKey = stableStringify(CTOR_ONLY_PROPS.map(k => props[k]));

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!map || !driver || !container) return;

    const ctorOpts = pickCtorOptions(propsRef.current);
    const control = driver.createCustomControl(() => container, ctorOpts);
    if (!control) return;

    controlRef.current = control;
    driver.addControl(map, control);
    if (propsRef.current.visible === false) driver.hideControl(control);

    return () => {
      driver.removeControl(map, control);
      controlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, ctorKey]);

  const { visible } = props;
  useLayoutEffect(() => {
    if (!controlRef.current || !driver) return;
    if (visible === false) driver.hideControl(controlRef.current);
    else driver.showControl(controlRef.current);
  }, [driver, visible]);

  const container = containerRef.current;
  return container ? createPortal(props.children, container) : null;
});
