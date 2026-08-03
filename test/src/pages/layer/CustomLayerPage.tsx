/**
 * CustomLayer 测试页 — LBS 云数据图层。
 * dts 标记 @removed 4.0（v3-only），v4 下可能不可用。
 *
 * Options: databoxId, geotableId, q, tags, filter, pointDensityType
 */
import React, { useState } from 'react';
import { Map, CustomLayer, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

export function CustomLayerPage() {
  const caps = useCapabilities();
  const supported = caps.has('CustomLayer');
  const [visible, setVisible] = useState(true);
  const [databoxId, setDataboxId] = useState('');
  const [geotableId, setGeotableId] = useState('');
  const [q, setQ] = useState('');
  const [tags, setTags] = useState('');
  const [filter, setFilter] = useState('');
  const [pointDensityType, setPointDensityType] = useState<number | undefined>(undefined);

  const rebuildKey = `${databoxId}|${geotableId}|${q}|${tags}|${filter}|${pointDensityType ?? ''}`;

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={11} style={{ height: '100%' }}>
          {visible && supported && (
            <CustomLayer
              key={rebuildKey}
              databoxId={databoxId || undefined}
              geotableId={geotableId || undefined}
              q={q || undefined}
              tags={tags || undefined}
              filter={filter || undefined}
              pointDensityType={pointDensityType}
            />
          )}
        </Map>
      </div>
      <div className="test-controls">
        <h2>CustomLayer</h2>

        <section>
          <h3>能力</h3>
          <span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'supported' : 'unsupported'}</span>
          <p className="muted small">
            LBS 云数据图层。dts 标记 @removed 4.0（v3-only），v4 下可能不可用。
            通过 map.addLayer / map.removeLayer 管理。
          </p>
        </section>

        <section>
          <h3>显示</h3>
          <label className="checkbox-row">
            <input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />
            显示图层（挂载 / 卸载）
          </label>
        </section>

        <section>
          <h3>databoxId</h3>
          <input type="text" className="full-width" placeholder="LBS 云数据表 ID" value={databoxId} onChange={e => setDataboxId(e.target.value)} />
        </section>

        <section>
          <h3>geotableId</h3>
          <input type="text" className="full-width" placeholder="geotable ID" value={geotableId} onChange={e => setGeotableId(e.target.value)} />
        </section>

        <section>
          <h3>q（检索关键词）</h3>
          <input type="text" className="full-width" placeholder="搜索关键词" value={q} onChange={e => setQ(e.target.value)} />
        </section>

        <section>
          <h3>tags（标签过滤）</h3>
          <input type="text" className="full-width" placeholder="标签，逗号分隔" value={tags} onChange={e => setTags(e.target.value)} />
        </section>

        <section>
          <h3>filter（条件过滤）</h3>
          <input type="text" className="full-width" placeholder="如: price>100" value={filter} onChange={e => setFilter(e.target.value)} />
        </section>

        <section>
          <h3>pointDensityType</h3>
          <input type="number" placeholder="未设置" value={pointDensityType ?? ''} onChange={e => setPointDensityType(e.target.value === '' ? undefined : Number(e.target.value))} />
        </section>

        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={() => {
              setVisible(true); setDataboxId(''); setGeotableId(''); setQ('');
              setTags(''); setFilter(''); setPointDensityType(undefined);
            }}>reset all</button>
          </div>
        </section>

        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`<Map defaultCenter={center} defaultZoom={11}>
  <CustomLayer
    databoxId="your_databox_id"
    geotableId="your_geotable_id"
    q="餐厅"
    tags="美食,中餐"
    filter="price>100"
    pointDensityType={1}
  />
</Map>`}
          </pre>
        </section>
      </div>
    </div>
  );
}
