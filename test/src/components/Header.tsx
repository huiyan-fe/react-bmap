import React, { useState } from 'react';
import { useBMapContext } from 'react-bmap';
import type { BMapVersion } from 'react-bmap';
import { VERSIONS, type TestPage } from '../config';
import { switchVersion } from '../TestProvider';

interface HeaderProps {
  current: BMapVersion;
  pages: TestPage[];
}

/**
 * 顶部导航：版本切换 + 当前 driver 状态指示。
 *
 * - 预设按钮：3.0 / 4.0
 * - 自定义输入：可填 '4.1' / '5.0' 等未来版本（框架未显式定义则按 4.0 处理，
 *   jsapi-loader 仍按用户输入的版本加载）
 *
 * 切换版本会刷新页面（JSAPI 全局单例，见 DESIGN.md §4.2）。
 */
export function Header({ current, pages }: HeaderProps) {
  const { status, error, driver } = useBMapContext();
  const ready = status === 'ready';
  const implementedCount = pages.filter(p => p.ready).length;
  const [customVersion, setCustomVersion] = useState('');

  const applyVersion = (v: string) => {
    if (v && v !== current && confirm(`切换到 JSAPI ${v}？\n需要刷新页面重新加载 SDK。\n\n${v !== '3.0' && v !== '4.0' ? `注意：框架未显式定义 ${v}，会按 4.0 处理（仍按 ${v} 加载 SDK）。` : ''}`)) {
      switchVersion(v as BMapVersion);
    }
  };

  // 显示「实际加载版本」与「driver 内部版本」的差异（未来版本按 4.0 处理）
  const versionDisplay = driver && current !== driver.version
    ? `${current}（按 ${driver.version} 处理）`
    : current;

  return (
    <header className="header">
      <div className="header-left">
        <span className="header-title">react-bmap</span>
        <span className="header-sub">test suite</span>
        <span className="header-meta">
          {implementedCount}/{pages.length} 用例
        </span>
      </div>

      <div className="header-right">
        <div className={`status-pill status-${status}`}>
          {status === 'loading' && '加载中'}
          {status === 'ready' && `ready (version=${versionDisplay})`}
          {status === 'error' && `error: ${error?.message ?? 'unknown'}`}
        </div>

        <div className="version-switcher">
          <span className="version-label">JSAPI 版本</span>
          <div className="version-buttons">
            {VERSIONS.map((v) => (
              <button
                key={v}
                className={`version-btn ${current === v ? 'active' : ''}`}
                onClick={() => applyVersion(v)}
              >
                {v}
              </button>
            ))}
            {/* 高亮自定义版本按钮（如果当前版本不在预设里） */}
            {!VERSIONS.includes(current as any) && current && (
              <button className="version-btn active">{current}</button>
            )}
          </div>
          {/* 自定义版本输入（4.1 / 5.0 等） */}
          <input
            type="text"
            value={customVersion}
            onChange={e => setCustomVersion(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') applyVersion(customVersion); }}
            placeholder="自定义版本（如 4.1）"
            style={{
              padding: '4px 8px',
              borderRadius: 3,
              border: '1px solid #444',
              background: '#2a2a2a',
              color: '#ddd',
              fontSize: 12,
              fontFamily: 'monospace',
              width: 130,
              marginLeft: 4,
            }}
          />
          <button
            className="version-btn"
            onClick={() => applyVersion(customVersion)}
            disabled={!customVersion}
            style={{ opacity: customVersion ? 1 : 0.4 }}
          >
            →
          </button>
        </div>
      </div>
    </header>
  );
}
