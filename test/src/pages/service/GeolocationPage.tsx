/**
 * useGeolocation 测试页 — 浏览器定位。
 * 覆盖：getCurrentPosition / getStatus / enableSDKLocation / disableSDKLocation
 */
import React, { useState } from 'react';
import { Map, useGeolocation, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

export function GeolocationPage() {
  const caps = useCapabilities();
  const supported = caps.has('Geolocation');
  const [sdkLocation, setSdkLocation] = useState(false);
  const { data, loading, error, getCurrentPosition, getStatus, enableSDKLocation, disableSDKLocation, cancel } = useGeolocation({ enableSDKLocation: sdkLocation });

  const status = getStatus();

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }} />
      </div>
      <div className="test-controls">
        <h2>useGeolocation</h2>
        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'v4+' : 'v3 ✗'}</span>
          <p className="muted small">@since 4.0。浏览器定位服务。v3 不支持。</p>
        </section>
        <section>
          <h3>操作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button onClick={() => getCurrentPosition()} disabled={!supported || loading}>{loading ? 'locating...' : '获取位置'}</button>
            <button onClick={cancel}>cancel</button>
          </div>
          <div className="btn-group" style={{ flexWrap: 'wrap', marginTop: 4 }}>
            <button style={{ fontSize: 11 }} className={sdkLocation ? 'active' : ''} onClick={() => { setSdkLocation(true); enableSDKLocation(); }}>enableSDKLocation</button>
            <button style={{ fontSize: 11 }} className={!sdkLocation ? 'active' : ''} onClick={() => { setSdkLocation(false); disableSDKLocation(); }}>disableSDKLocation</button>
          </div>
        </section>
        <section>
          <h3>状态</h3>
          <ul className="state-list">
            <li>loading: <code>{String(loading)}</code></li>
            <li>error: <code>{error?.message ?? 'null'}</code></li>
            <li>status: <code>{String(status)}</code></li>
            <li>data: <code>{data ? '有结果' : 'null'}</code></li>
          </ul>
        </section>
        {data && (
          <section>
            <h3>结果</h3>
            <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto', maxHeight: 300 }}>
              {(() => { try { return JSON.stringify(data, (k, v) => v instanceof HTMLElement ? '<DOM>' : typeof v === 'function' ? '<fn>' : v, 2); } catch { return String(data); } })()}
            </pre>
          </section>
        )}
        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`import { useGeolocation } from 'react-bmap';

const { getCurrentPosition, getStatus, enableSDKLocation, disableSDKLocation, data, cancel } = useGeolocation();
getCurrentPosition(); // 获取当前位置
getStatus();          // 获取定位状态
enableSDKLocation();  // 启用 SDK 定位`}
          </pre>
        </section>
      </div>
    </div>
  );
}
