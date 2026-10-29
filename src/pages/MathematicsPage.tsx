// BreezeLab – Mathematical Reference & Syllabus Alignment Page
// Comprehensive educational theory, worked examples, symbols, and mathematical derivations.

import React from 'react';
import { BookOpen, Compass, Binary, RotateCcw, Sigma, ShieldAlert, Cpu } from 'lucide-react';

export const MathematicsPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="bg-[#FFFFFF] p-6 rounded-lg border border-[#D8E0DA] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#16877A] uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Curricular Documentation</span>
        </div>
        <h1 className="text-2xl font-bold text-[#172521] tracking-tight">
          Mathematical Theory & Numerical Foundation
        </h1>
        <p className="text-sm text-[#52635D] mt-1 leading-relaxed">
          Detailed mathematical formulation of the 2-D Advection–Diffusion Partial Differential Equation (PDE),
          finite-difference discretization schemes, and vector calculus diagnostic operators.
        </p>
      </div>

      {/* Section 1: The Governing PDE */}
      <section className="bg-[#FFFFFF] p-6 rounded-lg border border-[#D8E0DA] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#D8E0DA]">
          <Cpu className="w-5 h-5 text-[#16877A]" />
          <h2 className="text-lg font-bold text-[#172521]">1. The Advection–Diffusion Equation</h2>
        </div>

        <p className="text-xs text-[#52635D] leading-relaxed">
          The transport and dispersion of air pollutants in an Eulerian 2-D atmospheric boundary layer is governed by the conservation of mass for a scalar concentration field \( C(x, y, t) \):
        </p>

        <div className="p-4 bg-[#F5F7F4] border border-[#D8E0DA] rounded-lg text-center font-mono text-sm text-[#123B36] font-semibold">
          ∂C/∂t + ∇ · (u C) = D ∇²C + S(x, y, t)
        </div>

        <div className="text-xs text-[#52635D] leading-relaxed space-y-2">
          <p>Assuming an incompressible wind velocity field \( ∇ · u = 0 \), the advective term expands via product rule as:</p>
          <div className="p-3 bg-[#EDF1ED] rounded font-mono text-xs text-[#172521]">
            ∇ · (u C) = u · ∇C + C (∇ · u) = ux · (∂C/∂x) + uy · (∂C/∂y)
          </div>
          <p>Yielding the standard 2-D equation simulated in BreezeLab:</p>
          <div className="p-3 bg-[#EDF1ED] rounded font-mono text-xs text-[#172521]">
            ∂C/∂t + ux (∂C/∂x) + uy (∂C/∂y) = D [ ∂²C/∂x² + ∂²C/∂y² ] + S(x, y, t)
          </div>
        </div>

        {/* Symbol Definitions Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs border border-[#D8E0DA]">
            <thead className="bg-[#F5F7F4] text-[#172521] font-semibold">
              <tr>
                <th className="p-2.5 border-b border-[#D8E0DA]">Symbol</th>
                <th className="p-2.5 border-b border-[#D8E0DA]">Variable Name</th>
                <th className="p-2.5 border-b border-[#D8E0DA]">Units in BreezeLab</th>
                <th className="p-2.5 border-b border-[#D8E0DA]">Physical Significance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8E0DA] text-[#52635D]">
              <tr>
                <td className="p-2.5 font-mono font-bold text-[#172521]">C(x,y,t)</td>
                <td className="p-2.5">Concentration Field</td>
                <td className="p-2.5 font-mono">model-units / cell</td>
                <td className="p-2.5">Mass of dispersed pollutant per grid volume element</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-[#172521]">u = (ux, uy)</td>
                <td className="p-2.5">Wind Velocity Vector</td>
                <td className="p-2.5 font-mono">m / s</td>
                <td className="p-2.5">Mean background atmospheric bulk flow field</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-[#172521]">D</td>
                <td className="p-2.5">Diffusion Coefficient</td>
                <td className="p-2.5 font-mono">m² / s</td>
                <td className="p-2.5">Fickian turbulent eddy diffusivity</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono font-bold text-[#172521]">S(x,y,t)</td>
                <td className="p-2.5">Source Emission Rate</td>
                <td className="p-2.5 font-mono">model-units / s</td>
                <td className="p-2.5">Continuous point emission injections (e.g. factory stacks)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 2: Numerical Scheme & Stability */}
      <section className="bg-[#FFFFFF] p-6 rounded-lg border border-[#D8E0DA] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#D8E0DA]">
          <ShieldAlert className="w-5 h-5 text-[#E9A23B]" />
          <h2 className="text-lg font-bold text-[#172521]">2. Finite Difference Discretization & Combined Stability</h2>
        </div>

        <p className="text-xs text-[#52635D] leading-relaxed">
          Spatial derivatives are approximated on a uniform Cartesian grid with grid steps \( Δx \) and \( Δy \):
        </p>

        <ul className="list-disc pl-5 text-xs text-[#52635D] space-y-1.5">
          <li>
            <strong>Advection (Upwind Scheme):</strong> When ux ≥ 0, backward difference (C[i,j] - C[i-1,j]) / Δx is used to prevent spurious oscillations. When ux &lt; 0, forward difference is selected.
          </li>
          <li>
            <strong>Diffusion (Central Difference Laplacian):</strong> ∇²C ≈ (C[i+1,j] - 2C[i,j] + C[i-1,j]) / Δx² + (C[i,j+1] - 2C[i,j] + C[i,j-1]) / Δy².
          </li>
          <li>
            <strong>Time Stepping (Forward Euler):</strong> Explicit integration C(n+1) = C(n) + Δt · [ RHS ].
          </li>
        </ul>

        {/* Combined Stability Formula */}
        <div className="p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg space-y-2">
          <span className="text-xs font-bold text-[#92400E] uppercase tracking-wider block">
            Combined CFL & Von Neumann Stability Criterion:
          </span>
          <div className="font-mono text-xs text-[#78350F] font-bold text-center">
            ν = Δt · [ (|ux| / Δx) + (|uy| / Δy) + 2D · (1/Δx² + 1/Δy²) ] ≤ 1.0
          </div>
          <p className="text-[11px] text-[#92400E] leading-relaxed">
            Unlike decoupled checks, this combined condition guarantees that simultaneous advection and diffusion do not destabilize the numerical stencil. BreezeLab enforces this limit by auto-substepping the time-step if violated.
          </p>
        </div>
      </section>

      {/* Section 3: Vector Calculus Syllabus Operators */}
      <section className="bg-[#FFFFFF] p-6 rounded-lg border border-[#D8E0DA] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#D8E0DA]">
          <Binary className="w-5 h-5 text-[#16877A]" />
          <h2 className="text-lg font-bold text-[#172521]">3. Vector Calculus Syllabus Alignment (CO1)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Gradient */}
          <div className="p-4 bg-[#F5F7F4] border border-[#D8E0DA] rounded-lg space-y-2">
            <span className="font-bold text-[#123B36] text-sm flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#16877A]" />
              Gradient ∇C
            </span>
            <div className="font-mono text-[11px] p-2 bg-[#FFFFFF] border border-[#D8E0DA] rounded text-center">
              ∇C = ( ∂C/∂x , ∂C/∂y )
            </div>
            <p className="text-[#52635D] text-[11px] leading-relaxed">
              Points in direction of maximum concentration increase. Used in environmental engineering to determine contaminant plume boundaries and dispersion fronts.
            </p>
          </div>

          {/* Divergence */}
          <div className="p-4 bg-[#F5F7F4] border border-[#D8E0DA] rounded-lg space-y-2">
            <span className="font-bold text-[#123B36] text-sm flex items-center gap-1.5">
              <Binary className="w-4 h-4 text-[#2878B5]" />
              Divergence ∇ · u
            </span>
            <div className="font-mono text-[11px] p-2 bg-[#FFFFFF] border border-[#D8E0DA] rounded text-center">
              div(u) = ∂ux/∂x + ∂uy/∂y
            </div>
            <p className="text-[#52635D] text-[11px] leading-relaxed">
              Quantifies fluid compressibility and local volume expansion. Equals zero identically for our steady, uniform velocity field.
            </p>
          </div>

          {/* Curl */}
          <div className="p-4 bg-[#F5F7F4] border border-[#D8E0DA] rounded-lg space-y-2">
            <span className="font-bold text-[#123B36] text-sm flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-[#8A63B8]" />
              Curl (∇ × u)_z
            </span>
            <div className="font-mono text-[11px] p-2 bg-[#FFFFFF] border border-[#D8E0DA] rounded text-center">
              (∇ × u)_z = ∂uy/∂x − ∂ux/∂y
            </div>
            <p className="text-[#52635D] text-[11px] leading-relaxed">
              Measures local fluid vorticity and rotational tendency perpendicular to the plane.
            </p>
          </div>

          {/* Double Integral */}
          <div className="p-4 bg-[#F5F7F4] border border-[#D8E0DA] rounded-lg space-y-2">
            <span className="font-bold text-[#123B36] text-sm flex items-center gap-1.5">
              <Sigma className="w-4 h-4 text-[#E9A23B]" />
              Double Integration ∬ C dA
            </span>
            <div className="font-mono text-[11px] p-2 bg-[#FFFFFF] border border-[#D8E0DA] rounded text-center">
              M(t) = ∬_Ω C(x, y, t) dx dy
            </div>
            <p className="text-[#52635D] text-[11px] leading-relaxed">
              2-D numerical Riemann summation evaluating total pollutant quantity enclosed within the computational boundary.
            </p>
          </div>
        </div>
      </section>

      {/* Model Assumptions & Educational Disclaimer */}
      <div className="p-4 bg-[#EDF1ED] border border-[#B9C8BF] rounded-lg text-xs text-[#52635D] space-y-1.5">
        <span className="font-bold text-[#172521] block">
          Academic Capstone Note & Limitations:
        </span>
        <p className="leading-relaxed">
          BreezeLab is an educational simulation platform engineered to demonstrate vector calculus operators on partial differential equations. It models two-dimensional idealized dispersion and is not calibrated against real-time regulatory atmospheric observation stations or 3-D topography.
        </p>
      </div>
    </div>
  );
};
