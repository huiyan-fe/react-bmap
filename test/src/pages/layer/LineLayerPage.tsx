/** LineLayer 测试页 — v4+。线图层（继承 NormalLayer）。 */
import React, { useMemo, useState } from 'react';
import { LineLayer } from 'react-bmap';
import type { LineLayerProps } from 'react-bmap';
import { DEFAULT_BASE_OPTIONS, LayerBaseOptionControls, LayerPageLayout, PropsView } from './shared';

const STYLE_PRESETS: Array<{ label: string; value: string }> = [
  { label: '蓝色细线', value: '{\n  "strokeColor": "#1890ff",\n  "strokeWeight": 3\n}' },
  { label: '红色粗线', value: '{\n  "strokeColor": "#f5222d",\n  "strokeWeight": 8,\n  "strokeOpacity": 0.8\n}' },
  { label: '虚线', value: '{\n  "strokeColor": "#52c41a",\n  "strokeWeight": 4,\n  "strokeStyle": "dashed"\n}' },
];

const CODE = `<Map defaultCenter={center} defaultZoom={11}>
  <LineLayer style={{ strokeColor: '#1890ff', strokeWeight: 3 }} enablePicked />
</Map>`;

export function LineLayerPage() {
  const [base, setBase] = useState<LineLayerProps>({ ...DEFAULT_BASE_OPTIONS });
  const [styleText, setStyleText] = useState(STYLE_PRESETS[0].value);
  const [idKey, setIdKey] = useState('');
  const [crs, setCrs] = useState('');
  const [enablePicked, setEnablePicked] = useState(false);

  const parsedStyle = useMemo(() => {
    if (styleText.trim() === '') return { value: undefined as unknown, error: '' };
    try {
      return { value: JSON.parse(styleText) as unknown, error: '' };
    } catch (e) {
      return { value: undefined as unknown, error: (e as Error).message };
    }
  }, [styleText]);

  const options: LineLayerProps = {
    ...base,
    style: parsedStyle.value,
    idKey: idKey || undefined,
    crs: crs || undefined,
    enablePicked: enablePicked || undefined,
  };

  return (
    <LayerPageLayout
      title="LineLayer"
      capability="LineLayer"
      versionNote="@since 4.0。线图层，继承 NormalLayer 的公共参数。"
      code={CODE}
      controls={
        <>
          <section>
            <h3>style（JSON）</h3>
            <div className="btn-group">
              {STYLE_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  className={styleText === preset.value ? 'active' : ''}
                  onClick={() => setStyleText(preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <textarea className="full-width" rows={5} value={styleText} onChange={e => setStyleText(e.target.value)} />
            {parsedStyle.error
              ? <p className="muted small" style={{ color: '#cf1322' }}>JSON 解析失败：{parsedStyle.error}（本次不下发 style）</p>
              : <p className="muted small">解析成功后作为 style 下发，图层会整体重建。</p>}
          </section>
          <section>
            <h3>其它参数</h3>
            <label className="checkbox-row" style={{ justifyContent: 'space-between' }}>
              idKey
              <input style={{ width: 120 }} value={idKey} onChange={e => setIdKey(e.target.value)} placeholder="默认" />
            </label>
            <label className="checkbox-row" style={{ justifyContent: 'space-between' }}>
              crs
              <input style={{ width: 120 }} value={crs} onChange={e => setCrs(e.target.value)} placeholder="默认" />
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={enablePicked} onChange={e => setEnablePicked(e.target.checked)} />
              enablePicked
            </label>
          </section>
          <LayerBaseOptionControls value={base} onChange={setBase} />
          <PropsView value={options} />
          <section>
            <h3>已知限制</h3>
            <p className="muted small">
              组件 API 没有暴露 data / setData，图层里没有任何线要素，所以地图上看不到内容。
              这里能验证的是图层的创建、参数下发与卸载；要素渲染请用 FeatureLayer / GeoJSONLayer。
            </p>
          </section>
        </>
      }
    >
      <LineLayer {...options} />
    </LayerPageLayout>
  );
}
