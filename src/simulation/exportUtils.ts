// BreezeLab – Export Utilities
// Generates standardized, scientifically formatted CSV and report payloads
// from the active SimulationState. Shared across UI exports and validation tests.

import type { SimulationState } from '../simulation/simulationTypes';
import { idx } from '../simulation/grid';

/**
 * Serializes the current live SimulationState into a formatted CSV string.
 *
 * Includes:
 * - Scenario metadata headers (time, wind velocity, diffusion, grid dimensions, source count)
 * - Complete matrix of grid coordinates (indices and metric positions in meters)
 * - Exact floating-point concentration field values (µg/m²)
 *
 * @param state Active simulation state
 * @returns string Formatted CSV content
 */
export function generateSimulationCSV(state: SimulationState): string {
  const { params, C, t } = state;
  const { nx, ny, dx, dy } = params.grid;

  const lines: string[] = [
    '# BreezeLab Simulation Numerical Data Export',
    `# Export Timestamp,${new Date().toISOString()}`,
    `# Simulation Time (s),${t.toFixed(2)}`,
    `# Wind Speed (m/s),${params.wind.speed.toFixed(3)}`,
    `# Wind Direction (deg),${params.wind.directionDeg.toFixed(1)}`,
    `# Horizontal Wind ux (m/s),${params.wind.ux.toFixed(3)}`,
    `# Vertical Wind uy (m/s),${params.wind.uy.toFixed(3)}`,
    `# Diffusion Coefficient D (m2/s),${params.diffusion}`,
    `# Grid Dimensions,${nx}x${ny}`,
    `# Cell Spacing dx dy (m),${dx},${dy}`,
    `# Cell Area dA (m2),${(dx * dy).toFixed(2)}`,
    `# Active Sources Count,${params.sources.length}`,
    '# Active Sources Configuration:' +
      params.sources.map((s) => ` [${s.label}: pos=(${s.x},${s.y}) rate=${s.rate}ug/s]`).join(';'),
    'col,row,x_coord_m,y_coord_m,concentration_ug_per_m2',
  ];

  for (let r = 0; r < ny; r++) {
    for (let c = 0; c < nx; c++) {
      const val = C[idx(c, r, nx)];
      lines.push(`${c},${r},${(c * dx).toFixed(2)},${(r * dy).toFixed(2)},${val.toFixed(5)}`);
    }
  }

  return lines.join('\n');
}

/**
 * Triggers a browser download of the generated simulation CSV file.
 */
export function downloadSimulationCSV(state: SimulationState): void {
  const csvContent = generateSimulationCSV(state);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `breezelab_export_t${state.t.toFixed(0)}s.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
