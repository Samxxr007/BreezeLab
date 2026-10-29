// BreezeLab – Numerical Integration (Quadrature)
//
// Computes total pollutant amount over the 2-D domain Ω:
//   M(t) = ∬_Ω C(x,y,t) dA ≈ ∑∑ C(col, row) · dx · dy
//
// Discrete 2-D quadrature approximation over uniform rectangular grid.
// Note on units:
//   If C is in model-units per grid cell, discrete summation gives total model-units.
//   Area-weighted integration scales by (dx * dy) for spatial concentration density.

export interface IntegrationSummary {
  totalMass: number;       // Area-weighted integral: ∑ C[i] * dx * dy
  discreteSum: number;     // Direct sum of cell contents: ∑ C[i]
  averageConcentration: number; // discreteSum / (nx * ny)
  minConcentration: number;
  maxConcentration: number;
  domainArea: number;      // nx * dx * ny * dy
}

/**
 * Computes numerical double integration and summary statistics of the concentration field.
 */
export function integrateConcentration(
  C: Float64Array,
  nx: number,
  ny: number,
  dx: number,
  dy: number
): IntegrationSummary {
  const n = nx * ny;
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < n; i++) {
    const val = C[i];
    sum += val;
    if (val < min) min = val;
    if (val > max) max = val;
  }

  const cellArea = dx * dy;
  const domainArea = nx * ny * cellArea;

  return {
    totalMass: sum * cellArea,
    discreteSum: sum,
    averageConcentration: n > 0 ? sum / n : 0,
    minConcentration: isFinite(min) ? min : 0,
    maxConcentration: isFinite(max) ? max : 0,
    domainArea,
  };
}
