import React from 'react';
import { Panorama, PanoramaLabel } from 'react-bmap';
import { BEIJING } from '../TestProvider';

export function PanoramaTestPage() {
  return (
    <div className="test-page">
      <div className="test-map">
        <Panorama
          point={BEIJING}
          style={{ height: '100%', width: '100%' }}
        >
          <PanoramaLabel
            position={BEIJING}
            altitude={5}
            content="天安门"
          />
        </Panorama>
      </div>
      <div className="test-controls">
        <h2>Panorama + PanoramaLabel</h2>
        <p className="muted small">
          全景视图独立于 &lt;Map&gt;，有自己的 DOM 容器。
          PanoramaLabel 是全景内的标注。
        </p>
        <ul className="state-list">
          <li>• <code>point</code>: {BEIJING.lng}, {BEIJING.lat}</li>
          <li>• <code>PanoramaLabel</code>: altitude=5</li>
        </ul>
        <p className="muted small">
          如果全景加载失败，可能是 AK 权限不含全景服务。
          全景与普通地图相对独立，不需要嵌在 &lt;Map&gt; 内。
        </p>
      </div>
    </div>
  );
}
