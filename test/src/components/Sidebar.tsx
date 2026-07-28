import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES, PAGES } from '../config';

export function Sidebar() {
  const location = useLocation();
  const currentId = location.pathname.replace('/', '');

  return (
    <aside className="sidebar">
      <div className="sidebar-title">用例</div>
      {CATEGORIES.map((cat) => {
        const items = PAGES.filter((p) => p.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat} className="sidebar-group">
            <div className="sidebar-category">{cat}</div>
            {items.map((p) => (
              <Link
                key={p.id}
                to={`/${p.id}`}
                className={`sidebar-item ${currentId === p.id ? 'active' : ''} ${p.ready ? '' : 'pending'}`}
              >
                <span>{p.name}</span>
                {!p.ready && <span className="pending-tag">待</span>}
              </Link>
            ))}
          </div>
        );
      })}
    </aside>
  );
}
