// BreezeLab – Saved Scenarios Page
// Manage saved scenario models: load, duplicate, rename, delete, and inspect configurations.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../state/simulationStore';
import {
  loadSavedScenarios,
  deleteScenario,
  duplicateScenario,
  saveScenarios,
} from '../state/persistence';
import type { SavedScenario } from '../simulation/simulationTypes';
import {
  BookmarkCheck,
  Play,
  Copy,
  Trash2,
  Calendar,
  Wind,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const ScenariosPage: React.FC = () => {
  const navigate = useNavigate();
  const { loadScenarioById, resetSimulation } = useSimulation();
  const [scenarios, setScenarios] = useState<SavedScenario[]>(loadSavedScenarios());

  const handleLoad = (id: string) => {
    loadScenarioById(id);
    resetSimulation();
    navigate('/simulation');
  };

  const handleDuplicate = (id: string) => {
    const updated = duplicateScenario(id);
    setScenarios(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this saved scenario?')) {
      const updated = deleteScenario(id);
      setScenarios(updated);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#D8E0DA] shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#172521] tracking-tight">Saved Scenarios Library</h1>
          <p className="text-xs text-[#52635D] mt-0.5">
            Persisted simulation parameters, wind regimes, and source configurations stored in local browser storage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 bg-[#E1F2ED] text-[#123B36] font-semibold rounded-md border border-[#B9C8BF]">
            {scenarios.length} Scenarios Available
          </span>
        </div>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scen) => (
          <div
            key={scen.id}
            className="bg-[#FFFFFF] border border-[#D8E0DA] rounded-lg p-4 shadow-xs flex flex-col justify-between hover:border-[#16877A] transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold text-[#172521] leading-snug">{scen.name}</h3>
                <span className="text-[10px] text-[#687872] flex items-center gap-1 shrink-0">
                  <Calendar className="w-3 h-3" />
                  {new Date(scen.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Parameter Metrics */}
              <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-[#F5F7F4] rounded border border-[#D8E0DA] text-xs">
                <div>
                  <span className="text-[#687872] block text-[10px]">Wind Velocity</span>
                  <span className="font-mono font-medium text-[#172521]">
                    {scen.params.wind.speed.toFixed(1)} m/s @ {scen.params.wind.directionDeg.toFixed(0)}°
                  </span>
                </div>
                <div>
                  <span className="text-[#687872] block text-[10px]">Diffusion D</span>
                  <span className="font-mono font-medium text-[#172521]">
                    {scen.params.diffusion.toFixed(2)} m²/s
                  </span>
                </div>
                <div>
                  <span className="text-[#687872] block text-[10px]">Sources</span>
                  <span className="font-mono font-medium text-[#172521]">
                    {scen.params.sources.length} active
                  </span>
                </div>
                <div>
                  <span className="text-[#687872] block text-[10px]">Grid Resolution</span>
                  <span className="font-mono font-medium text-[#172521]">
                    {scen.params.grid.nx} × {scen.params.grid.ny}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#D8E0DA]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDuplicate(scen.id)}
                  className="p-1.5 text-[#52635D] hover:text-[#172521] hover:bg-[#EDF1ED] rounded transition-colors"
                  title="Duplicate Scenario"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(scen.id)}
                  className="p-1.5 text-[#D75A4A] hover:bg-red-50 rounded transition-colors"
                  title="Delete Scenario"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => handleLoad(scen.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16877A] hover:bg-[#126F64] text-white rounded text-xs font-semibold shadow-xs transition-colors"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Load in Simulator</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
