import React from 'react';
import { BMapProvider } from 'react-bmap';
import type { BMapVersion } from 'react-bmap';
import { DEFAULT_VERSION } from './config';

export const TEST_AK = 'mbKnRu5DQqM420lpbt7tbtm7WK6jiQln';
export const BEIJING = { lng: 116.402544, lat: 39.928216 };

/** 从 URL query 读取版本（fallback localStorage，再 fallback default） */
export function readVersionFromLocation(): BMapVersion {
  if (typeof window === 'undefined') return DEFAULT_VERSION;
  const params = new URLSearchParams(window.location.search);
  const v = params.get('version');
  if (v) return v as BMapVersion;   // 接受任意字符串（包括 4.1 / 5.0 等未来版本）
  const stored = localStorage.getItem('bmap-test-version');
  if (stored) return stored as BMapVersion;
  return DEFAULT_VERSION;
}

/** 切换版本：写入 URL 并刷新页面（JSAPI 是全局单例，必须刷新） */
export function switchVersion(version: BMapVersion): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('bmap-test-version', version);
  const url = new URL(window.location.href);
  url.searchParams.set('version', version);
  window.location.href = url.toString();
}

interface AppProviderProps {
  children: React.ReactNode;
  version: BMapVersion;
}
/**
 * App 级 Provider：在应用生命周期内根据当前 version 加载对应 JSAPI。
 * 注意：version 由 URL 决定，运行时切换版本会触发页面刷新（JSAPI 全局单例，DESIGN.md §4.2）。
 */
export function AppProvider({ children, version }: AppProviderProps) {
  // 4.0+ 需要 globalConfig 才能正确初始化内部状态（language/coordType 等）
  const isV4 = version !== '3.0';
  return (
    <BMapProvider
      ak={TEST_AK}
      version={version}
      unsupportedBehavior="warn"
      timeout={15000}
      // globalConfig={isV4 ? { apiVersion: 'gl', coordType: 'bd09ll' } : undefined}
      fallback={<div style={{ padding: 24, textAlign: 'center' }}>加载地图 API（version={version}）中...</div>}
      errorFallback={<div style={{ padding: 24, color: 'red' }}>地图 API 加载失败（version={version}）</div>}
      onError={(err) => {
        // eslint-disable-next-line no-console
        console.error('[test] BMapProvider onError:', err);
      }}
      onLoadConflict={(current: unknown, requested: unknown) => {
        // eslint-disable-next-line no-console
        console.warn('[test] load conflict:', { current, requested });
      }}
    >
      {children}
    </BMapProvider>
  );
}

export type { BMapVersion };
