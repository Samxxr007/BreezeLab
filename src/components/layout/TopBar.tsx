// BreezeLab – Header TopBar
// Shows current page breadcrumb, active simulation status badge, and quick actions.

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useSimulation } from '../../state/simulationStore';
import { Activity, Play, Pause, RotateCcw, HelpCircle, FileText } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Overview Dashboard',
  '/simulation': 'Pollution Dispersion Simulation',
  '/analysis': 'Vector Calculus Analysis Workspace',
  '/reports': 'Visualization & Report Generator',
  '/scenarios': 'Scenario Library & Comparisons',
  '/mathematics': 'Mathematical Reference & Syllabus',
  '/settings': 'Configuration & Validation Tests',
};

export const TopBar: React.FC = () => {
  const location = useLocation();
  const { state, startSimulation, pauseSimulation, resetSimulation } = useSimulation();

  const title = PAGE_TITLES[location.pathname] || 'BreezeLab Workspace';

  const getStatusBadge = () => {
    if (state.isRunning) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Running (t = {state.t.toFixed(1)}s)
        </span>
      );
    }
    if (state.isComplete) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-700 border border-sky-500/30">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          Completed ({state.t.toFixed(1)}s)
        </span>
      );
    }
    if (state.t > 0) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Paused (t = {state.t.toFixed(1)}s)
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-600 border border-slate-300">
        <span className="w-2 h-2 rounded-full bg-slate-400" />
        Idle
      </span>
    );
  };

  return (
    <header className="h-14 bg-[#FFFFFF] border-b border-[#D8E0DA] px-6 flex items-center justify-between shadow-xs">
      {/* Title & Status */}
      <div className="flex items-center gap-4">
        <h2 className="text-base font-semibold text-[#172521] tracking-tight">{title}</h2>
        {getStatusBadge()}
      </div>

      {/* Quick Playback Bar & Nav Action */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-[#EDF1ED] p-1 rounded-md border border-[#D8E0DA]">
          {state.isRunning ? (
            <button
              onClick={pauseSimulation}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-[#123B36] hover:bg-[#FFFFFF] transition-colors"
              title="Pause Simulation"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={startSimulation}
              disabled={state.isComplete}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-[#16877A] hover:bg-[#FFFFFF] disabled:opacity-40 transition-colors"
              title="Run Simulation"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run</span>
            </button>
          )}

          <button
            onClick={resetSimulation}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-[#52635D] hover:bg-[#FFFFFF] transition-colors"
            title="Reset Grid"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        <Link
          to="/mathematics"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#D8E0DA] text-xs font-medium text-[#52635D] hover:bg-[#F5F7F4] hover:text-[#172521] transition-colors"
          title="View Mathematical Reference"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#16877A]" />
          <span>Formulas</span>
        </Link>
      </div>
    </header>
  );
};
