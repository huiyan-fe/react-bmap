/**
 * ContextMenu + MenuItem 组件。
 *
 * - <ContextMenu> 读 OverlayTargetContext 决定挂到 map 或 overlay（如 Marker）
 * - <MenuItem> 通过 ContextMenuContext 找到父菜单，调 addMenuItem
 *
 * 实现要点：
 * 1. menu 实例用 ref 缓存，只创建一次
 * 2. effect 不返回 cleanup —— 避免 React StrictMode 双调用时快速 remove+add 把 SDK 状态搞坏
 * 3. attach 状态用 ref 跟踪，组件真正 unmount 时通过 useEffect cleanup 统一 remove
 */
import { memo, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { useMapContext } from '../../context/MapContext';
import { useOverlayTarget } from '../../context/OverlayTargetContext';
import { createContext, useContext } from 'react';
import type { OverlayHandle, MapHandle } from '../../types';

const ContextMenuContext = createContext<OverlayHandle | null>(null);

export interface ContextMenuProps {
  children?: React.ReactNode;
}

export const ContextMenu = memo(function ContextMenu({ children }: ContextMenuProps) {
  const { map, driver } = useMapContext();
  const target = useOverlayTarget();

  // 提取 raw handle —— 这是最稳定的引用（SDK 实例本身），作为 effect 唯一依赖。
  const targetHandle = (target?.target ?? map) as (OverlayHandle & MapHandle) | null;

  const menuRef = useRef<OverlayHandle | null>(null);
  // 跟踪当前已 attach 到哪个 target（SDK menu 实例 + target 对）。
  // StrictMode 双调用时通过这个判断是否需要重复 add，避免快速 remove+add 搞坏 SDK。
  const attachedRef = useRef<{ target: OverlayHandle | MapHandle; menu: OverlayHandle } | null>(null);
  const [menuHandle, setMenuHandle] = useState<OverlayHandle | null>(null);

  // attach 逻辑：target 变化时 detach 旧的 + attach 新的；同一 target 跳过（StrictMode 安全）。
  // 故意不返回 cleanup —— cleanup 会在 StrictMode 双调用中立即触发 remove，
  // 紧接着的 setup 又 add，这种快速 remove+add 会让 SDK 内部状态失效（marker 命中区域塌缩）。
  useLayoutEffect(() => {
    if (!driver || !targetHandle) return;

    // menu 只创建一次
    if (!menuRef.current) {
      const menu = driver.createContextMenu({});
      if (!menu) return;
      menuRef.current = menu;
      setMenuHandle(menu);
    }
    const menu = menuRef.current;

    // 已经 attach 到同一 target：StrictMode 双调用或父组件重渲染，跳过。
    if (attachedRef.current?.target === targetHandle && attachedRef.current?.menu === menu) {
      return;
    }

    // target 变了：先 detach 旧的（如果有），再 attach 新的。
    if (attachedRef.current) {
      driver.removeContextMenu(attachedRef.current.target, attachedRef.current.menu);
    }
    driver.addContextMenu(targetHandle, menu);
    attachedRef.current = { target: targetHandle, menu };
  }, [driver, targetHandle]);

  // 组件真正 unmount 时统一 detach。
  useEffect(() => {
    return () => {
      if (driver && attachedRef.current && menuRef.current) {
        driver.removeContextMenu(attachedRef.current.target, attachedRef.current.menu);
        attachedRef.current = null;
        menuRef.current = null;
      }
    };
  }, [driver]);

  if (!children) return null;
  return <ContextMenuContext.Provider value={menuHandle}>{children}</ContextMenuContext.Provider>;
});

export interface MenuItemProps {
  text: string;
  callback?: () => void;
  iconWidth?: number;
  children?: React.ReactNode;
}

export const MenuItem = memo(function MenuItem({ text, callback, iconWidth }: MenuItemProps) {
  const { driver } = useMapContext();
  const menu = useContext(ContextMenuContext);
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useLayoutEffect(() => {
    if (!driver || !menu) return;
    const item = driver.createMenuItem(text, () => cbRef.current?.(), { iconWidth });
    if (!item) return;
    driver.addMenuItem(menu, item);
    return () => { driver.removeMenuItem(menu, item); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, menu, text, iconWidth]);

  return null;
});
