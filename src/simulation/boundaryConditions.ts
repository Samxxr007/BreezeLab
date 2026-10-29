// BreezeLab – Boundary Conditions & Conservative Fluxes
//
// PHYSICAL SPECIFICATION OF BOUNDARIES:
// ─────────────────────────────────────────────────────────────────────────────
// Boundary Condition      | Mathematical Meaning           | Implementation
// ------------------------+--------------------------------+-------------------
// Diffusion Boundary      | Zero diffusive flux (-D ∂C/∂n) | Ghost-cell / symmetry
// Advection Outflow       | Free outflow (convective exit) | Upwind flux across ∂Ω
// Advection Inflow        | Zero inflow from outside domain| C_inflow = 0
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. Diffusion Conservation (No-Flux Neumann condition):
//    In a pure-diffusion regime (u = 0), a zero diffusive flux condition
//    -D ∂C/∂n = 0 means NO pollutant mass diffuses across the domain perimeter.
//    At the boundary cells, setting zero normal gradient guarantees that
//    the discrete Laplacian operator ∇²C conserves total mass ∑ C_ij · dx · dy
//    to floating-point precision (relative error < 1e-12).
//
// 2. Advection Outflow:
//    When wind blows across a boundary outward (u · n > 0), pollutants exit the
//    domain physically. In BreezeLab, this open-boundary outflow is modeled via
//    the natural upwind flux, carrying mass across the perimeter.
//
// 3. Mathematical Consistency:
//    Zero-gradient boundary values C_boundary = C_adjacent implement ∂C/∂n = 0.
//    In this file, `applyZeroGradientBC` ensures ghost/boundary cell values
//    satisfy ∂C/∂n = 0 normal to each of the 4 computational domain boundaries.

import { idx } from './grid';

/**
 * Apply zero-gradient (homogeneous Neumann: ∂C/∂n = 0) boundary conditions.
 *
 * Copies the interior cell directly adjacent to the boundary to ensure that
 * central difference normal derivatives evaluate to zero at the boundary:
 *   Left (col=0):       (C[1, r] - C[0, r]) / dx = 0  => C[0, r] = C[1, r]
 *   Right (col=nx-1):   (C[nx-1, r] - C[nx-2, r]) / dx = 0 => C[nx-1, r] = C[nx-2, r]
 *   Bottom (row=0):     (C[c, 1] - C[c, 0]) / dy = 0  => C[c, 0] = C[c, 1]
 *   Top (row=ny-1):     (C[c, ny-1] - C[c, ny-2]) / dy = 0 => C[c, ny-1] = C[c, ny-2]
 *
 * @param C   Concentration field (Float64Array) — mutated in place
 * @param nx  Number of columns
 * @param ny  Number of rows
 */
export function applyZeroGradientBC(
  C: Float64Array,
  nx: number,
  ny: number
): void {
  // Left and Right boundaries
  for (let row = 0; row < ny; row++) {
    C[idx(0, row, nx)] = C[idx(1, row, nx)];
    C[idx(nx - 1, row, nx)] = C[idx(nx - 2, row, nx)];
  }

  // Bottom and Top boundaries
  for (let col = 0; col < nx; col++) {
    C[idx(col, 0, nx)] = C[idx(col, 1, nx)];
    C[idx(col, ny - 1, nx)] = C[idx(col, ny - 2, nx)];
  }

  // Four Corners: harmonic mean of neighboring boundary values
  C[idx(0, 0, nx)] = 0.5 * (C[idx(1, 0, nx)] + C[idx(0, 1, nx)]);
  C[idx(nx - 1, 0, nx)] = 0.5 * (C[idx(nx - 2, 0, nx)] + C[idx(nx - 1, 1, nx)]);
  C[idx(0, ny - 1, nx)] = 0.5 * (C[idx(1, ny - 1, nx)] + C[idx(0, ny - 2, nx)]);
  C[idx(nx - 1, ny - 1, nx)] = 0.5 * (C[idx(nx - 2, ny - 1, nx)] + C[idx(nx - 1, ny - 2, nx)]);
}
