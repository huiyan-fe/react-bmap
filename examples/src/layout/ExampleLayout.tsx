import React from 'react';
import { Outlet } from 'react-router-dom';
import { MapModeProvider } from '../context/MapModeContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function ExampleLayout() {
  return (
    <MapModeProvider>
      <div className="app-layout">
        <Header />
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
