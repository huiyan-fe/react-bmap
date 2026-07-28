import React, { useState } from 'react';
import { Map, TileLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../TestProvider';

/**
 * TileLayer 测试。
 *
 * 覆盖：
 * - tileUrlTemplate
 * - transparentPng
 * - zIndex
 * - 4.0 only 能力（normalLayer/geoJSONLayer）通过 useCapabilities 显示
 */
export function TileLayerTestPage() {
  const caps = useCapabilities();
  const [url, setUrl] = useState('https://api.map.baidu.com/customimage/tile?&x={X}&y={Y}&z={Z}&styles=pl&udt=20150601');
  const [transparentPng, setTransparentPng] = useState(false);
  const [zIndex, setZIndex] = useState(1);
  const [visible, setVisible] = useState(true);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={11} style={{ height: '100%' }}>
          {visible && (
            <TileLayer
              tileUrlTemplate={url}
              transparentPng={transparentPng}
              zIndex={zIndex}
            />
          )}
        </Map>
      </div>

      <div className="test-controls">
        <h2>TileLayer</h2>

        <section>
          <h3>能力矩阵（当前 driver）</h3>
          <div className="cap-grid">
            <div className={`cap-cell ${caps.has('TileLayer') ? 'ok' : 'no'}`}>tileLayer</div>
            <div className={`cap-cell ${caps.has('NormalLayer') ? 'ok' : 'no'}`}>normalLayer (v4+)</div>
            <div className={`cap-cell ${caps.has('GeoJSONLayer') ? 'ok' : 'no'}`}>geoJSONLayer (v4+)</div>
            <div className={`cap-cell ${caps.has('DistrictLayer') ? 'ok' : 'no'}`}>districtLayer (v4+)</div>
          </div>
        </section>

        <section>
          <h3>visible</h3>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
            />
            show TileLayer
          </label>
        </section>

        <section>
          <h3>tileUrlTemplate</h3>
          <textarea
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="full-width"
            rows={3}
          />
          <div className="btn-group">
            <button onClick={() => setUrl('https://api.map.baidu.com/customimage/tile?&x={X}&y={Y}&z={Z}&styles=pl&udt=20150601')}>
              默认瓦片
            </button>
            <button onClick={() => setUrl('https://h0.huyu.com/tile?x={X}&y={Y}&z={Z}')}>
              切换示例
            </button>
          </div>
        </section>

        <section>
          <h3>transparentPng</h3>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={transparentPng}
              onChange={(e) => setTransparentPng(e.target.checked)}
            />
            transparentPng
          </label>
        </section>

        <section>
          <h3>zIndex: {zIndex}</h3>
          <input
            type="range"
            min={0}
            max={10}
            value={zIndex}
            onChange={(e) => setZIndex(Number(e.target.value))}
            className="full-width"
          />
        </section>
      </div>
    </div>
  );
}
