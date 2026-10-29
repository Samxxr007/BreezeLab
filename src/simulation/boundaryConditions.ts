// BreezeLab – Boundary Conditions
//
// We apply zero-gradient (homogeneous Neumann) boundary conditions:
//   ∂C/∂n = 0  on ∂Ω
//
// Implementation: copy the nearest interior cell value to each boundary cell
// so that the finite-difference gradient normal to the boundary evaluates to zero.
//
// ─── IMPORTANT LIMITATION ──────────────────────────────────────────────────
// Zero-gradient BCs do NOT guarantee conservation of total pollutant mass when
// advection is present. When wind blows toward or away from a domain boundary,
// the advective flux term (u·∇C) still transports mass across the boundary.
//
// Consequence:
//  • In diffusion-only scenarios (u=0) with no-flux BCs, discrete mass IS
//    conserved to numerical round-off. This is verified by Validation Test T4.
//  • In advection scenarios, mass exits the domain through the outflow boundary.
//    This is physically appropriate (pollutants leave the region) but the user
//    must understand that the domain is "open" on the downwind side.
//
// If strict conservation across all boundaries is required, a fully conservative
// finite-volume formulation with consistent flux reconstruction is needed.
// That is beyond the scope of this educational capstone model.
// ───────────────────────────────────────────────────────────────────────────

import { idx } from './grid';

/**
 * Apply zero-gradient (Neumann ∂C/∂n = 0) boundary conditions.
 * Mutates C in place. Call after each solver step.
 *
 * @param C   Concentration field (row-major Float64Array)
 * @param nx  Number of columns
 * @param ny  Number of rows
 */
export function applyZeroGradientBC(
  C: Float64Array,
  nx: number,
  ny: number
): void {
  // Left boundary (col = 0): copy col 1
  for (let row = 0; row < ny; row++) {
    C[idx(0, row, nx)] = C[idx(1, row, nx)];
  }

  // Right boundary (col = nx-1): copy col nx-2
  for (let row = 0; row < ny; row++) {
    C[idx(nx - 1, row, nx)] = C[idx(nx - 2, row, nx)];
  }

  // Bottom boundary (row = 0): copy row 1
  for (let col = 0; col < nx; col++) {
    C[idx(col, 0, nx)] = C[idx(col, 1, nx)];
  }

  // Top boundary (row = ny-1): copy row ny-2
  for (let col = 0; col < nx; col++) {
    C[idx(col, ny - 1, nx)] = C[idx(col, ny - 2, nx)];
  }

  // Corner cells: average of two adjacent boundary cells (avoids discontinuities)
  C[idx(0, 0, nx)] = 0.5 * (C[idx(1, 0, nx)] + C[idx(0, 1, nx)]);
  C[idx(nx - 1, 0, nx)] = 0.5 * (C[idx(nx - 2, 0, nx)] + C[idx(nx - 1, 1, nx)]);
  C[idx(0, ny - 1, nx)] = 0.5 * (C[idx(1, ny - 1, nx)] + C[idx(0, ny - 2, nx)]);
  C[idx(nx - 1, ny - 1, nx)] = 0.5 * (C[idx(nx - 2, ny - 1, nx)] + C[idx(nx - 1, ny - 2, nx)]);
}
