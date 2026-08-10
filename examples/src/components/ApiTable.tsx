import React from 'react';

export interface ApiProp {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface ApiMethod {
  name: string;
  params: string;
  description: string;
}

export function ApiTable({ data, methods }: { data: ApiProp[]; methods?: ApiMethod[] }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 16 }}>
      {data?.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 16 }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>属性</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>类型</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>必填</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>说明</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{row.name}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12 }}>{row.type}</td>
                <td style={{ padding: '10px 12px' }}>{row.required ? '是' : '否'}</td>
                <td style={{ padding: '10px 12px', color: '#666' }}>{row.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {methods?.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>方法</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>参数</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>说明</th>
            </tr>
          </thead>
          <tbody>
            {methods.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{row.name}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12 }}>{row.params}</td>
                <td style={{ padding: '10px 12px', color: '#666' }}>{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
