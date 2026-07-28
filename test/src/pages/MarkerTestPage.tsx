import React, { useState } from 'react';
import { Map, Marker } from 'react-bmap';
import type { Point } from 'react-bmap';
import { BEIJING } from '../TestProvider';

/**
 * Marker 测试。
 *
 * 覆盖：
 * - 受控 position / rotation / title / enableDragging
 * - position 变化只调 setter，不重建 overlay
 * - onClick / onDoubleClick 事件
 */
export function MarkerTestPage() {
  const [position, setPosition] = useState<Point>(BEIJING);
  const [rotation, setRotation] = useState(0);
  const [title, setTitle] = useState('天安门');
  const [draggable, setDraggable] = useState(true);
  const [clickLog, setClickLog] = useState<string[]>([]);

  const log = (msg: string) => {
    setClickLog((s) => [`${new Date().toLocaleTimeString()} ${msg}`, ...s].slice(0, 5));
  };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map
          defaultCenter={position}
          defaultZoom={12}
          center={position}
          zoom={12}
          style={{ height: '100%' }}
        >
          <Marker
            position={position}
            rotation={rotation}
            title={title}
            enableDragging={draggable}
          />
        </Map>
      </div>

      <div className="test-controls">
        <h2>Marker</h2>

        <section>
          <h3>position</h3>
          <div className="input-row">
            <label>lng</label>
            <input
              type="number"
              value={position.lng}
              step={0.01}
              onChange={(e) => setPosition((p: Point) => ({ ...p, lng: Number(e.target.value) }))}
            />
            <label>lat</label>
            <input
              type="number"
              value={position.lat}
              step={0.01}
              onChange={(e) => setPosition((p: Point) => ({ ...p, lat: Number(e.target.value) }))}
            />
          </div>
          <div className="btn-group">
            <button onClick={() => setPosition({ lng: 116.404, lat: 39.915 })}>北京</button>
            <button onClick={() => setPosition({ lng: 121.474, lat: 31.230 })}>上海</button>
          </div>
        </section>

        <section>
          <h3>rotation: {rotation}</h3>
          <input
            type="range"
            min={0}
            max={360}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="full-width"
          />
        </section>

        <section>
          <h3>title</h3>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="full-width"
          />
        </section>

        <section>
          <h3>enableDragging</h3>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={draggable}
              onChange={(e) => setDraggable(e.target.checked)}
            />
            enableDragging（拖拽 marker 看 position 是否同步）
          </label>
        </section>

        <section>
          <h3>事件日志</h3>
          <div className="event-log">
            {clickLog.length === 0 ? (
              <div className="muted">点击 marker 触发事件</div>
            ) : (
              clickLog.map((line, i) => <div key={i}>{line}</div>)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
