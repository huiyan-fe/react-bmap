import React, { useEffect, useState } from 'react';
import {
  Map,
  useMapStatus,
  useCapabilities,
} from 'react-bmap';
import type { MapSnapshot } from 'react-bmap';
import { BEIJING } from '../TestProvider';

function StateProbe({ onChange }: { onChange: (s: MapSnapshot | null) => void }) {
  const status = useMapStatus();
  useEffect(() => { onChange(status); }, [status, onChange]);
  return null;
}

/**
 * Unsupported 行为测试页 — 纯声明式（不调 ref 命令）。
 *
 * 通过给 <Map> 传「当前版本不支持」的 props，观察 driver 的处理：
 * - 传 heading/tilt 在 v3 下 → console.warn（unsupportedBehavior="warn"）
 * - 传 mapStyleV2 在 v3 下 → console.warn
 * - 传 mapStyle v1 在 v4 下 → console.warn
 *
 * 同时用 useCapabilities() 显示当前版本支持情况，验证 capabilities 与真实行为一致。
 */
export function UnsupportedPage() {
  const caps = useCapabilities();
  const [status, setStatus] = useState<MapSnapshot | null>(null);

  const [heading, setHeading] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [useV2Style, setUseV2Style] = useState(false);
  const [useV1Style, setUseV1Style] = useState(false);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map
          defaultCenter={BEIJING}
          defaultZoom={11}
          heading={heading || undefined}
          tilt={tilt || undefined}
          mapStyle={useV1Style ? { styleJson: [] } : undefined}
          mapStyleV2={useV2Style ? { styleId: 'test' } : undefined}
          style={{ height: '100%' }}
        >
          <StateProbe onChange={setStatus} />
        </Map>
        <div className="map-overlay-info">
          <div className="state-display">
            <div>当前 driver 行为：</div>
            <div>heading: <code>{status?.heading ?? '—'}</code></div>
            <div>tilt: <code>{status?.tilt ?? '—'}</code></div>
          </div>
        </div>
      </div>

      <div className="test-controls">
        <h2>Unsupported 行为（声明式）</h2>
        <p className="muted small">
          点击下方开关传「当前版本不支持」的 props，看 driver 是否按 <code>unsupportedBehavior="warn"</code> 处理（控制台 warn，地图不崩）。
        </p>

        <section>
          <h3>当前能力快照</h3>
          <div className="cap-grid">
            <div className={`cap-cell ${caps.has('Map.setHeading') ? 'ok' : 'no'}`}>
              Map.setHeading ({caps.has('Map.setHeading') ? '✓' : '✗'})
            </div>
            <div className={`cap-cell ${caps.has('Map.setTilt') ? 'ok' : 'no'}`}>
              Map.setTilt ({caps.has('Map.setTilt') ? '✓' : '✗'})
            </div>
            <div className={`cap-cell ${caps.has('Map.setMapStyle') ? 'ok' : 'no'}`}>
              Map.setMapStyle v1 ({caps.has('Map.setMapStyle') ? '✓' : '✗'})
            </div>
            <div className={`cap-cell ${caps.has('Map.setMapStyleV2') ? 'ok' : 'no'}`}>
              Map.setMapStyleV2 ({caps.has('Map.setMapStyleV2') ? '✓' : '✗'})
            </div>
            <div className={`cap-cell ${caps.has('Map.enableMapClick') ? 'ok' : 'no'}`}>
              Map.enableMapClick ({caps.has('Map.enableMapClick') ? '✓' : '✗'})
            </div>
            <div className={`cap-cell ${caps.has('Prism') ? 'ok' : 'no'}`}>
              Prism class ({caps.has('Prism') ? '✓' : '✗'})
            </div>
          </div>
        </section>

        <section>
          <h3>声明式触发改视角（4.0+ only）
            <span className={`cap-tag ${caps.has('Map.setHeading') ? 'ok' : 'no'}`}>
              {caps.has('Map.setHeading') ? '当前支持' : '当前 unsupported'}
            </span>
          </h3>
          <div className="btn-group">
            <button onClick={() => setHeading(h => h === 0 ? 45 : 0)}>
              {heading === 45 ? '✓ ' : ''}set heading=45
            </button>
            <button onClick={() => setTilt(t => t === 0 ? 60 : 0)}>
              {tilt === 60 ? '✓ ' : ''}set tilt=60
            </button>
            <button onClick={() => { setHeading(0); setTilt(0); }}>reset</button>
          </div>
          <p className="muted small">
            v3 下点击会触发 console.warn，地图视觉无变化；v4 下点击会真实旋转/倾斜地图。
          </p>
        </section>

        <section>
          <h3>声明式切换样式版本</h3>
          <div className="btn-group">
            <button
              className={useV1Style ? 'active' : ''}
              onClick={() => { setUseV1Style(v => !v); setUseV2Style(false); }}
            >
              mapStyle v1
              <span className={`cap-tag ${caps.has('Map.setMapStyle') ? 'ok' : 'no'}`}>
                {caps.has('Map.setMapStyle') ? '3.0' : 'v4 ❌'}
              </span>
            </button>
            <button
              className={useV2Style ? 'active' : ''}
              onClick={() => { setUseV2Style(v => !v); setUseV1Style(false); }}
            >
              mapStyleV2
              <span className={`cap-tag ${caps.has('Map.setMapStyleV2') ? 'ok' : 'no'}`}>
                {caps.has('Map.setMapStyleV2') ? 'v4+' : '3.0 ❌'}
              </span>
            </button>
          </div>
          <p className="muted small">
            v3 下开 V2 / v4 下开 V1 都会 console.warn，地图样式不生效。
          </p>
        </section>

        <section>
          <h3>验证清单</h3>
          <ul className="state-list">
            <li>• 切换版本（顶部 Header），能力快照应随之变化</li>
            <li>• 不支持的 prop 被传时，控制台 warn 而非崩</li>
            <li>• <code>useCapabilities</code> 返回值与真实行为一致</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
