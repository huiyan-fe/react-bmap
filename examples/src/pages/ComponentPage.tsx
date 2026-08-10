import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useCapabilities, BMapErrorBoundary } from 'react-bmap';
import { CodeBlock } from '../components/CodeBlock';
import { ApiTable } from '../components/ApiTable';
import type { ApiMethod } from '../components/ApiTable';
import { COMPONENTS } from '../config/components';
import { API_DATA, API_METHODS } from '../config/apiData';
import { getDemoById } from '../demos';

export function ComponentPage() {
  const { id } = useParams<{ id: string }>();
  const caps = useCapabilities();
  const meta = COMPONENTS.find((c) => c.id === id);
  if (!meta || !id) return <Navigate to="/" replace />;

  const capName = meta.name.startsWith('use') ? meta.name.slice(3) : meta.name;
  const supported = caps.has(capName);

  const demo = getDemoById(id);
  const apiData = API_DATA[id] ?? [];
  const apiMethods = API_METHODS[id] ?? [];

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>{meta.name}</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>{meta.description}</p>

      {!supported && (
        <div style={{
          padding: 16, marginBottom: 16, background: '#fff7e6',
          border: '1px solid #ffd591', borderRadius: 6, color: '#fa8c16',
          fontSize: 14,
        }}>
          ⚠️ 此组件在当前地图版本下不可用，请切换到支持的版本。
        </div>
      )}

      {supported && demo?.Component && (
        <>
          <h2 style={{ fontSize: 16, marginTop: 24, marginBottom: 12 }}>示例</h2>
          <BMapErrorBoundary
            fallback={<div style={{ padding: 40, textAlign: 'center', color: '#999', border: '1px solid #eee', borderRadius: 6 }}>地图渲染出错，请刷新页面重试</div>}
          >
            <div
              style={{
                border: '1px solid #eee',
                borderRadius: 6,
                overflow: 'hidden',
                height: 400,
              }}
            >
              <demo.Component />
            </div>
          </BMapErrorBoundary>
        </>
      )}

      {demo?.code && (
        <>
          <h2 style={{ fontSize: 16, marginTop: 24, marginBottom: 12 }}>代码</h2>
          <CodeBlock code={demo.code} />
        </>
      )}

      {!demo?.code && !demo?.Component && (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: '#999',
            border: '1px dashed #ddd',
            borderRadius: 6,
          }}
        >
          示例编写中…
        </div>
      )}

      {apiData.length > 0 && (
        <>
          <h2 style={{ fontSize: 16, marginTop: 24, marginBottom: 12 }}>API</h2>
          <ApiTable data={apiData} methods={apiMethods} />
        </>
      )}
    </div>
  );
}
