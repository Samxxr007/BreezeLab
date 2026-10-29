// BreezeLab – Gradient of the Concentration Field
//
// Computes the numerical gradient:
//   ∇C = (∂C/∂x, ∂C/∂y)
//
// Method:
//   Interior cells  : central finite differences (2nd-order accurate)
//     ∂C/∂x ≈ (C[i+1,j] - C[i-1,j]) / (2·dx)
//     ∂C/∂y ≈ (C[i,j+1] - C[i,j-1]) / (2·dy)
//
//   Boundary cells  : one-sided (forward/backward) differences (1st-order)
//
// Physical meaning:
//   The gradient vector points in the direction of steepest increase of C.
//   Its magnitude |∇C| measures the spatial rate of change of concentration.
//   High-gradient regions mark sharp pollution fronts.

import { idx } from '../simulation/grid';

export interface GradientField {
  gx: Float64Array;        // ∂C/∂x at each cell
  gy: Float64Array;        // ∂C/∂y at each cell
  magnitude: Float64Array; // |∇C| = sqrt(gx² + gy²)
  direction: Float64Array; // atan2(gy, gx) in radians
}

/**
 * Compute the gradient field of C using finite differences.
 *
 * @param C   Concentration field, row-major [ny × nx]
 * @param nx  Number of columns
 * @param ny  Number of rows
 * @param dx  Cell width (m)
 * @param dy  Cell height (m)
 */
export function computeGradient(
  C: Float64Array,
  nx: number,
  ny: number,
  dx: number,
  dy: number
): GradientField {
  const n = nx * ny;
  const gx = new Float64Array(n);
  const gy = new Float64Array(n);
  const magnitude = new Float64Array(n);
  const direction = new Float64Array(n);

  for (let row = 0; row < ny; row++) {
    for (let col = 0; col < nx; col++) {
      const i = idx(col, row, nx);

      // ∂C/∂x
      let gradX: number;
      if (col === 0) {
        // Forward difference at left boundary
        gradX = (C[idx(col + 1, row, nx)] - C[i]) / dx;
      } else if (col === nx - 1) {
        // Backward difference at right boundary
        gradX = (C[i] - C[idx(col - 1, row, nx)]) / dx;
      } else {
        // Central difference interior
        gradX = (C[idx(col + 1, row, nx)] - C[idx(col - 1, row, nx)]) / (2 * dx);
      }

      // ∂C/∂y
      let gradY: number;
      if (row === 0) {
        gradY = (C[idx(col, row + 1, nx)] - C[i]) / dy;
      } else if (row === ny - 1) {
        gradY = (C[i] - C[idx(col, row - 1, nx)]) / dy;
      } else {
        gradY = (C[idx(col, row + 1, nx)] - C[idx(col, row - 1, nx)]) / (2 * dy);
      }

      gx[i] = gradX;
      gy[i] = gradY;
      magnitude[i] = Math.sqrt(gradX * gradX + gradY * gradY);
      direction[i] = Math.atan2(gradY, gradX);
    }
  }

  return { gx, gy, magnitude, direction };
}

/**
 * Get gradient components at a specific grid cell.
 */
export function getGradientAt(
  field: GradientField,
  col: number,
  row: number,
  nx: number
): { gx: number; gy: number; magnitude: number; directionDeg: number } {
  const i = idx(col, row, nx);
  return {
    gx: field.gx[i],
    gy: field.gy[i],
    magnitude: field.magnitude[i],
    directionDeg: (field.direction[i] * 180) / Math.PI,
  };
}
