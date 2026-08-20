import React from 'react';
import { Outlet } from 'react-router-dom';
import { MapModeProvider } from '../context/MapModeContext';
import { Sidebar } from './Sidebar';

export function ExampleLayout() {
  return (
    <MapModeProvider>
      <div className="app-layout">
        <div className="app-body">
          <Sidebar />
          <main className="app-main">
            <Outlet />
          </main>
        </div>
      </div>
    </MapModeProvider>
  );
}
