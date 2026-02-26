import React from 'react';
import type { ApiTableRow } from '../utils/zodSchemaToApiTable';

interface ApiTableProps {
  data: ApiTableRow[];
}

export function ApiTable({ data }: ApiTableProps) {
  if (!data?.length) return null;

  return (
    <div style={{ overflowX: 'auto', marginTop: 16 }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 14,
        }}
      >
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              属性
            </th>
            <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              类型
            </th>
            <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              必填
            </th>
            <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              说明
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{row.name}</td>
              <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12 }}>
                {row.type}
              </td>
              <td style={{ padding: '10px 12px' }}>{row.required ? '是' : '否'}</td>
              <td style={{ padding: '10px 12px', color: '#666' }}>{row.description || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
