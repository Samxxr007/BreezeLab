// BreezeLab – Numerical Integration (Quadrature)
//
// PHYSICAL UNIT DEFINITIONS:
// ─────────────────────────────────────────────────────────────────────────────
// C(x, y, t)          : Areal concentration density [µg / m²]
// dx, dy              : Grid cell spatial dimensions [m]
// dA = dx · dy        : Grid cell area [m²]
// M(t) = ∬_Ω C dA     : Total pollutant mass in domain [µg]
//                     : Approximated via 2-D rectangle quadrature:
//                     : M(t) = ∑_{i,j} C(i, j) · dx · dy
// Average Conc C_avg  : Mean spatial concentration density [µg / m²]
//                     : C_avg = M(t) / (Total Domain Area)
//                     :       = (∑ C_ij) / (nx · ny)

export interface IntegrationSummary {
  totalMass: number;            // Total integrated mass: ∬ C dA = ∑ C_ij · dx · dy [µg]
  discreteSum: number;          // Raw array sum: ∑ C_ij
  averageConcentration: number; // Mean concentration density: M(t) / Area [µg / m²]
  minConcentration: number;     // Minimum single cell concentration [µg / m²]
  maxConcentration: number;     // Maximum single cell concentration [µg / m²]
  domainArea: number;           // Total domain surface area: nx · dx · ny · dy [m²]
}

/**
 * Computes numerical double integration and summary statistics of the concentration field.
 *
 * @param C   Concentration field (µg/m²)
 * @param nx  Number of columns
 * @param ny  Number of rows
 * @param dx  Cell width (m)
 * @param dy  Cell height (m)
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
  const totalMass = sum * cellArea;

  return {
    totalMass,
    discreteSum: sum,
    averageConcentration: n > 0 ? sum / n : 0,
    minConcentration: isFinite(min) ? min : 0,
    maxConcentration: isFinite(max) ? max : 0,
    domainArea,
  };
}
