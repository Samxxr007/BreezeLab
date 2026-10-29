// BreezeLab – Numerical Solver
//
// Solves the 2-D advection–diffusion equation:
//
//   ∂C/∂t + ux·∂C/∂x + uy·∂C/∂y = D·(∂²C/∂x² + ∂²C/∂y²) + S(x,y,t)
//
// Consistent Physical Units:
//   C       : µg / m²        (concentration density)
//   ux, uy  : m / s          (wind velocity components)
//   D       : m² / s         (turbulent diffusion coefficient)
//   S       : µg / (m² · s)  (source mass rate per unit area: rate/(dx·dy))
//   dt      : s              (time step)
//   dx, dy  : m              (cell spacing)

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

  const maxSafeDt = rhs > 0 ? 1 / rhs : Infinity;
  const recommendedDt = maxSafeDt * 0.45;

  const combinedNumber = dt * rhs;
  const stable = combinedNumber <= 1.0 + 1e-10;

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
 */
function computeSubsteps(params: SimulationParams): number {
  const check = checkStability(params);
  if (check.stable) return 1;
  const n = Math.ceil(params.dt / (check.maxSafeDt * 0.9));
  return Math.max(1, n);
}

// ─── Core Solver Step ───────────────────────────────────────────────────────

/**
 * Advance the concentration field by one time step dt.
 *
 * If the requested dt is unstable, the step is subdivided internally.
 * Returns a NEW Float64Array (does not mutate input).
 */
export function stepSolver(C: Float64Array, params: SimulationParams): Float64Array {
  validateParams(params);

  const nSub = computeSubsteps(params);
  const dtSub = params.dt / nSub;

  const subParams: SimulationParams = { ...params, dt: dtSub };

  let current = cloneGrid(C);

  for (let s = 0; s < nSub; s++) {
    current = singleExplicitStep(current, subParams);
  }

  return current;
}

/**
 * One explicit Euler step with upwind advection, central diffusion,
 * and conservative zero-diffusive-flux boundaries.
 */
function singleExplicitStep(C: Float64Array, params: SimulationParams): Float64Array {
  const { grid, wind, diffusion, dt, sources } = params;
  const { nx, ny, dx, dy } = grid;
  const { ux, uy } = wind;

  const next = new Float64Array(nx * ny);
  const invDx = 1 / dx;
  const invDy = 1 / dy;
  const invDx2 = 1 / (dx * dx);
  const invDy2 = 1 / (dy * dy);

  // Compute flux-based conservative update for all cells
  // For interior cells:
  for (let row = 0; row < ny; row++) {
    for (let col = 0; col < nx; col++) {
      const c = C[idx(col, row, nx)];

      // Neighbor values with zero-diffusive-flux (Neumann) ghost treatment:
      // At boundary, normal derivative is zero: C_ghost = C_boundary
      const cE = col < nx - 1 ? C[idx(col + 1, row, nx)] : c;
      const cW = col > 0      ? C[idx(col - 1, row, nx)] : c;
      const cN = row < ny - 1 ? C[idx(col, row + 1, nx)] : c;
      const cS = row > 0      ? C[idx(col, row - 1, nx)] : c;

      // Upwind advection:
      // If wind flows in from outside domain across boundary, concentration from outside is zero
      const upwindW = col > 0 ? cW : 0;
      const upwindE = col < nx - 1 ? cE : 0;
      const upwindS = row > 0 ? cS : 0;
      const upwindN = row < ny - 1 ? cN : 0;

      const dCdx = ux >= 0 ? (c - upwindW) * invDx : (upwindE - c) * invDx;
      const dCdy = uy >= 0 ? (c - upwindS) * invDy : (upwindN - c) * invDy;

      // Conservative diffusion Laplacian with no-flux boundaries:
      const laplacian = (cE - 2 * c + cW) * invDx2 + (cN - 2 * c + cS) * invDy2;

      next[idx(col, row, nx)] = c
        - dt * (ux * dCdx + uy * dCdy)
        + dt * diffusion * laplacian;
    }
  }

  // Inject emissions with area-consistent units (µg/s -> µg/m²)
  applySourceTerms(next, sources, dt, nx, ny, dx, dy);

  // Safety: remove any negative values or NaN artefacts
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
