// BreezeLab – Pollution Simulation Page
// Core module: interactive canvas, parameter sliders, source editor, presets, and control bar.

import React, { useState } from 'react';
import { useSimulation } from '../state/simulationStore';
import { SimulationCanvas } from '../components/simulation/SimulationCanvas';
import { checkStability } from '../simulation/solver';
import { getDefaultScenarios } from '../state/persistence';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Save,
  Trash2,
  AlertTriangle,
  Sliders,
  Wind,
  PlusCircle,
  Layers,
  Info,
} from 'lucide-react';

export const SimulationPage: React.FC = () => {
  const {
    state,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    stepSimulationOnce,
    updateParams,
    updateWind,
    addSource,
    updateSource,
    removeSource,
    clearSources,
    saveCurrentScenario,
  } = useSimulation();

  const [saveName, setSaveName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const stability = checkStability(state.params);
  const presets = getDefaultScenarios();

  const handleWindSpeedChange = (val: number) => {
    updateWind(val, state.params.wind.directionDeg);
  };

  const handleWindDirChange = (val: number) => {
    updateWind(state.params.wind.speed, val);
  };

  const handleSaveScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveName.trim()) {
      saveCurrentScenario(saveName.trim());
      setSaveName('');
      setShowSaveModal(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[750px]">
      {/* Center Main Stage: Canvas + Bottom Control Dock */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Canvas Card */}
        <div className="flex-1 min-h-[500px]">
          <SimulationCanvas interactive={true} />
        </div>

        {/* Bottom Playback Control Dock */}
        <div className="bg-[#FFFFFF] p-3.5 rounded-lg border border-[#D8E0DA] shadow-xs flex flex-wrap items-center justify-between gap-3">
          {/* Main Controls */}
          <div className="flex items-center gap-2">
            {state.isRunning ? (
              <button
                onClick={pauseSimulation}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#123B36] hover:bg-[#0F2D29] text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={startSimulation}
                disabled={state.isComplete}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#16877A] hover:bg-[#126F64] disabled:opacity-50 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{state.t > 0 ? 'Resume' : 'Run Simulation'}</span>
              </button>
            )}

            <button
              onClick={stepSimulationOnce}
              disabled={state.isRunning || state.isComplete}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#EDF1ED] hover:bg-[#D8E0DA] disabled:opacity-50 text-[#172521] rounded-md text-xs font-medium transition-colors"
              title="Advance exactly one time-step dt"
            >
              <StepForward className="w-4 h-4" />
              <span>Step (+{state.params.dt}s)</span>
            </button>

            <button
              onClick={resetSimulation}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#EDF1ED] hover:bg-[#D8E0DA] text-[#52635D] rounded-md text-xs font-medium transition-colors"
              title="Reset concentration field to zero"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>

          {/* Quick Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#52635D] font-medium hidden sm:inline">Preset:</span>
            <select
              onChange={(e) => {
                const found = presets.find((p) => p.id === e.target.value);
                if (found) {
                  updateParams(found.params);
                  resetSimulation();
                }
              }}
              className="text-xs bg-[#F5F7F4] border border-[#D8E0DA] rounded-md px-2.5 py-1.5 text-[#172521] focus:ring-1 focus:ring-[#16877A]"
            >
              <option value="">Load Preset Scenario...</option>
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#E1F2ED] hover:bg-[#B9C8BF]/40 text-[#123B36] rounded-md text-xs font-medium border border-[#B9C8BF] transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-[#16877A]" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Control & Parameter Inspector Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto max-h-[820px]">
        {/* Physical Parameters Form */}
        <div className="bg-[#FFFFFF] p-4 rounded-lg border border-[#D8E0DA] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#D8E0DA]">
            <Sliders className="w-4 h-4 text-[#16877A]" />
            <h3 className="text-sm font-semibold text-[#172521]">Environmental Parameters</h3>
          </div>

          {/* Wind Speed */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#52635D]">Wind Speed (|u|)</span>
              <span className="font-mono font-medium text-[#172521]">
                {state.params.wind.speed.toFixed(2)} m/s
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={state.params.wind.speed}
              onChange={(e) => handleWindSpeedChange(parseFloat(e.target.value))}
              className="w-full accent-[#16877A]"
            />
          </div>

          {/* Wind Direction */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#52635D]">Wind Direction (θ)</span>
              <span className="font-mono font-medium text-[#172521]">
                {state.params.wind.directionDeg.toFixed(0)}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="5"
              value={state.params.wind.directionDeg}
              onChange={(e) => handleWindDirChange(parseFloat(e.target.value))}
              className="w-full accent-[#16877A]"
            />
            <div className="flex justify-between text-[10px] text-[#687872]">
              <span>East (0°)</span>
              <span>North (90°)</span>
              <span>West (180°)</span>
              <span>South (270°)</span>
            </div>
          </div>

          {/* Diffusion Coefficient */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#52635D]">Diffusion Coeff (D)</span>
              <span className="font-mono font-medium text-[#172521]">
                {state.params.diffusion.toFixed(2)} m²/s
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.05"
              value={state.params.diffusion}
              onChange={(e) => updateParams({ diffusion: parseFloat(e.target.value) })}
              className="w-full accent-[#16877A]"
            />
          </div>

          {/* Time Step dt */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#52635D]">Time Step (dt)</span>
              <span className="font-mono font-medium text-[#172521]">
                {state.params.dt.toFixed(3)} s
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.5"
              step="0.01"
              value={state.params.dt}
              onChange={(e) => updateParams({ dt: parseFloat(e.target.value) })}
              className="w-full accent-[#16877A]"
            />
          </div>

          {/* Stability Indicator Card */}
          <div
            className={`p-2.5 rounded-md text-xs border ${
              stability.stable
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <Info className="w-3.5 h-3.5" />
              <span>
                {stability.stable ? 'Numerical Scheme Stable' : 'Auto-Substepping Active'}
              </span>
            </div>
            <div className="text-[11px] mt-0.5">
              ν = {stability.combinedNumber.toFixed(3)} (Max safe dt: {stability.maxSafeDt.toFixed(4)}s)
            </div>
          </div>
        </div>

        {/* Emission Sources Manager */}
        <div className="bg-[#FFFFFF] p-4 rounded-lg border border-[#D8E0DA] shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8E0DA]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8A63B8]" />
              <h3 className="text-sm font-semibold text-[#172521]">Pollutant Sources</h3>
            </div>
            <button
              onClick={() => {
                const { nx, ny } = state.params.grid;
                addSource(Math.floor(nx / 2), Math.floor(ny / 2), 30, `Stack ${state.params.sources.length + 1}`);
              }}
              className="text-xs text-[#16877A] hover:underline flex items-center gap-1 font-medium"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {state.params.sources.length === 0 ? (
              <div className="text-center py-4 text-xs text-[#687872]">
                No sources added. Click "Add" or Shift-Click the canvas.
              </div>
            ) : (
              state.params.sources.map((src) => (
                <div
                  key={src.id}
                  className="p-2.5 bg-[#F5F7F4] border border-[#D8E0DA] rounded text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#172521]">{src.label}</span>
                    <button
                      onClick={() => removeSource(src.id)}
                      className="text-[#D75A4A] hover:text-red-700 p-0.5"
                      title="Delete Source"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#52635D]">Pos (col, row):</span>
                      <div className="font-mono">
                        ({src.x.toFixed(0)}, {src.y.toFixed(0)})
                      </div>
                    </div>
                    <div>
                      <span className="text-[#52635D]">Rate (units/s):</span>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={src.rate}
                        onChange={(e) =>
                          updateSource(src.id, { rate: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full bg-[#FFFFFF] border border-[#D8E0DA] rounded px-1.5 py-0.5 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {state.params.sources.length > 0 && (
            <button
              onClick={clearSources}
              className="w-full text-center text-xs text-[#D75A4A] hover:underline pt-1"
            >
              Clear All Sources
            </button>
          )}
        </div>
      </div>

      {/* Save Scenario Modal Dialog */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] border border-[#D8E0DA] rounded-lg p-5 max-w-sm w-full shadow-lg">
            <h3 className="text-base font-semibold text-[#172521] mb-2">Save Simulation Scenario</h3>
            <p className="text-xs text-[#52635D] mb-4">
              Enter a name for this configuration to save it in LocalStorage for later retrieval.
            </p>
            <form onSubmit={handleSaveScenario} className="space-y-4">
              <input
                type="text"
                required
                placeholder="e.g., Heavy Industrial Dispersion"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="w-full text-xs p-2.5 border border-[#D8E0DA] rounded-md focus:ring-1 focus:ring-[#16877A]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-3 py-1.5 text-xs text-[#52635D] hover:bg-[#EDF1ED] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-[#16877A] text-white rounded font-semibold hover:bg-[#126F64]"
                >
                  Save Scenario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
