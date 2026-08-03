/**
 * TileLayer 全量测试页 — 覆盖 TileLayer.d.ts + TileLayerOptions.d.ts 全部功能。
 * TileLayer 是全版本共有的瓦片图层。
 * 通过 map.addLayer / map.removeLayer 管理（v4 统一接口）。
 * 所有字段仅 constructor 读取，props 变化时通过 key 重建。
 *
 * 注意：dark/light/midnight 等地图样式不是瓦片 URL 参数，走 map.setMapStyleV2。
 * TileLayer 的 tileUrlTemplate 只用于自定义瓦片服务。
 */
import React, { useState } from 'react';
import { Map, TileLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const DEFAULT_URL = 'https://maponline0.bdimg.com/tile/?qt=tile&x={X}&y={Y}&z={Z}&styles=pl&scaler=1&udt=20230815';

export function TileLayerFullPage() {
  const caps = useCapabilities();
  const supported = caps.has('TileLayer');

  const [visible, setVisible] = useState(true);
  const [url, setUrl] = useState(DEFAULT_URL);
  const [transparentPng, setTransparentPng] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [zIndex, setZIndex] = useState<number | undefined>(undefined);
  const [retry, setRetry] = useState(false);
  const [retryTime, setRetryTime] = useState<number | undefined>(300);
  const [cacheSize, setCacheSize] = useState<number | undefined>(undefined);

  // 所有字段 constructor-only，变化时用 key 重建
  const rebuildKey = `${url}|${transparentPng}|${opacity}|${zIndex ?? ''}|${retry}|${retryTime ?? ''}|${cacheSize ?? ''}`;

  const reset = () => {
    setVisible(true);
    setUrl(DEFAULT_URL);
    setTransparentPng(false);
    setOpacity(1);
    setZIndex(undefined);
    setRetry(false);
    setRetryTime(300);
    setCacheSize(undefined);
  };

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={11} style={{ height: '100%' }}>
          {visible && supported && (
            <TileLayer
              key={rebuildKey}
              tileUrlTemplate={url}
              transparentPng={transparentPng || undefined}
              opacity={opacity !== 1 ? opacity : undefined}
              zIndex={zIndex}
              retry={retry || undefined}
              retryTime={retryTime}
              cacheSize={cacheSize}
            />
          )}
        </Map>
      </div>
      <div className="test-controls">
        <h2>TileLayer（全量）</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'supported' : 'unsupported'}</span>
          <p className="muted small">全版本共有。瓦片图层，所有字段仅在 constructor 读取，变化时重建。</p>
        </section>

        <section>
          <h3>显示</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            显示图层（挂载 / 卸载）
          </label>
        </section>

        <section>
          <h3>tileUrlTemplate</h3>
          <textarea
            className="full-width"
            rows={2}
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
          <p className="muted small">瓦片 URL 模板，占位符 {`{X}/{Y}/{Z}`}。变化时重建图层。</p>
        </section>

        <section>
          <h3>transparentPng</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={transparentPng} onChange={e => setTransparentPng(e.target.checked)} />
            透明 PNG（重建）
          </label>
        </section>

        <section>
          <h3>opacity: {opacity}</h3>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={opacity}
            onChange={e => setOpacity(Number(e.target.value))}
            className="full-width"
          />
          <p className="muted small">透明度 0-1，变化时重建</p>
        </section>

        <section>
          <h3>zIndex</h3>
          <input
            type="number"
            placeholder="未设置"
            value={zIndex ?? ''}
            onChange={e => setZIndex(e.target.value === '' ? undefined : Number(e.target.value))}
          />
        </section>

        <section>
          <h3>retry / retryTime</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={retry} onChange={e => setRetry(e.target.checked)} />
            retry（加载失败重试，重建）
          </label>
          <label className="checkbox-row">
            retryTime (ms)
            <input
              type="number"
              placeholder="300"
              value={retryTime ?? ''}
              onChange={e => setRetryTime(e.target.value === '' ? undefined : Number(e.target.value))}
            />
          </label>
        </section>

        <section>
          <h3>cacheSize</h3>
          <input
            type="number"
            placeholder="未设置"
            value={cacheSize ?? ''}
            onChange={e => setCacheSize(e.target.value === '' ? undefined : Number(e.target.value))}
          />
        </section>

        <section>
          <h3>预设</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={reset}>reset all</button>
            <button style={{ fontSize: 11 }} onClick={() => { setTransparentPng(true); setOpacity(0.7); }}>透明叠加</button>
            <button style={{ fontSize: 11 }} onClick={() => { setRetry(true); setRetryTime(500); }}>重试模式</button>
            <button style={{ fontSize: 11 }} onClick={() => { setOpacity(0.5); setZIndex(5); }}>半透明高优</button>
          </div>
        </section>

        <section>
          <h3>当前 Props</h3>
          <pre style={{ fontSize: 11, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
            {JSON.stringify({
              tileUrlTemplate: url,
              transparentPng: transparentPng || undefined,
              opacity: opacity !== 1 ? opacity : undefined,
              zIndex,
              retry: retry || undefined,
              retryTime,
              cacheSize,
            }, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  );
}
