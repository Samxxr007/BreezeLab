// BreezeLab – Emission Sources
//
// PHYSICAL UNIT CONVENTION
// ─────────────────────────────────────────────────────────────────────────────
// Parameter              | Symbol  | Physical Unit         | Description
// -----------------------+---------+-----------------------+-------------------
// Domain Coordinates     | x, y    | m                     | Spatial position
// Grid Cell Dimensions   | dx, dy  | m                     | Cell width & height
// Grid Cell Area         | ΔA      | m² (= dx · dy)        | Surface footprint
// Concentration Field    | C(x,y,t)| µg / m²               | Areal concentration density
// Emission Source Rate   | S       | µg / s                | Total mass emitted per second
// Time Step              | dt      | s                     | Integration interval
// Mass in Cell           | m_cell  | µg (= C · dx · dy)    | Discrete cell pollutant mass
// Total Domain Mass      | M(t)    | µg (= ∬ C dA)         | Area-integrated domain mass
// ─────────────────────────────────────────────────────────────────────────────
//
// Injected Mass per Time Step:
//   ΔM_injected = rate (µg/s) × dt (s) = [µg]
//
// Since C is concentration density (µg/m²), the change in concentration
// across cell area ΔA = dx · dy is:
//   ΔC = ΔM_injected / (dx · dy) = (rate · dt) / (dx · dy)   [µg/m²]
//
// When distributed bilinearly across surrounding cells with weights w_k (∑ w_k = 1):
//   C_cell += w_k · (rate · dt) / (dx · dy)
//
// This guarantees exact mathematical consistency:
//   ∑ (ΔC_cell · dx · dy) = ∑ (w_k · rate · dt) = rate · dt = ΔM_injected
// The numerical double integral ∬ C dA increases by exactly rate · dt!

import type { EmissionSource } from './simulationTypes';
import { idx } from './grid';

/**
 * Add source contributions to the concentration field for one time step dt.
 *
 * Each source emits at `rate` (µg/s). Over time `dt` (s), total mass injected is
 * `rate * dt` (µg). Because `C` represents concentration density (µg/m²),
 * each cell receives its bilinear fraction divided by cell area `dx * dy`.
 *
 * @param C       Concentration field (µg/m²) — mutated in place
 * @param sources Array of emission sources
 * @param dt      Time step (s)
 * @param nx      Number of columns
 * @param ny      Number of rows
 * @param dx      Cell width (m)
 * @param dy      Cell height (m)
 */
export function applySourceTerms(
  C: Float64Array,
  sources: EmissionSource[],
  dt: number,
  nx: number,
  ny: number,
  dx: number,
  dy: number
): void {
  const cellArea = dx * dy;
  if (cellArea <= 0) return;

  for (const src of sources) {
    // Clamp source position to interior domain
    const fx = Math.max(0, Math.min(nx - 1, src.x));
    const fy = Math.max(0, Math.min(ny - 1, src.y));

    const col = Math.floor(fx);
    const row = Math.floor(fy);

    // Bilinear interpolation weights
    const tx = fx - col;
    const ty = fy - row;

    // Concentration increment per unit weight: [µg/s * s] / [m²] = µg/m²
    const deltaConc = (src.rate * dt) / cellArea;

    const applyToCell = (c: number, r: number, weight: number) => {
      if (c >= 0 && c < nx && r >= 0 && r < ny && weight > 0) {
        C[idx(c, r, nx)] += weight * deltaConc;
      }
    };

    applyToCell(col,     row,     (1 - tx) * (1 - ty));
    applyToCell(col + 1, row,     tx       * (1 - ty));
    applyToCell(col,     row + 1, (1 - tx) * ty      );
    applyToCell(col + 1, row + 1, tx       * ty      );
  }
}
