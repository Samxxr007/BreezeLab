// BreezeLab – Grid utilities
// Pure functions for creating and accessing the concentration field.
// The field C is stored as a Float64Array in row-major order:
//   C[row * nx + col]  where row ∈ [0, ny-1], col ∈ [0, nx-1]
// Physical convention: row 0 = bottom of domain (south), col 0 = left (west).

/**
 * Create a zero-initialised concentration grid.
 * @param nx  Number of columns
 * @param ny  Number of rows
 */
export function createGrid(nx: number, ny: number): Float64Array {
  return new Float64Array(nx * ny); // TypedArray is zero-initialised by spec
}

/**
 * Linear index for (col, row) in a row-major array of width nx.
 */
export function idx(col: number, row: number, nx: number): number {
  return row * nx + col;
}

/**
 * Return a deep copy of the concentration array.
 */
export function cloneGrid(C: Float64Array): Float64Array {
  return new Float64Array(C);
}

/**
 * Clamp a value to [min, max].
 */
export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Find min and max of the concentration field in one pass.
 */
export function gridMinMax(C: Float64Array): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < C.length; i++) {
    if (C[i] < min) min = C[i];
    if (C[i] > max) max = C[i];
  }
  if (!isFinite(min)) min = 0;
  if (!isFinite(max)) max = 0;
  return { min, max };
}

/**
 * Ensure no NaN or Infinity values remain in the field.
 * Replaces any bad values with 0 and returns true if any were found.
 */
export function sanitiseGrid(C: Float64Array): boolean {
  let dirty = false;
  for (let i = 0; i < C.length; i++) {
    if (!isFinite(C[i]) || isNaN(C[i])) {
      C[i] = 0;
      dirty = true;
    }
    if (C[i] < 0) C[i] = 0; // concentration is non-negative
  }
  return dirty;
}
