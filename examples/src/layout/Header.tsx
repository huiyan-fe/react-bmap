import React from 'react';
import { Link } from 'react-router-dom';
import { useMapMode, useSetMapMode } from '../context/MapModeContext';

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

export function Header() {
  const mode = useMapMode();
  const setMode = useSetMapMode();

  return (
    <header className="app-header">
      <Link to="/" className="app-header-title">
        React-BMap
      </Link>
      <div className="app-header-right">
        <div className="app-header-select-wrap">
          <label className="app-header-select-label">地图模式</label>
          <select
            className="app-header-select"
            value={mode}
            onChange={(e) => setMode(e.target.value as '2d' | 'gl')}
          >
            <option value="2d">2D</option>
            <option value="gl">GL</option>
          </select>
        </div>
        <a
          href="https://github.com/huiyan-fe/react-bmap"
          target="_blank"
          rel="noopener noreferrer"
          className="app-header-icon"
          title="GitHub"
        >
          {GITHUB_ICON}
        </a>
        <a
          href="https://www.npmjs.com/package/react-bmap"
          target="_blank"
          rel="noopener noreferrer"
          className="app-header-icon"
          title="npm"
        >
          {NPM_ICON}
        </a>
      </div>
    </header>
  );
}
