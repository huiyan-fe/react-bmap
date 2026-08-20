import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ExampleLayout } from './layout/ExampleLayout';
import { HomePage } from './pages/HomePage';
import { ComponentPage } from './pages/ComponentPage';
import './demos/registerAll';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ExampleLayout />}>
          <Route index element={<HomePage />} />
          <Route path="component/:id" element={<ComponentPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
