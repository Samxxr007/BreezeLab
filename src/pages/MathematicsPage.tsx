// BreezeLab – Mathematical Reference & Syllabus Alignment Page
// Comprehensive educational theory, worked examples, symbols, and mathematical derivations.

import React, { useState } from 'react';
import { BookOpen, Compass, Binary, RotateCcw, Sigma, ShieldAlert, Cpu } from 'lucide-react';

export const MathematicsPage: React.FC = () => {
  const [vectorAngle, setVectorAngle] = useState(35);
  const [vectorSpeed, setVectorSpeed] = useState(4);
  const ux = vectorSpeed * Math.cos((vectorAngle * Math.PI) / 180);
  const uy = vectorSpeed * Math.sin((vectorAngle * Math.PI) / 180);
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
                <td className="p-2.5 font-mono">µg / m²</td>
                <td className="p-2.5">Pollutant mass per unit horizontal area</td>
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
                <td className="p-2.5 font-mono">µg / s</td>
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

      <section className="bg-[#102326] rounded-xl border border-[#284341] p-6 text-[#eff8f3] space-y-5 overflow-hidden">
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div><span className="text-[9px] font-mono tracking-[.2em] text-[#80b9a7]">INTERACTIVE CONCEPT EXPLORER</span><h2 className="text-lg font-bold mt-1">Resolve a wind vector into components</h2><p className="text-xs text-[#a5bdb3] mt-1">Change the magnitude and angle to see the Cartesian components update.</p></div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full border border-[#37645a] bg-[#1a3a37] text-[#a8e4ce]">u = (uₓ, uᵧ)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_.8fr] gap-6 items-center">
          <div className="rounded-lg border border-[#34514d] bg-[#0b191b] p-3">
            <svg viewBox="0 0 420 270" className="w-full h-auto" role="img" aria-label="Wind vector resolved into horizontal and vertical components">
              <defs><marker id="math-vector-tip" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7Z" fill="#7ce0bd"/></marker></defs>
              <path d="M35 220 H390 M70 245 V20" stroke="#56716a" strokeWidth="1.2"/>
              <path d="M70 220 H350" stroke="#56716a" strokeDasharray="4 5"/><path d="M70 220 V42" stroke="#56716a" strokeDasharray="4 5"/>
              <path d={`M70 220 L${70 + ux * 34} 220 L${70 + ux * 34} ${220 - uy * 34}`} fill="none" stroke="#e6b65d" strokeWidth="2.5" strokeDasharray="5 5"/>
              <line x1="70" y1="220" x2={70 + ux * 34} y2={220 - uy * 34} stroke="#7ce0bd" strokeWidth="4" strokeLinecap="round" markerEnd="url(#math-vector-tip)"/>
              <path d={`M112 220 A42 42 0 0 0 ${112} ${220 - 42 * Math.sin(vectorAngle * Math.PI / 180)}`} fill="none" stroke="#e6b65d" strokeWidth="2" opacity=".9"/>
              <text x="355" y="240" fill="#9eb8ad" fontSize="11">+x (east)</text><text x="80" y="28" fill="#9eb8ad" fontSize="11">+y (north)</text>
              <text x={Math.min(360, 85 + ux * 17)} y="237" fill="#e6b65d" fontSize="11">uₓ = {ux.toFixed(2)}</text>
              <text x={85 + ux * 34 + 8} y={Math.max(24, 220 - uy * 17)} fill="#e6b65d" fontSize="11">uᵧ = {uy.toFixed(2)}</text>
              <text x={Math.min(330, 80 + ux * 34)} y={Math.max(20, 205 - uy * 34)} fill="#7ce0bd" fontSize="12" fontWeight="bold">|u| = {vectorSpeed.toFixed(1)}</text>
            </svg>
          </div>
          <div className="space-y-5">
            <div><div className="flex justify-between text-xs mb-2"><label htmlFor="math-vector-speed" className="text-[#b8cec4]">Wind magnitude</label><span className="font-mono text-[#7ce0bd]">{vectorSpeed.toFixed(1)} m/s</span></div><input id="math-vector-speed" type="range" min="0" max="8" step=".1" value={vectorSpeed} onChange={e=>setVectorSpeed(Number(e.target.value))} className="w-full accent-[#42ad91]"/></div>
            <div><div className="flex justify-between text-xs mb-2"><label htmlFor="math-vector-angle" className="text-[#b8cec4]">Angle from +x axis</label><span className="font-mono text-[#7ce0bd]">{vectorAngle}°</span></div><input id="math-vector-angle" type="range" min="0" max="360" step="1" value={vectorAngle} onChange={e=>setVectorAngle(Number(e.target.value))} className="w-full accent-[#42ad91]"/></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-[#1a3a37] border border-[#37645a] p-3"><span className="text-[9px] tracking-widest text-[#9bb9ac]">HORIZONTAL</span><div className="text-xl font-mono font-bold text-[#f0c875] mt-1">{ux.toFixed(3)}</div><span className="text-[10px] text-[#9bb9ac]">uₓ = |u| cos θ</span></div>
              <div className="rounded-lg bg-[#1a3a37] border border-[#37645a] p-3"><span className="text-[9px] tracking-widest text-[#9bb9ac]">VERTICAL</span><div className="text-xl font-mono font-bold text-[#f0c875] mt-1">{uy.toFixed(3)}</div><span className="text-[10px] text-[#9bb9ac]">uᵧ = |u| sin θ</span></div>
            </div>
            <p className="text-[10px] leading-relaxed text-[#a5bdb3]">The component values determine the directional advection terms uₓ ∂C/∂x and uᵧ ∂C/∂y in the governing PDE.</p>
          </div>
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
