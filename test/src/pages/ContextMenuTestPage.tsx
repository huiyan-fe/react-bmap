import React from 'react';
import { Map, ContextMenu, MenuItem } from 'react-bmap';
import { BEIJING } from '../TestProvider';

export function ContextMenuTestPage() {
  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }}>
          <ContextMenu>
            <MenuItem text="放大一级" callback={() => alert('放大')} />
            <MenuItem text="缩小一级" callback={() => alert('缩小')} />
            <MenuItem text="重置地图" callback={() => alert('重置')} />
          </ContextMenu>
        </Map>
      </div>
      <div className="test-controls">
        <h2>ContextMenu + MenuItem</h2>
        <p className="muted small">
          在地图上右键点击，应该看到三个菜单项：
        </p>
        <ul className="state-list">
          <li>• 放大一级</li>
          <li>• 缩小一级</li>
          <li>• 重置地图</li>
        </ul>
        <p className="muted small">
          点击菜单项会弹出对应的 alert。
          ContextMenu 也可以挂在 Marker 下（作为 Marker 的 children）。
        </p>
      </div>
    </div>
  );
}
