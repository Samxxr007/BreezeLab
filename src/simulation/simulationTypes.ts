// BreezeLab – Shared TypeScript types
// All simulation, state, and persistence types live here.

export interface GridConfig {
  nx: number;         // number of columns
  ny: number;         // number of rows
  dx: number;         // cell width in metres
  dy: number;         // cell height in metres
  width: number;      // domain width in metres  (= nx * dx)
  height: number;     // domain height in metres (= ny * dy)
}

export interface WindField {
  ux: number;          // x-component (m/s), positive = eastward
  uy: number;          // y-component (m/s), positive = northward
  speed: number;       // magnitude (m/s)
  directionDeg: number; // meteorological: degrees clockwise from north
}

// Unit note: EmissionSource.rate is in model-units / second.
// The solver interprets this as concentration-units injected per second
// into the bilinear footprint around (x, y). A value of 1.0 is the
// reference emission rate. Physical analogue: µg m⁻² s⁻¹ in 2-D.
export interface EmissionSource {
  id: string;
  x: number;          // fractional column index in [0, nx-1]
  y: number;          // fractional row index  in [0, ny-1]
  rate: number;       // emission rate (model-units / s)
  label: string;
  color?: string;
}

export interface SimulationParams {
  grid: GridConfig;
  wind: WindField;
  diffusion: number;   // D (m² / s)
  dt: number;          // requested time step (s) — may be auto-subdivided
  sources: EmissionSource[];
  duration: number;    // total simulation duration (s)
  animationSpeed: number; // steps rendered per animation frame (1–20)
}

export interface StabilityCheck {
  stable: boolean;
  combinedNumber: number;  // must be ≤ 1 for stability
  maxSafeDt: number;       // largest dt satisfying the combined constraint
  recommendedDt: number;   // slightly conservative suggestion
  message?: string;
}

export interface SimulationState {
  C: Float64Array;          // concentration field, row-major [ny × nx]
  t: number;                // current simulation time (s)
  step: number;             // step count
  params: SimulationParams;
  history: TimeSeriesPoint[];
  isRunning: boolean;
  isComplete: boolean;
  selectedPoint: GridPoint | null;
  warningMessage?: string;
}

export interface TimeSeriesPoint {
  t: number;
  totalMass: number;    // ΣΣ C·dx·dy — integrated concentration
  avgConc: number;      // mean concentration over domain
  maxConc: number;      // peak concentration
  selectedConc: number; // concentration at user-selected point (or 0)
}

export interface GridPoint {
  col: number;
  row: number;
}

export interface SavedScenario {
  id: string;
  name: string;
  createdAt: string;
  params: SimulationParams;
  snapshot: TimeSeriesPoint[];  // summary time series only — not full C array
  peakConc: number;
  totalMass: number;
}

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'complete' | 'error';

// Predefined scenario presets
export interface ScenarioPreset {
  id: string;
  label: string;
  description: string;
  params: Partial<SimulationParams>;
}
