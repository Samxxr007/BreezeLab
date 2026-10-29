// BreezeLab – Divergence of the Wind Field
//
// Divergence for 2-D velocity field u = (ux, uy):
//   div(u) = ∇ · u = ∂ux/∂x + ∂uy/∂y
//
// In our baseline model with uniform constant wind:
//   ux(x,y) = const, uy(x,y) = const
//   div(u) = 0 + 0 = 0 everywhere.
//
// This reflects physical incompressibility (∇ · u = 0).
// BreezeLab also computes divergence for spatially-varying wind distributions if specified.

import { idx } from '../simulation/grid';

export interface DivergenceField {
  values: Float64Array; // div(u) at each cell
  min: number;
  max: number;
  mean: number;
}

/**
 * Computes divergence scalar field for a uniform or spatially defined wind field.
 */
export function computeDivergence(
  uxField: Float64Array | number,
  uyField: Float64Array | number,
  nx: number,
  ny: number,
  dx: number,
  dy: number
): DivergenceField {
  const n = nx * ny;
  const values = new Float64Array(n);

  const isUniformUx = typeof uxField === 'number';
  const isUniformUy = typeof uyField === 'number';

  if (isUniformUx && isUniformUy) {
    // Constant wind field has analytically zero divergence everywhere
    // values is already zero-initialised Float64Array
    return {
      values,
      min: 0,
      max: 0,
      mean: 0,
    };
  }

  let min = Infinity;
  let max = -Infinity;
  let sum = 0;

  const getUx = (c: number, r: number) => isUniformUx ? (uxField as number) : (uxField as Float64Array)[idx(c, r, nx)];
  const getUy = (c: number, r: number) => isUniformUy ? (uyField as number) : (uyField as Float64Array)[idx(c, r, nx)];

  for (let r = 0; r < ny; r++) {
    for (let c = 0; c < nx; c++) {
      let duxdx: number;
      if (c === 0) {
        duxdx = (getUx(c + 1, r) - getUx(c, r)) / dx;
      } else if (c === nx - 1) {
        duxdx = (getUx(c, r) - getUx(c - 1, r)) / dx;
      } else {
        duxdx = (getUx(c + 1, r) - getUx(c - 1, r)) / (2 * dx);
      }

      let duydy: number;
      if (r === 0) {
        duydy = (getUy(c, r + 1) - getUy(c, r)) / dy;
      } else if (r === ny - 1) {
        duydy = (getUy(c, r) - getUy(c, r - 1)) / dy;
      } else {
        duydy = (getUy(c, r + 1) - getUy(c, r - 1)) / (2 * dy);
      }

      const div = duxdx + duydy;
      const i = idx(c, r, nx);
      values[i] = div;

      if (div < min) min = div;
      if (div > max) max = div;
      sum += div;
    }
  }

  return {
    values,
    min: isFinite(min) ? min : 0,
    max: isFinite(max) ? max : 0,
    mean: sum / n,
  };
}
