import React, { useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom';

/**
 * 官网通栏头部。
 *
 * LbsHeader 不是 npm 包，而是由 lbs-module-sdk 脚本挂到全局变量 `lbsModuleSDK` 上的，
 * 所以只能运行时插 <script> 再取全局。脚本地址见 examples/.env 的 VITE_LBS_HEADER_URL。
 *
 * 该脚本是 UMD，且把 React/ReactDOM 当**外部依赖**从全局取（脚本头部
 * `e.lbsModuleSDK = t(e.React, e.ReactDOM)`），所以必须在插入 script 之前
 * 把 window.React / window.ReactDOM 挂好，否则 lbsModuleSDK 根本不会被创建。
 * 好处是 header 复用本工程的 React 实例，不存在双 React 导致的 hooks 报错。
 *
 * 加载失败时静默降级为不渲染 —— demo 站的主体是组件示例，头部缺失不该阻断页面。
 */

interface LbsModuleSDK {
  LbsHeader?: React.ComponentType;
}

declare global {
  interface Window {
    React?: typeof React;
    ReactDOM?: typeof ReactDOM;
    lbsModuleSDK?: LbsModuleSDK;
  }
}

const HEADER_URL = import.meta.env.VITE_LBS_HEADER_URL;

// 同一份脚本只注入一次：StrictMode 的双次 effect、以及组件重挂载都复用这个 promise
let pending: Promise<void> | undefined;

function loadScript(url: string): Promise<void> {
  if (!pending) {
    window.React = React;
    window.ReactDOM = ReactDOM;
    pending = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`failed to load script: ${url}`));
      document.head.appendChild(script);
    });
  }
  return pending;
}

export function LbsHeader() {
  const [Header, setHeader] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (!HEADER_URL) return;

    let alive = true;
    loadScript(HEADER_URL)
      .then(() => {
        const Component = window.lbsModuleSDK?.LbsHeader;
        if (!Component) {
          console.error('[examples] 脚本已加载，但全局 lbsModuleSDK.LbsHeader 不存在');
          return;
        }
        // setState 收到函数会当成 updater，组件类型要包一层返回
        if (alive) setHeader(() => Component);
      })
      .catch((error: unknown) => {
        console.error('[examples] LbsHeader 加载失败:', error);
      });

    return () => {
      alive = false;
    };
  }, []);

  if (!Header) return null;

  return (
    <div className="app-lbs-header">
      <Header />
    </div>
  );
}
