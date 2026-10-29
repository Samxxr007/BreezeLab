// BreezeLab – Settings & Automated Validation Tests Page
// Configuration preferences and execution of the 8 mandatory mathematical validation tests.

import React, { useState } from 'react';
import { runAllTests, type TestResult } from '../mathematics/numericalValidation';
import { useSimulation } from '../state/simulationStore';
import {
  Settings,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sliders,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { state, updateParams, resetSimulation } = useSimulation();
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const handleRunValidation = async () => {
    setIsRunningTests(true);
    try {
      const results = await runAllTests();
      setTestResults(results);
    } catch (err) {
      console.error('Validation test run failed:', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleGridResolutionChange = (newNx: number) => {
    updateParams({
      grid: {
        ...state.params.grid,
        nx: newNx,
        ny: newNx,
        width: newNx * state.params.grid.dx,
        height: newNx * state.params.grid.dy,
      },
    });
    resetSimulation();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#D8E0DA] shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#172521] tracking-tight">Settings & Validation</h1>
          <p className="text-xs text-[#52635D] mt-0.5">
            Simulator numerical parameters, grid discretization, and automated validation tests.
          </p>
        </div>
      </div>

      {/* Grid Configuration Card */}
      <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#D8E0DA] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#D8E0DA]">
          <Sliders className="w-4 h-4 text-[#16877A]" />
          <h2 className="text-base font-bold text-[#172521]">Grid & Computational Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[#52635D] font-medium">Grid Resolution (nx × ny)</span>
              <span className="font-mono font-bold text-[#172521]">
                {state.params.grid.nx} × {state.params.grid.ny} cells
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              step="10"
              value={state.params.grid.nx}
              onChange={(e) => handleGridResolutionChange(parseInt(e.target.value))}
              className="w-full accent-[#16877A]"
            />
            <p className="text-[11px] text-[#687872]">
              Higher resolutions produce smoother concentration gradients at the cost of additional CPU steps.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[#52635D] font-medium">Animation Speed Multiplier</span>
              <span className="font-mono font-bold text-[#172521]">
                {state.params.animationSpeed} steps/frame
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={state.params.animationSpeed}
              onChange={(e) => updateParams({ animationSpeed: parseInt(e.target.value) })}
              className="w-full accent-[#16877A]"
            />
            <p className="text-[11px] text-[#687872]">
              Number of numerical integration steps executed per display redraw.
            </p>
          </div>
        </div>
      </div>

      {/* Validation Test Suite Section */}
      <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#D8E0DA] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D8E0DA]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#16877A]" />
            <div>
              <h2 className="text-base font-bold text-[#172521]">Automated Mathematical Validation Suite</h2>
              <p className="text-xs text-[#52635D]">Runs 8 real numerical tests against the live solver engine</p>
            </div>
          </div>

          <button
            onClick={handleRunValidation}
            disabled={isRunningTests}
            className="flex items-center gap-2 px-4 py-2 bg-[#16877A] hover:bg-[#126F64] disabled:opacity-50 text-white rounded-md text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunningTests ? 'Executing Tests...' : 'Run All 8 Tests'}</span>
          </button>
        </div>

        {/* Test Results Display */}
        {testResults ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {testResults.filter((t) => t.passed).length} / {testResults.length} Passed
              </span>
            </div>

            <div className="divide-y divide-[#D8E0DA] border border-[#D8E0DA] rounded-lg overflow-hidden text-xs">
              {testResults.map((t) => (
                <div key={t.id} className="p-3.5 bg-[#FFFFFF] hover:bg-[#F5F7F4] transition-colors space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {t.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span className="font-semibold text-[#172521]">{t.id}: {t.name}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {t.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-[#687872]">Expected: </span>
                      <span className="font-mono text-[#52635D]">{t.expected}</span>
                    </div>
                    <div>
                      <span className="text-[#687872]">Actual: </span>
                      <span className="font-mono text-[#172521]">{t.actual}</span>
                    </div>
                  </div>

                  {t.details && (
                    <p className="text-[10px] text-[#687872] italic pt-0.5">{t.details}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-[#52635D] border border-dashed border-[#D8E0DA] rounded-lg">
            <p>Click "Run All 8 Tests" to verify numerical gradient, divergence, curl, advection transport, stability limits, and mass conservation.</p>
          </div>
        )}
      </div>
    </div>
  );
};
