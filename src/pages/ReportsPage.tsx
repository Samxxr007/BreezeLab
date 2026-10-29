// BreezeLab – Reports, Charts & Export Page
// Real computed time-series visualization, CSV generation, printable PDF/HTML report, and scenario comparison.

import React, { useState } from 'react';
import { useSimulation } from '../state/simulationStore';
import { loadSavedScenarios } from '../state/persistence';
import { idx } from '../simulation/grid';
import {
  Download,
  Printer,
  BarChart3,
  GitCompare,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { state } = useSimulation();
  const scenarios = loadSavedScenarios();

  const [compareScenarioId, setCompareScenarioId] = useState<string>(
    scenarios.length > 0 ? scenarios[0].id : ''
  );
  const compareScenario = scenarios.find((s) => s.id === compareScenarioId);

  // Generate and Download CSV Export
  const handleExportCSV = () => {
    const { params, C, t } = state;
    const { nx, ny, dx, dy } = params.grid;

    const lines: string[] = [
      '# BreezeLab Simulation Numerical Data Export',
      `# Export Timestamp,${new Date().toISOString()}`,
      `# Simulation Time (s),${t.toFixed(2)}`,
      `# Wind Speed (m/s),${params.wind.speed.toFixed(3)}`,
      `# Wind Direction (deg),${params.wind.directionDeg.toFixed(1)}`,
      `# Diffusion Coefficient D (m2/s),${params.diffusion}`,
      `# Grid Dimensions,${nx}x${ny}`,
      `# Cell Spacing dx dy (m),${dx},${dy}`,
      `# Active Sources Count,${params.sources.length}`,
      'col,row,x_coord_m,y_coord_m,concentration_model_units',
    ];

    for (let r = 0; r < ny; r++) {
      for (let c = 0; c < nx; c++) {
        const val = C[idx(c, r, nx)];
        lines.push(`${c},${r},${(c * dx).toFixed(2)},${(r * dy).toFixed(2)},${val.toFixed(5)}`);
      }
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `breezelab_export_t${t.toFixed(0)}s.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger browser print for formatted report
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Export Actions */}
      <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#D8E0DA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#172521] tracking-tight">
            Visualization & Report Workstation
          </h1>
          <p className="text-xs text-[#52635D] mt-0.5">
            Temporal charts, comparative scenario metrics, and structured scientific data exports.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#EDF1ED] hover:bg-[#D8E0DA] text-[#123B36] rounded-md text-xs font-semibold border border-[#D8E0DA] transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#16877A]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#16877A] hover:bg-[#126F64] text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Charts: Integrated Mass & Peak Concentration over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#D8E0DA] shadow-xs space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-[#172521]">Integrated Mass vs. Time M(t)</h3>
            <p className="text-xs text-[#52635D]">Area integral ∬ C(x,y,t) dA reflecting net domain accumulation</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={state.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E9E4" />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} stroke="#52635D" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} stroke="#52635D" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#123B36',
                    borderColor: '#16877A',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="totalMass"
                  name="Integrated Mass"
                  stroke="#E9A23B"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#D8E0DA] shadow-xs space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-[#172521]">Peak & Average Concentration vs. Time</h3>
            <p className="text-xs text-[#52635D]">Maximum single-cell value and domain-wide spatial average</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={state.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E9E4" />
                <XAxis dataKey="t" tick={{ fontSize: 10 }} stroke="#52635D" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} stroke="#52635D" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#123B36',
                    borderColor: '#16877A',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="maxConc"
                  name="Peak Conc"
                  stroke="#D75A4A"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="avgConc"
                  name="Average Conc"
                  stroke="#16877A"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Scenario Comparison Workstation */}
      <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#D8E0DA] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D8E0DA]">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-[#16877A]" />
            <h3 className="text-sm font-semibold text-[#172521]">Side-by-Side Scenario Comparison</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#52635D]">Compare with:</span>
            <select
              value={compareScenarioId}
              onChange={(e) => setCompareScenarioId(e.target.value)}
              className="text-xs bg-[#F5F7F4] border border-[#D8E0DA] rounded-md px-2.5 py-1 text-[#172521]"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {compareScenario ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Active Simulation */}
            <div className="p-4 bg-[#F5F7F4] border border-[#D8E0DA] rounded-lg space-y-2.5">
              <span className="text-xs font-bold text-[#123B36] uppercase tracking-wider block">
                Active Simulation (Current Run)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#687872] block text-[11px]">Wind Velocity</span>
                  <span className="font-mono font-medium">
                    {state.params.wind.speed.toFixed(2)} m/s @ {state.params.wind.directionDeg.toFixed(0)}°
                  </span>
                </div>
                <div>
                  <span className="text-[#687872] block text-[11px]">Diffusion Coeff D</span>
                  <span className="font-mono font-medium">{state.params.diffusion.toFixed(2)} m²/s</span>
                </div>
                <div>
                  <span className="text-[#687872] block text-[11px]">Sources</span>
                  <span className="font-mono font-medium">{state.params.sources.length} emitters</span>
                </div>
                <div>
                  <span className="text-[#687872] block text-[11px]">Grid Cells</span>
                  <span className="font-mono font-medium">{state.params.grid.nx} × {state.params.grid.ny}</span>
                </div>
              </div>
            </div>

            {/* Compared Scenario */}
            <div className="p-4 bg-[#F5F7F4] border border-[#D8E0DA] rounded-lg space-y-2.5">
              <span className="text-xs font-bold text-[#16877A] uppercase tracking-wider block">
                {compareScenario.name}
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#687872] block text-[11px]">Wind Velocity</span>
                  <span className="font-mono font-medium">
                    {compareScenario.params.wind.speed.toFixed(2)} m/s @ {compareScenario.params.wind.directionDeg.toFixed(0)}°
                  </span>
                </div>
                <div>
                  <span className="text-[#687872] block text-[11px]">Diffusion Coeff D</span>
                  <span className="font-mono font-medium">{compareScenario.params.diffusion.toFixed(2)} m²/s</span>
                </div>
                <div>
                  <span className="text-[#687872] block text-[11px]">Sources</span>
                  <span className="font-mono font-medium">{compareScenario.params.sources.length} emitters</span>
                </div>
                <div>
                  <span className="text-[#687872] block text-[11px]">Peak Recorded Conc</span>
                  <span className="font-mono font-medium text-[#D75A4A]">{compareScenario.peakConc.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-[#687872]">
            Select a saved scenario from your library to compare against the active simulation.
          </div>
        )}
      </div>
    </div>
  );
};
