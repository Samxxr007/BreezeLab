// BreezeLab – Main Application Entry & Routing
// Sets up React Router v7 routes and SimulationProvider.

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SimulationProvider } from './state/simulationStore';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewPage } from './pages/OverviewPage';
import { SimulationPage } from './pages/SimulationPage';
import { VectorAnalysisPage } from './pages/VectorAnalysisPage';
import { ReportsPage } from './pages/ReportsPage';
import { ScenariosPage } from './pages/ScenariosPage';
import { MathematicsPage } from './pages/MathematicsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <SimulationProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="simulation" element={<SimulationPage />} />
            <Route path="analysis" element={<VectorAnalysisPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="scenarios" element={<ScenariosPage />} />
            <Route path="mathematics" element={<MathematicsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SimulationProvider>
  );
}

export default App;
