// BreezeLab – Emission Sources
//
// Unit convention
// ───────────────
// EmissionSource.rate  :  model-units · s⁻¹
//   Represents the total quantity of pollutant emitted per second by this source.
//   Physical analogue: µg m⁻² s⁻¹ for a 2-D ground-level release.
//
// Concentration field C:  model-units (per grid cell)
//   Each cell holds an absolute quantity, not a density.
//   When reporting "average concentration" the UI divides by (nx·ny).
//
// Injection per step:
//   Q_step = rate × dt                      (model-units per step)
//   This quantity is distributed bilinearly to the 4 surrounding cells
//   weighted by fractional proximity, so the total injected per step
//   equals rate × dt exactly (conservation by construction).
//
// Why not divide by cell area?
//   If C were stored as concentration per unit area (model-units m⁻²), we would
//   add rate·dt/(dx·dy). Here C is stored per-cell, so no area division is needed.
//   The integration module (integration.ts) multiplies by dx·dy when computing
//   the area-integrated total, correctly recovering the physically meaningful quantity.

import type { EmissionSource } from './simulationTypes';
import { idx } from './grid';

/**
 * Add source contributions to the concentration field for one time step.
 *
 * Each source's emission (rate × dt) is distributed bilinearly to the four
 * grid cells surrounding the source's sub-cell position.
 *
 * Total added per source per step = rate × dt  (exactly conserved).
 *
 * @param C       Concentration field — mutated in place
 * @param sources Array of emission sources
 * @param dt      Time step (s)
 * @param nx      Number of columns
 * @param ny      Number of rows
 */
export function applySourceTerms(
  C: Float64Array,
  sources: EmissionSource[],
  dt: number,
  nx: number,
  ny: number
): void {
  for (const src of sources) {
    // Clamp source position to interior cells to avoid boundary contamination
    const fx = Math.max(0, Math.min(nx - 1, src.x));
    const fy = Math.max(0, Math.min(ny - 1, src.y));

    const col = Math.floor(fx);
    const row = Math.floor(fy);

    // Fractional offsets (bilinear weights)
    const tx = fx - col;
    const ty = fy - row;

    // Total quantity to inject this step
    const Q = src.rate * dt;

    // Distribute bilinearly to up to 4 surrounding cells
    const applyToCell = (c: number, r: number, w: number) => {
      if (c >= 0 && c < nx && r >= 0 && r < ny) {
        C[idx(c, r, nx)] += w * Q;
      }
    };

    applyToCell(col,     row,     (1 - tx) * (1 - ty));
    applyToCell(col + 1, row,     tx       * (1 - ty));
    applyToCell(col,     row + 1, (1 - tx) * ty      );
    applyToCell(col + 1, row + 1, tx       * ty      );
  }
}
