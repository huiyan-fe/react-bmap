import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { COMPONENTS, CATEGORIES } from '../config/components';

export function Sidebar() {
  const { id } = useParams();

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        borderRight: '1px solid #eee',
        padding: '16px 0',
        background: '#fafafa',
      }}
    >
      <div style={{ padding: '0 16px 12px', fontSize: 14, color: '#888' }}>
        组件
      </div>
      {CATEGORIES.map((cat) => {
        const items = COMPONENTS.filter((c) => c.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat} style={{ marginBottom: 8 }}>
            <div
              style={{
                padding: '8px 16px',
                fontSize: 12,
                color: '#888',
                textTransform: 'uppercase',
              }}
            >
              {cat}
            </div>
            {items.map((c) => (
              <Link
                key={c.id}
                to={`/component/${c.id}`}
                style={{
                  display: 'block',
                  padding: '8px 16px 8px 24px',
                  fontSize: 14,
                  color: id === c.id ? '#1890ff' : '#333',
                  textDecoration: 'none',
                  background: id === c.id ? '#e6f7ff' : 'transparent',
                }}
              >
                {c.name}
              </Link>
            ))}
          </div>
        );
      })}
    </aside>
  );
}
