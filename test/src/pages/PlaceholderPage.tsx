import React from 'react';

export function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="test-page">
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 16 }}>
        {name} 测试页面 - 待实现
      </div>
    </div>
  );
}
