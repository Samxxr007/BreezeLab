// BreezeLab – Persistence Layer (LocalStorage)
//
// Manages saving, loading, duplicating, and deleting scenarios.
// To prevent quota exhaustion, only configuration parameters and summary metrics are saved.

import type { SavedScenario, SimulationParams, TimeSeriesPoint } from '../simulation/simulationTypes';

const STORAGE_KEY = 'breezelab_saved_scenarios';
const PREFS_KEY = 'breezelab_user_preferences';

export interface UserPreferences {
  theme: 'light' | 'dark';
  defaultGridNx: number;
  defaultGridNy: number;
  autoStabilitySubstep: boolean;
  showParticles: boolean;
  showVectorField: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  defaultGridNx: 60,
  defaultGridNy: 60,
  autoStabilitySubstep: true,
  showParticles: true,
  showVectorField: true,
};

export function loadSavedScenarios(): SavedScenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultScenarios();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getDefaultScenarios();
  } catch (err) {
    console.error('Failed to load scenarios from localStorage:', err);
    return getDefaultScenarios();
  }
}

export function saveScenarios(scenarios: SavedScenario[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch (err) {
    console.error('Failed to save scenarios to localStorage:', err);
  }
}

export function saveScenario(
  name: string,
  params: SimulationParams,
  history: TimeSeriesPoint[],
  peakConc: number,
  totalMass: number
): SavedScenario {
  const scenarios = loadSavedScenarios();
  const newScenario: SavedScenario = {
    id: 'scen_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim() || `Scenario ${scenarios.length + 1}`,
    createdAt: new Date().toISOString(),
    params: JSON.parse(JSON.stringify(params)),
    snapshot: history.slice(-50), // keep last 50 points for charts
    peakConc,
    totalMass,
  };
  scenarios.unshift(newScenario);
  saveScenarios(scenarios);
  return newScenario;
}

export function deleteScenario(id: string): SavedScenario[] {
  const scenarios = loadSavedScenarios().filter(s => s.id !== id);
  saveScenarios(scenarios);
  return scenarios;
}

export function duplicateScenario(id: string): SavedScenario[] {
  const scenarios = loadSavedScenarios();
  const target = scenarios.find(s => s.id === id);
  if (!target) return scenarios;

  const copy: SavedScenario = {
    ...target,
    id: 'scen_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: `${target.name} (Copy)`,
    createdAt: new Date().toISOString(),
  };
  scenarios.unshift(copy);
  saveScenarios(scenarios);
  return scenarios;
}

export function loadUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error('Failed to save user preferences:', err);
  }
}

// Built-in presets for initial state
export function getDefaultScenarios(): SavedScenario[] {
  return [
    {
      id: 'preset-single-industrial',
      name: 'Single Industrial Stack',
      createdAt: '2026-10-29T10:00:00Z',
      params: {
        grid: { nx: 60, ny: 60, dx: 1.0, dy: 1.0, width: 60, height: 60 },
        wind: { ux: 2.2, uy: 0.8, speed: 2.34, directionDeg: 70 },
        diffusion: 0.6,
        dt: 0.1,
        sources: [{ id: 'src-1', x: 15, y: 30, rate: 25.0, label: 'Factory Stack A', color: '#FFFFFF' }],
        duration: 40,
        animationSpeed: 2,
      },
      snapshot: [],
      peakConc: 48.5,
      totalMass: 1000.0,
    },
    {
      id: 'preset-traffic-corridor',
      name: 'Highway Traffic Corridor',
      createdAt: '2026-10-29T10:05:00Z',
      params: {
        grid: { nx: 60, ny: 60, dx: 1.0, dy: 1.0, width: 60, height: 60 },
        wind: { ux: 0.5, uy: 2.5, speed: 2.55, directionDeg: 11 },
        diffusion: 0.4,
        dt: 0.1,
        sources: [
          { id: 'src-t1', x: 20, y: 15, rate: 10.0, label: 'Corridor South', color: '#F2DF54' },
          { id: 'src-t2', x: 25, y: 25, rate: 12.0, label: 'Corridor Mid', color: '#F2DF54' },
          { id: 'src-t3', x: 30, y: 35, rate: 15.0, label: 'Corridor North', color: '#F2DF54' },
        ],
        duration: 40,
        animationSpeed: 2,
      },
      snapshot: [],
      peakConc: 34.2,
      totalMass: 1480.0,
    },
    {
      id: 'preset-calm-inversion',
      name: 'Low-Wind Inversion Event',
      createdAt: '2026-10-29T10:10:00Z',
      params: {
        grid: { nx: 60, ny: 60, dx: 1.0, dy: 1.0, width: 60, height: 60 },
        wind: { ux: 0.2, uy: 0.1, speed: 0.22, directionDeg: 63 },
        diffusion: 1.2,
        dt: 0.1,
        sources: [
          { id: 'src-inv1', x: 30, y: 30, rate: 30.0, label: 'City Core', color: '#D93434' },
        ],
        duration: 40,
        animationSpeed: 2,
      },
      snapshot: [],
      peakConc: 88.7,
      totalMass: 1200.0,
    },
  ];
}
