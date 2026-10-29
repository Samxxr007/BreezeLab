// BreezeLab – Numerical Solver
//
// Solves the 2-D advection–diffusion equation:
//
//   ∂C/∂t + ux·∂C/∂x + uy·∂C/∂y = D·(∂²C/∂x² + ∂²C/∂y²) + S(x,y,t)
//
// Discretisation:
//   • Advection  : first-order upwind finite differences
//   • Diffusion  : second-order central differences
//   • Time       : explicit Euler (forward Euler)
//
// Stability – combined CFL + diffusion constraint:
//
//   ν = dt · (|ux|/dx + |uy|/dy + 2D·(1/dx² + 1/dy²))  ≤  1
//
//   This is a conservative sufficient condition for the combined upwind/central
//   explicit scheme. Violating it leads to oscillations or blow-up.
//   The solver auto-subdivides dt into safe sub-steps when needed.

import type { SimulationParams, StabilityCheck } from './simulationTypes';
import { idx, cloneGrid, sanitiseGrid } from './grid';
import { applyZeroGradientBC } from './boundaryConditions';
import { applySourceTerms } from './sources';

// ─── Stability ──────────────────────────────────────────────────────────────

/**
 * Compute the combined stability number ν and derived time-step limits.
 *
 * ν = dt · (|ux|/dx + |uy|/dy + 2D·(1/dx² + 1/dy²))
 *
 * Stability requires ν ≤ 1.
 */
export function checkStability(params: SimulationParams): StabilityCheck {
  const { grid, wind, diffusion, dt } = params;
  const { dx, dy } = grid;
  const { ux, uy } = wind;

  const advTerm = Math.abs(ux) / dx + Math.abs(uy) / dy;
  const diffTerm = 2 * diffusion * (1 / (dx * dx) + 1 / (dy * dy));
  const rhs = advTerm + diffTerm;

  // Avoid division by zero when wind and diffusion are both zero
  const maxSafeDt = rhs > 0 ? 1 / rhs : Infinity;
  const recommendedDt = maxSafeDt * 0.45; // safety margin

  const combinedNumber = dt * rhs;
  const stable = combinedNumber <= 1.0 + 1e-10; // small tolerance for floating-point

  let message: string | undefined;
  if (!stable) {
    message =
      `Requested dt=${dt.toFixed(4)} s gives stability number ν=${combinedNumber.toFixed(3)} > 1. ` +
      `Solver will auto-subdivide into sub-steps of ≤${maxSafeDt.toFixed(4)} s.`;
  }

  return { stable, combinedNumber, maxSafeDt, recommendedDt, message };
}

/**
 * Compute the number of sub-steps needed to keep ν ≤ 1.
 * Returns at least 1.
 */
function computeSubsteps(params: SimulationParams): number {
  const check = checkStability(params);
  if (check.stable) return 1;
  // Subdivide so that dt_sub = dt / n gives ν_sub ≤ 0.9
  const n = Math.ceil(params.dt / (check.maxSafeDt * 0.9));
  return Math.max(1, n);
}

// ─── Core Solver Step ───────────────────────────────────────────────────────

/**
 * Advance the concentration field by one *effective* time step dt.
 *
 * If the requested dt is unstable, the step is subdivided internally.
 * Sources are spread proportionally across sub-steps.
 *
 * Returns a NEW Float64Array (does not mutate the input).
 *
 * @param C       Current concentration field (row-major, length = nx * ny)
 * @param params  Simulation parameters
 */
export function stepSolver(C: Float64Array, params: SimulationParams): Float64Array {
  validateParams(params);

  const nSub = computeSubsteps(params);
  const dtSub = params.dt / nSub;

  // Use a modified params with the sub-step dt
  const subParams: SimulationParams = { ...params, dt: dtSub };

  let current = cloneGrid(C);

  for (let s = 0; s < nSub; s++) {
    current = singleExplicitStep(current, subParams);
  }

  return current;
}

/**
 * One explicit Euler step with upwind advection and central diffusion.
 */
function singleExplicitStep(C: Float64Array, params: SimulationParams): Float64Array {
  const { grid, wind, diffusion, dt, sources } = params;
  const { nx, ny, dx, dy } = grid;
  const { ux, uy } = wind;

  const next = new Float64Array(nx * ny);

  for (let row = 1; row < ny - 1; row++) {
    for (let col = 1; col < nx - 1; col++) {
      const c  = C[idx(col,     row,     nx)];
      const cE = C[idx(col + 1, row,     nx)]; // east
      const cW = C[idx(col - 1, row,     nx)]; // west
      const cN = C[idx(col,     row + 1, nx)]; // north
      const cS = C[idx(col,     row - 1, nx)]; // south

      // Upwind advection: use backward difference in wind direction
      const dCdx = ux >= 0 ? (c - cW) / dx : (cE - c) / dx;
      const dCdy = uy >= 0 ? (c - cS) / dy : (cN - c) / dy;

      // Central diffusion: Laplacian
      const laplacian = (cE - 2 * c + cW) / (dx * dx)
                       + (cN - 2 * c + cS) / (dy * dy);

      next[idx(col, row, nx)] = c
        - dt * (ux * dCdx + uy * dCdy)   // advection
        + dt * diffusion * laplacian;     // diffusion
    }
  }

  // Apply source terms before boundary conditions
  applySourceTerms(next, sources, dt, nx, ny);

  // Apply zero-gradient boundary conditions
  applyZeroGradientBC(next, nx, ny);

  // Safety: remove any NaN / negative values introduced by numerical artefacts
  sanitiseGrid(next);

  return next;
}

// ─── Parameter Validation ───────────────────────────────────────────────────

function validateParams(params: SimulationParams): void {
  const { grid, diffusion, dt } = params;

  if (grid.nx < 3 || grid.ny < 3) {
    throw new Error('Grid must have at least 3 cells in each dimension.');
  }
  if (grid.dx <= 0 || grid.dy <= 0) {
    throw new Error('Grid spacing dx and dy must be positive.');
  }
  if (diffusion < 0) {
    throw new Error('Diffusion coefficient D must be non-negative.');
  }
  if (dt <= 0) {
    throw new Error('Time step dt must be positive.');
  }
  if (!isFinite(diffusion) || !isFinite(dt)) {
    throw new Error('Simulation parameters contain non-finite values.');
  }
}
