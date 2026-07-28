import React, { useState } from 'react';
import { Map, NavigationControl } from 'react-bmap';
import { BEIJING } from '../TestProvider';

/**
 * NavigationControl 测试。
 */
export function NavigationControlTestPage() {
  const [anchor, setAnchor] = useState<number | undefined>(undefined);
  const [type, setType] = useState<number | undefined>(undefined);
  const [showZoomInfo, setShowZoomInfo] = useState(true);
  const [showControl, setShowControl] = useState(true);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={11} style={{ height: '100%' }}>
          {showControl && (
            <NavigationControl
              anchor={anchor as any}
              type={type}
              showZoomInfo={showZoomInfo}
            />
          )}
        </Map>
      </div>

      <div className="test-controls">
        <h2>NavigationControl</h2>

        <section>
          <h3>visible</h3>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={showControl}
              onChange={(e) => setShowControl(e.target.checked)}
            />
            show control
          </label>
        </section>

        <section>
          <h3>anchor</h3>
          <div className="btn-group">
            <button onClick={() => setAnchor(undefined)}>default</button>
            <button onClick={() => setAnchor(0)}>TOP_LEFT</button>
            <button onClick={() => setAnchor(1)}>TOP_RIGHT</button>
            <button onClick={() => setAnchor(2)}>BOTTOM_LEFT</button>
            <button onClick={() => setAnchor(3)}>BOTTOM_RIGHT</button>
          </div>
        </section>

        <section>
          <h3>type</h3>
          <div className="btn-group">
            <button onClick={() => setType(undefined)}>default</button>
            <button onClick={() => setType(0)}>LARGE</button>
            <button onClick={() => setType(1)}>SMALL</button>
            <button onClick={() => setType(2)}>PAN</button>
            <button onClick={() => setType(3)}>ZOOM</button>
          </div>
        </section>

        <section>
          <h3>showZoomInfo</h3>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={showZoomInfo}
              onChange={(e) => setShowZoomInfo(e.target.checked)}
            />
            showZoomInfo
          </label>
        </section>
      </div>
    </div>
  );
}
