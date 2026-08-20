import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { COMPONENTS, CATEGORIES } from '../config/components';
import { useMapVersion, useSetMapVersion } from '../context/MapModeContext';

const VERSIONS = ['4.0', '3.0'] as const;

const CHECK_ICON = (
  <svg
    className="app-sidebar-option-check"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/** 自定义下拉：原生 <option> 没法跨浏览器统一样式，所以自己画一份 */
function VersionSelect() {
  const version = useMapVersion();
  const setVersion = useSetMapVersion();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="app-sidebar-select" ref={wrapRef}>
      <button
        type="button"
        className="app-sidebar-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {version}
        <svg
          className={`app-sidebar-select-arrow${open ? ' is-open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <ul className="app-sidebar-select-list" role="listbox" aria-label="地图版本">
          {VERSIONS.map((v) => (
            <li
              key={v}
              role="option"
              aria-selected={v === version}
              tabIndex={0}
              className={`app-sidebar-select-option${v === version ? ' is-active' : ''}`}
              onClick={() => {
                setVersion(v);
                setOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setVersion(v);
                  setOpen(false);
                }
              }}
            >
              {v}
              {v === version && CHECK_ICON}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const GITHUB_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const NPM_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.331h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
  </svg>
);

export function Sidebar() {
  const { id } = useParams();

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-head">
        <Link to="/" className="app-sidebar-title">
          React-BMap
        </Link>
        <div className="app-sidebar-select-wrap">
          <span className="app-sidebar-select-label">地图版本</span>
          <VersionSelect />
        </div>
      </div>

      {/* 只有这一段滚动，头尾固定 */}
      <nav className="app-sidebar-nav">
        <div style={{ padding: '0 16px 12px', fontSize: 14, color: '#888' }}>
          组件
        </div>
        {CATEGORIES.map((cat) => {
          const items = COMPONENTS.filter((c) => c.category === cat);
          if (!items.length) return null;
          return (
            <div key={cat} style={{ marginBottom: 8 }}>
              <div
                style={{
                  padding: '8px 16px',
                  fontSize: 12,
                  color: '#888',
                  textTransform: 'uppercase',
                }}
              >
                {cat}
              </div>
              {items.map((c) => (
                <Link
                  key={c.id}
                  to={`/component/${c.id}`}
                  style={{
                    display: 'block',
                    padding: '8px 16px 8px 24px',
                    fontSize: 14,
                    color: id === c.id ? '#1890ff' : '#333',
                    textDecoration: 'none',
                    background: id === c.id ? '#e6f7ff' : 'transparent',
                  }}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="app-sidebar-foot">
        <a
          href="https://github.com/huiyan-fe/react-bmap"
          target="_blank"
          rel="noopener noreferrer"
          className="app-sidebar-icon"
          title="GitHub"
        >
          {GITHUB_ICON}
        </a>
        <a
          href="https://www.npmjs.com/package/react-bmap"
          target="_blank"
          rel="noopener noreferrer"
          className="app-sidebar-icon"
          title="npm"
        >
          {NPM_ICON}
        </a>
      </div>
    </aside>
  );
}
