// BreezeLab – Curl (Vorticity) of the Wind Field
//
// 2-D Curl (out-of-plane vorticity vector ω_z):
//   curl(u)_z = (∇ × u)_z = ∂uy/∂x - ∂ux/∂y
//
// In a uniform wind field:
//   ∂uy/∂x = 0, ∂ux/∂y = 0 => curl(u)_z = 0 everywhere.
//   This represents an irrotational flow field.
//
// Physical meaning:
//   Positive curl indicates counter-clockwise local rotation tendency (cyclonic).
//   Negative curl indicates clockwise rotation tendency (anticyclonic).

import { idx } from '../simulation/grid';

export interface CurlField {
  values: Float64Array; // curl_z at each cell
  min: number;
  max: number;
  mean: number;
}

/**
 * Computes the out-of-plane curl field for a 2-D velocity field.
 */
export function computeCurl(
  uxField: Float64Array | number,
  uyField: Float64Array | number,
  nx: number,
  ny: number,
  dx: number,
  dy: number
): CurlField {
  const n = nx * ny;
  const values = new Float64Array(n);

  const isUniformUx = typeof uxField === 'number';
  const isUniformUy = typeof uyField === 'number';

  if (isUniformUx && isUniformUy) {
    // Constant wind field is strictly irrotational (curl = 0)
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
      // ∂uy/∂x
      let duydx: number;
      if (c === 0) {
        duydx = (getUy(c + 1, r) - getUy(c, r)) / dx;
      } else if (c === nx - 1) {
        duydx = (getUy(c, r) - getUy(c - 1, r)) / dx;
      } else {
        duydx = (getUy(c + 1, r) - getUy(c - 1, r)) / (2 * dx);
      }

      // ∂ux/∂y
      let duxdy: number;
      if (r === 0) {
        duxdy = (getUx(c, r + 1) - getUx(c, r)) / dy;
      } else if (r === ny - 1) {
        duxdy = (getUx(c, r) - getUx(c, r - 1)) / dy;
      } else {
        duxdy = (getUx(c, r + 1) - getUx(c, r - 1)) / (2 * dy);
      }

      const curlZ = duydx - duxdy;
      const i = idx(c, r, nx);
      values[i] = curlZ;

      if (curlZ < min) min = curlZ;
      if (curlZ > max) max = curlZ;
      sum += curlZ;
    }
  }

  return {
    values,
    min: isFinite(min) ? min : 0,
    max: isFinite(max) ? max : 0,
    mean: sum / n,
  };
}
