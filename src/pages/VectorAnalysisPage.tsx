// BreezeLab – Vector Calculus Analysis Page
// Academic core: interactive inspection of Gradient ∇C, Divergence ∇·u, Curl (∇×u)_z,
// and Double Integration ∬ C dA, with real mathematical computations and explanations.

import React, { useState } from 'react';
import { useSimulation } from '../state/simulationStore';
import { computeGradient, getGradientAt } from '../mathematics/gradient';
import { computeDivergence } from '../mathematics/divergence';
import { computeCurl } from '../mathematics/curl';
import { integrateConcentration } from '../mathematics/integration';
import { Binary, Compass, RotateCcw, Sigma, Info, Crosshair } from 'lucide-react';

export const VectorAnalysisPage: React.FC = () => {
  const { state } = useSimulation();
  const [activeTab, setActiveTab] = useState<'gradient' | 'divergence' | 'curl' | 'integration'>('gradient');

  const { nx, ny, dx, dy } = state.params.grid;
  const { ux, uy, directionDeg } = state.params.wind;

  // Real Mathematical Computations
  const gradientField = computeGradient(state.C, nx, ny, dx, dy);
  const divergenceField = computeDivergence(ux, uy, nx, ny, dx, dy);
  const curlField = computeCurl(ux, uy, nx, ny, dx, dy);
  const integrationSummary = integrateConcentration(state.C, nx, ny, dx, dy);

  // Inspector point data
  const inspectCol = state.selectedPoint?.col ?? Math.floor(nx / 2);
  const inspectRow = state.selectedPoint?.row ?? Math.floor(ny / 2);
  const ptGrad = getGradientAt(gradientField, inspectCol, inspectRow, nx);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Module Title Banner */}
      <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#D8E0DA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E1F2ED] text-[#123B36] uppercase tracking-wider">
              Course Outcome 1
            </span>
            <span className="text-xs text-[#52635D]">Applied Mathematics Capstone</span>
          </div>
          <h1 className="text-xl font-bold text-[#172521] tracking-tight mt-1">
            Vector Calculus Field Analysis
          </h1>
          <p className="text-xs text-[#52635D] mt-0.5">
            Diagnostic calculations derived directly from the numerical concentration matrix and velocity vectors.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#EDF1ED] p-1 rounded-lg border border-[#D8E0DA] shrink-0">
          <button
            onClick={() => setActiveTab('gradient')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'gradient'
                ? 'bg-[#16877A] text-white shadow-xs'
                : 'text-[#52635D] hover:text-[#172521]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Gradient (∇C)</span>
          </button>

          <button
            onClick={() => setActiveTab('divergence')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'divergence'
                ? 'bg-[#16877A] text-white shadow-xs'
                : 'text-[#52635D] hover:text-[#172521]'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Divergence (∇·u)</span>
          </button>

          <button
            onClick={() => setActiveTab('curl')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'curl'
                ? 'bg-[#16877A] text-white shadow-xs'
                : 'text-[#52635D] hover:text-[#172521]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Curl (∇×u)</span>
          </button>

          <button
            onClick={() => setActiveTab('integration')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'integration'
                ? 'bg-[#16877A] text-white shadow-xs'
                : 'text-[#52635D] hover:text-[#172521]'
            }`}
          >
            <Sigma className="w-3.5 h-3.5" />
            <span>Double Integral (∬)</span>
          </button>
        </div>
      </div>

      {/* Main Analysis Display Cards */}
      {activeTab === 'gradient' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Explanation & Mathematical Formula */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#FFFFFF] p-5 rounded-lg border border-[#D8E0DA] shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#172521] flex items-center gap-2">
                <span>Concentration Gradient ∇C</span>
              </h2>

              <div className="p-3 bg-[#F5F7F4] border border-[#D8E0DA] rounded-md font-mono text-sm text-[#123B36] text-center">
                ∇C(x, y) = ( ∂C/∂x , ∂C/∂y )   [µg / m³]
              </div>

              <div className="text-xs text-[#52635D] leading-relaxed space-y-2">
                <p>
                  <strong>Physical Meaning:</strong> The gradient vector field points in the direction of greatest local increase in pollutant concentration density. Its magnitude represents the steepness of the concentration plume front.
                </p>
                <p>
                  <strong>Numerical Discretization:</strong> Computed via 2nd-order central finite differences in the grid interior:
                </p>
                <div className="p-2 bg-[#EDF1ED] rounded font-mono text-[11px] text-[#172521]">
                  ∂C/∂x ≈ [C(i+1, j) − C(i-1, j)] / (2 · Δx) <br />
                  ∂C/∂y ≈ [C(i, j+1) − C(i, j-1)] / (2 · Δy)
                </div>
              </div>

              {/* Grid Inspector for Selected Point */}
              <div className="mt-4 pt-4 border-t border-[#D8E0DA] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#172521] flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-[#16877A]" />
                    Local Point Inspector: ({inspectCol}, {inspectRow})
                  </span>
                  <span className="text-[11px] text-[#687872]">
                    Coord: {(inspectCol * dx).toFixed(1)}m, {(inspectRow * dy).toFixed(1)}m
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-[#F5F7F4] rounded border border-[#D8E0DA]">
                    <span className="text-[#687872] block text-[10px]">∂C/∂x</span>
                    <span className="font-mono font-bold text-[#172521]">{ptGrad.gx.toFixed(4)} µg/m³</span>
                  </div>
                  <div className="p-2 bg-[#F5F7F4] rounded border border-[#D8E0DA]">
                    <span className="text-[#687872] block text-[10px]">∂C/∂y</span>
                    <span className="font-mono font-bold text-[#172521]">{ptGrad.gy.toFixed(4)} µg/m³</span>
                  </div>
                  <div className="p-2 bg-[#F5F7F4] rounded border border-[#D8E0DA]">
                    <span className="text-[#687872] block text-[10px]">|∇C| Magnitude</span>
                    <span className="font-mono font-bold text-[#16877A]">{ptGrad.magnitude.toFixed(4)} µg/m³</span>
                  </div>
                  <div className="p-2 bg-[#F5F7F4] rounded border border-[#D8E0DA]">
                    <span className="text-[#687872] block text-[10px]">Direction Angle</span>
                    <span className="font-mono font-bold text-[#172521]">{ptGrad.directionDeg.toFixed(1)}°</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostics Summary Card */}
          <div className="lg:col-span-5 bg-[#FFFFFF] p-5 rounded-lg border border-[#D8E0DA] shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-[#172521]">Domain Gradient Statistics</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[#D8E0DA] text-xs">
                <span className="text-[#52635D]">Peak Gradient Magnitude</span>
                <span className="font-mono font-bold text-[#172521]">
                  {Math.max(...Array.from(gradientField.magnitude.slice(0, 5000))).toFixed(4)} µg/m³
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#D8E0DA] text-xs">
                <span className="text-[#52635D]">Spatial Resolution (Δx, Δy)</span>
                <span className="font-mono text-[#172521]">{dx.toFixed(1)}m × {dy.toFixed(1)}m</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#D8E0DA] text-xs">
                <span className="text-[#52635D]">Dominant Plume Front Heading</span>
                <span className="font-mono text-[#172521]">{directionDeg.toFixed(0)}°</span>
              </div>
            </div>

            <div className="p-3 bg-[#E1F2ED] border border-[#B9C8BF] rounded-md text-xs text-[#123B36] space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#16877A]" />
                <span>Interpretation:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Advection drives the concentration gradient downstream, compressing isoconcentration contours along the leading plume edge where diffusion has not yet smoothed the transition.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'divergence' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[#FFFFFF] p-5 rounded-lg border border-[#D8E0DA] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#172521]">Wind Field Divergence (∇ · u)</h2>
            <div className="p-3 bg-[#F5F7F4] border border-[#D8E0DA] rounded-md font-mono text-sm text-[#123B36] text-center">
              div(u) = ∇ · u = ∂ux/∂x + ∂uy/∂y   [s⁻¹]
            </div>

            <div className="text-xs text-[#52635D] leading-relaxed space-y-2">
              <p>
                <strong>Mathematical Formulation:</strong> Divergence measures the net flux of the velocity field entering or exiting an infinitesimal volume around a point.
              </p>
              <p>
                <strong>Incompressibility Requirement:</strong> For incompressible 2-D atmospheric flows, ∇ · u = 0. In our uniform prescribed velocity field (ux={ux.toFixed(2)}, uy={uy.toFixed(2)}):
              </p>
              <div className="p-2.5 bg-[#EDF1ED] rounded font-mono text-xs text-[#172521]">
                ∂ux/∂x = 0.0000 s⁻¹ <br />
                ∂uy/∂y = 0.0000 s⁻¹ <br />
                div(u) = 0.0000 s⁻¹ everywhere
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#FFFFFF] p-5 rounded-lg border border-[#D8E0DA] shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-[#172521]">Divergence Diagnostics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[#D8E0DA] text-xs">
                <span className="text-[#52635D]">Domain Min Divergence</span>
                <span className="font-mono font-bold text-[#16877A]">{divergenceField.min.toFixed(6)} s⁻¹</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#D8E0DA] text-xs">
                <span className="text-[#52635D]">Domain Max Divergence</span>
                <span className="font-mono font-bold text-[#16877A]">{divergenceField.max.toFixed(6)} s⁻¹</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#D8E0DA] text-xs">
                <span className="text-[#52635D]">Flow Classification</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Incompressible (div ≈ 0)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'curl' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[#FFFFFF] p-5 rounded-lg border border-[#D8E0DA] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#172521]">Wind Field Curl (Vorticity ω_z)</h2>
            <div className="p-3 bg-[#F5F7F4] border border-[#D8E0DA] rounded-md font-mono text-sm text-[#123B36] text-center">
              (∇ × u)_z = ∂uy/∂x − ∂ux/∂y   [s⁻¹]
            </div>

            <div className="text-xs text-[#52635D] leading-relaxed space-y-2">
              <p>
                <strong>Mathematical Formulation:</strong> In two dimensions, the curl produces a scalar representing the out-of-plane vorticity vector perpendicular to the simulation plane.
              </p>
              <p>
                <strong>Physical Interpretation:</strong> Quantifies local fluid rotation. Positive values indicate counter-clockwise rotation (cyclonic shear); negative values indicate clockwise rotation (anticyclonic shear).
              </p>
              <div className="p-2.5 bg-[#EDF1ED] rounded font-mono text-xs text-[#172521]">
                (∇ × u)_z = 0.0000 s⁻¹ (strictly irrotational uniform flow)
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#FFFFFF] p-5 rounded-lg border border-[#D8E0DA] shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-[#172521]">Vorticity Diagnostics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[#D8E0DA] text-xs">
                <span className="text-[#52635D]">Min Vorticity (ω_z)</span>
                <span className="font-mono font-bold text-[#16877A]">{curlField.min.toFixed(6)} s⁻¹</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#D8E0DA] text-xs">
                <span className="text-[#52635D]">Max Vorticity (ω_z)</span>
                <span className="font-mono font-bold text-[#16877A]">{curlField.max.toFixed(6)} s⁻¹</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#D8E0DA] text-xs">
                <span className="text-[#52635D]">Kinematic Type</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Irrotational Flow
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'integration' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[#FFFFFF] p-5 rounded-lg border border-[#D8E0DA] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#172521]">2-D Domain Quadrature ∬ C(x,y,t) dA</h2>
            <div className="p-3 bg-[#F5F7F4] border border-[#D8E0DA] rounded-md font-mono text-sm text-[#123B36] text-center">
              M(t) = ∬_Ω C(x, y, t) dA ≈ ∑_(i,j) C(i, j) · Δx · Δy   [µg]
            </div>

            <div className="text-xs text-[#52635D] leading-relaxed space-y-2">
              <p>
                <strong>Mathematical Formulation:</strong> Discrete 2-D Riemann sum approximating the area-weighted concentration integral over the full domain Ω = [0, Lx] × [0, Ly].
              </p>
              <p>
                <strong>Conservation Law:</strong> In closed systems with no-flux boundaries and zero sources, dM/dt = 0. With ongoing emissions, mass accumulates according to total injected source terms (∑ S_k · Δt) minus advective outflow crossing the domain boundaries.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#FFFFFF] p-5 rounded-lg border border-[#D8E0DA] shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-[#172521]">Integration Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[#D8E0DA] text-xs">
                <span className="text-[#52635D]">Total Integrated Mass M(t)</span>
                <span className="font-mono font-bold text-[#172521]">
                  {integrationSummary.totalMass.toFixed(1)} µg
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#D8E0DA] text-xs">
                <span className="text-[#52635D]">Domain Average Concentration</span>
                <span className="font-mono font-bold text-[#16877A]">
                  {integrationSummary.averageConcentration.toFixed(3)} µg/m²
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#D8E0DA] text-xs">
                <span className="text-[#52635D]">Domain Area (Lx × Ly)</span>
                <span className="font-mono text-[#172521]">
                  {(nx * dx).toFixed(0)}m × {(ny * dy).toFixed(0)}m = {integrationSummary.domainArea.toFixed(0)} m²
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
