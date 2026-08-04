/** useAutocomplete 测试页 — 输入提示。需要 input 元素才能工作。 */
import React, { useCallback, useState } from 'react';
import { Map, useAutocomplete, useCapabilities } from 'react-bmap';
import { BEIJING } from '../../TestProvider';
import { safeStringifySdkResult } from '../../utils/sdkResult';

export function AutocompletePage() {
  const caps = useCapabilities();
  const supported = caps.has('Autocomplete');
  const [inputEl, setInputEl] = useState<HTMLElement | null>(null);
  const inputCallbackRef = useCallback((el: HTMLInputElement | null) => { setInputEl(el); }, []);

  const { data, loading, error, show, hide, getResults, cancel } = useAutocomplete({
    location: '北京',
    input: inputEl ?? undefined,
    onSearchComplete: (results) => console.log('[Autocomplete] onSearchComplete:', results),
  });

  return (
    <div className="test-page">
      <div className="test-map"><Map defaultCenter={BEIJING} defaultZoom={12} style={{ height: '100%' }} /></div>
      <div className="test-controls">
        <h2>useAutocomplete</h2>
        <section><h3>能力</h3><span className={`cap-tag ${supported ? 'ok' : 'no'}`}>{supported ? 'supported' : 'unsupported'}</span><p className="muted small">全版本共有。输入提示服务。绑定 input 元素后，输入字符自动触发搜索并显示下拉建议。</p></section>

        <section>
          <h3>输入框（输入字符自动搜索）</h3>
          <input ref={inputCallbackRef} className="full-width" placeholder="输入关键词，如：餐厅" style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }} />
          <p className="muted small">在此输入框输入字符会自动触发 onSearchComplete，下方显示下拉建议。</p>
        </section>

        <section>
          <h3>操作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button style={{ fontSize: 11 }} onClick={show}>show（显示建议）</button>
            <button style={{ fontSize: 11 }} onClick={hide}>hide（隐藏建议）</button>
            <button style={{ fontSize: 11 }} onClick={() => console.log('getResults:', getResults())}>getResults</button>
            <button onClick={cancel}>cancel</button>
          </div>
        </section>

        <section>
          <h3>状态</h3>
          <ul className="state-list">
            <li>loading: <code>{String(loading)}</code></li>
            <li>error: <code>{error?.message ?? 'null'}</code></li>
            <li>supported: <code>{String(supported)}</code></li>
            <li>data: <code>{data ? '有结果' : 'null'}</code></li>
          </ul>
        </section>

        {data && (
          <section>
            <h3>结果</h3>
            <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto', maxHeight: 300 }}>{safeStringifySdkResult(data)}</pre>
          </section>
        )}

        <section>
          <h3>代码示例</h3>
          <pre style={{ fontSize: 10, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`// 绑定 input 元素，输入字符自动触发搜索
const { show, hide, getResults, data } = useAutocomplete({
  location: '北京',
  input: document.getElementById('myInput'),
  onSearchComplete: (results) => console.log(results),
});

// 辅助操作
show();       // 显示建议列表
hide();       // 隐藏建议列表
getResults(); // 获取结果`}
          </pre>
        </section>
      </div>
    </div>
  );
}
