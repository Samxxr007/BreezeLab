// BreezeLab – Overview Dashboard
// Displays live KPI cards, interactive spatial mini-canvas, concentration-time trend,
// recent scenarios, and quick navigation.

import React from 'react';
import { Link } from 'react-router-dom';
import { useSimulation } from '../state/simulationStore';
import { SimulationCanvas } from '../components/simulation/SimulationCanvas';
import { loadSavedScenarios } from '../state/persistence';
import {
  Wind,
  Layers,
  Activity,
  Maximize2,
  TrendingUp,
  Play,
  ArrowRight,
  Database,
  Binary,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const { state, startSimulation } = useSimulation();
  const scenarios = loadSavedScenarios();

  const latestHistory = state.history[state.history.length - 1] || {
    maxConc: 0,
    totalMass: 0,
    avgConc: 0,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Banner / Notice */}
      <div className="bg-[#E1F2ED] border border-[#B9C8BF] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#123B36] tracking-tight">
            BreezeLab Modelling Workstation
          </h1>
          <p className="text-xs text-[#52635D] mt-0.5">
            2-D Numerical Simulation of Advection–Diffusion Equation with Vector Calculus Field Diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/simulation"
            className="flex items-center gap-2 px-4 py-2 bg-[#16877A] hover:bg-[#126F64] text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Open Simulator</span>
          </Link>
          <Link
            to="/analysis"
            className="flex items-center gap-2 px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#F5F7F4] border border-[#D8E0DA] text-[#172521] rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <Binary className="w-3.5 h-3.5 text-[#16877A]" />
            <span>Vector Calculus</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-[#FFFFFF] p-3.5 rounded-lg border border-[#D8E0DA] shadow-xs">
          <div className="flex items-center justify-between text-[#687872] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Sim Time</span>
            <Activity className="w-3.5 h-3.5 text-[#16877A]" />
          </div>
          <div className="text-2xl font-bold text-[#172521] font-mono">{state.t.toFixed(1)} <span className="text-xs font-normal text-[#687872]">s</span></div>
          <div className="text-[10px] text-[#52635D] mt-1">Duration: {state.params.duration}s</div>
        </div>

        <div className="bg-[#FFFFFF] p-3.5 rounded-lg border border-[#D8E0DA] shadow-xs">
          <div className="flex items-center justify-between text-[#687872] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Wind Speed</span>
            <Wind className="w-3.5 h-3.5 text-[#2878B5]" />
          </div>
          <div className="text-2xl font-bold text-[#172521] font-mono">{state.params.wind.speed.toFixed(2)} <span className="text-xs font-normal text-[#687872]">m/s</span></div>
          <div className="text-[10px] text-[#52635D] mt-1">Dir: {state.params.wind.directionDeg.toFixed(0)}°</div>
        </div>

        <div className="bg-[#FFFFFF] p-3.5 rounded-lg border border-[#D8E0DA] shadow-xs">
          <div className="flex items-center justify-between text-[#687872] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Sources</span>
            <Layers className="w-3.5 h-3.5 text-[#8A63B8]" />
          </div>
          <div className="text-2xl font-bold text-[#172521] font-mono">{state.params.sources.length}</div>
          <div className="text-[10px] text-[#52635D] mt-1">Active emitters</div>
        </div>

        <div className="bg-[#FFFFFF] p-3.5 rounded-lg border border-[#D8E0DA] shadow-xs">
          <div className="flex items-center justify-between text-[#687872] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Peak Conc</span>
            <Maximize2 className="w-3.5 h-3.5 text-[#D75A4A]" />
          </div>
          <div className="text-2xl font-bold text-[#D75A4A] font-mono">{latestHistory.maxConc.toFixed(1)}</div>
          <div className="text-[10px] text-[#52635D] mt-1">µg / m²</div>
        </div>

        <div className="bg-[#FFFFFF] p-3.5 rounded-lg border border-[#D8E0DA] shadow-xs">
          <div className="flex items-center justify-between text-[#687872] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Integrated Mass</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#E9A23B]" />
          </div>
          <div className="text-2xl font-bold text-[#172521] font-mono">{latestHistory.totalMass.toFixed(0)}</div>
          <div className="text-[10px] text-[#52635D] mt-1">µg (∬ C dA)</div>
        </div>

        <div className="bg-[#FFFFFF] p-3.5 rounded-lg border border-[#D8E0DA] shadow-xs">
          <div className="flex items-center justify-between text-[#687872] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Saved Scenarios</span>
            <Database className="w-3.5 h-3.5 text-[#16877A]" />
          </div>
          <div className="text-2xl font-bold text-[#172521] font-mono">{scenarios.length}</div>
          <div className="text-[10px] text-[#52635D] mt-1">Local library</div>
        </div>
      </div>

      {/* Main Dual Workspaces: Mini Canvas & Time Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Simulation Heatmap Viewport */}
        <div className="lg:col-span-7 bg-[#FFFFFF] p-4 rounded-lg border border-[#D8E0DA] shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#172521]">Current Concentration Field</h3>
              <p className="text-xs text-[#52635D]">Spatial distribution computed by advection-diffusion solver (µg/m²)</p>
            </div>
            <Link
              to="/simulation"
              className="text-xs font-medium text-[#16877A] hover:underline flex items-center gap-1"
            >
              Full Interactive Controls <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 min-h-[380px] rounded-md overflow-hidden">
            <SimulationCanvas interactive={false} />
          </div>
        </div>

        {/* Time-Series Concentration Trend */}
        <div className="lg:col-span-5 bg-[#FFFFFF] p-4 rounded-lg border border-[#D8E0DA] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#172521]">Temporal Concentration Profile</h3>
                <p className="text-xs text-[#52635D]">Integrated domain mass (µg) & peak concentration (µg/m²) vs. time</p>
              </div>
              <Link
                to="/reports"
                className="text-xs font-medium text-[#16877A] hover:underline flex items-center gap-1"
              >
                Detailed Graphs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="h-64 w-full">
              {state.history.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={state.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E9E4" />
                    <XAxis dataKey="t" tick={{ fontSize: 10 }} stroke="#52635D" />
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
                      dataKey="maxConc"
                      name="Peak Conc (µg/m²)"
                      stroke="#D75A4A"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgConc"
                      name="Average Conc (µg/m²)"
                      stroke="#16877A"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#D8E0DA] rounded-lg">
                  <Activity className="w-8 h-8 text-[#B9C8BF] mb-2" />
                  <p className="text-xs text-[#52635D] font-medium">No simulation time-series generated yet</p>
                  <button
                    onClick={startSimulation}
                    className="mt-3 px-3 py-1.5 bg-[#16877A] text-white text-xs font-semibold rounded hover:bg-[#126F64] transition-colors"
                  >
                    Run Simulation
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Scenario Preset Launchers */}
          <div className="mt-4 pt-4 border-t border-[#D8E0DA]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#687872] block mb-2">
              Preset Scenarios
            </span>
            <div className="space-y-1.5">
              {scenarios.slice(0, 3).map((scen) => (
                <Link
                  key={scen.id}
                  to="/simulation"
                  className="flex items-center justify-between p-2 rounded bg-[#F5F7F4] hover:bg-[#E1F2ED] border border-[#D8E0DA] text-xs transition-colors"
                >
                  <span className="font-medium text-[#172521]">{scen.name}</span>
                  <span className="text-[10px] text-[#52635D]">
                    Wind: {scen.params.wind.speed}m/s | Sources: {scen.params.sources.length}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
