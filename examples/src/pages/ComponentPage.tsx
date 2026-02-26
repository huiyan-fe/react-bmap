import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { CodeBlock } from '../components/CodeBlock';
import { ApiTable } from '../components/ApiTable';
import { zodSchemaToApiTable } from '../utils/zodSchemaToApiTable';
import { COMPONENTS } from '../config/components';
import { getDemoById } from '../demos';
import { schemaMap } from '../demos/schemaMap';

export function ComponentPage() {
  const { id } = useParams<{ id: string }>();
  const meta = COMPONENTS.find((c) => c.id === id);
  if (!meta || !id) return <Navigate to="/" replace />;

  const demo = getDemoById(id);
  const schema = demo?.schema ?? schemaMap[id];
  const apiData = schema ? zodSchemaToApiTable(schema) : [];

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>{meta.name}</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>{meta.description}</p>

      {demo && (
        <>
          <h2 style={{ fontSize: 16, marginTop: 24, marginBottom: 12 }}>示例</h2>
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

          <h2 style={{ fontSize: 16, marginTop: 24, marginBottom: 12 }}>代码</h2>
          <CodeBlock code={demo.code} />
        </>
      )}

      {apiData.length > 0 && (
        <>
          <h2 style={{ fontSize: 16, marginTop: 24, marginBottom: 12 }}>API</h2>
          <ApiTable data={apiData} />
        </>
      )}
    </div>
  );
}
