// BreezeLab – Simulation Context and State Store
//
// Manages global simulation execution, numerical stepping loop,
// parameter mutations, and synchronization across all pages.

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import type {
  SimulationState,
  SimulationParams,
  GridPoint,
  TimeSeriesPoint,
  EmissionSource,
} from '../simulation/simulationTypes';
import { createGrid, idx } from '../simulation/grid';
import { stepSolver, checkStability } from '../simulation/solver';
import { integrateConcentration } from '../mathematics/integration';
import { loadSavedScenarios, saveScenario } from './persistence';

interface SimulationContextType {
  state: SimulationState;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  stepSimulationOnce: () => void;
  updateParams: (params: Partial<SimulationParams>) => void;
  updateWind: (speed: number, directionDeg: number) => void;
  addSource: (x: number, y: number, rate?: number, label?: string) => void;
  updateSource: (id: string, updates: Partial<EmissionSource>) => void;
  removeSource: (id: string) => void;
  clearSources: () => void;
  setSelectedPoint: (pt: GridPoint | null) => void;
  loadScenarioById: (id: string) => void;
  saveCurrentScenario: (name: string) => void;
}

const DEFAULT_PARAMS: SimulationParams = {
  grid: {
    nx: 60,
    ny: 60,
    dx: 1.0,
    dy: 1.0,
    width: 60,
    height: 60,
  },
  wind: {
    ux: 1.5,
    uy: 0.5,
    speed: Math.hypot(1.5, 0.5),
    directionDeg: 71.5, // clockwise from north
  },
  diffusion: 0.8,
  dt: 0.1,
  sources: [
    {
      id: 'src-default-1',
      x: 18,
      y: 30,
      rate: 35.0,
      label: 'Main Stack',
      color: '#FFFFFF',
    },
  ],
  duration: 60,
  animationSpeed: 2,
};

function initSimulationState(): SimulationState {
  const { nx, ny } = DEFAULT_PARAMS.grid;
  return {
    C: createGrid(nx, ny),
    t: 0,
    step: 0,
    params: DEFAULT_PARAMS,
    history: [{ t: 0, totalMass: 0, avgConc: 0, maxConc: 0, selectedConc: 0 }],
    isRunning: false,
    isComplete: false,
    selectedPoint: { col: 25, row: 30 },
  };
}

type SimulationAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'TICK_STEP'; newC: Float64Array; newT: number; historyPoint: TimeSeriesPoint }
  | { type: 'UPDATE_PARAMS'; updates: Partial<SimulationParams> }
  | { type: 'SET_SELECTED_POINT'; pt: GridPoint | null }
  | { type: 'LOAD_PARAMS'; params: SimulationParams }
  | { type: 'SET_WARNING'; msg?: string };

function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'START':
      return { ...state, isRunning: true, isComplete: false };
    case 'PAUSE':
      return { ...state, isRunning: false };
    case 'RESET': {
      const { nx, ny } = state.params.grid;
      return {
        ...state,
        C: createGrid(nx, ny),
        t: 0,
        step: 0,
        isRunning: false,
        isComplete: false,
        history: [{ t: 0, totalMass: 0, avgConc: 0, maxConc: 0, selectedConc: 0 }],
        warningMessage: undefined,
      };
    }
    case 'TICK_STEP': {
      const isComplete = action.newT >= state.params.duration;
      // Cap history buffer to 200 items for memory stability
      const history = [...state.history, action.historyPoint];
      if (history.length > 200) history.shift();

      return {
        ...state,
        C: action.newC,
        t: action.newT,
        step: state.step + 1,
        history,
        isRunning: isComplete ? false : state.isRunning,
        isComplete,
      };
    }
    case 'UPDATE_PARAMS': {
      const newParams = { ...state.params, ...action.updates };
      // Check stability
      const stab = checkStability(newParams);
      // If grid changed in dimension, reset C
      const gridChanged =
        newParams.grid.nx !== state.params.grid.nx || newParams.grid.ny !== state.params.grid.ny;
      const C = gridChanged ? createGrid(newParams.grid.nx, newParams.grid.ny) : state.C;

      return {
        ...state,
        C,
        params: newParams,
        warningMessage: stab.message,
      };
    }
    case 'SET_SELECTED_POINT':
      return { ...state, selectedPoint: action.pt };
    case 'LOAD_PARAMS': {
      const { nx, ny } = action.params.grid;
      return {
        ...state,
        C: createGrid(nx, ny),
        t: 0,
        step: 0,
        params: action.params,
        isRunning: false,
        isComplete: false,
        history: [{ t: 0, totalMass: 0, avgConc: 0, maxConc: 0, selectedConc: 0 }],
      };
    }
    case 'SET_WARNING':
      return { ...state, warningMessage: action.msg };
    default:
      return state;
  }
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(simulationReducer, undefined, initSimulationState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const animFrameRef = useRef<number | null>(null);

  // Single step execution
  const executeStep = () => {
    const cur = stateRef.current;
    if (cur.isComplete) return;

    try {
      const nextC = stepSolver(cur.C, cur.params);
      const nextT = Number((cur.t + cur.params.dt).toFixed(4));

      const { nx, ny, dx, dy } = cur.params.grid;
      const summary = integrateConcentration(nextC, nx, ny, dx, dy);

      let selVal = 0;
      if (cur.selectedPoint) {
        const { col, row } = cur.selectedPoint;
        if (col >= 0 && col < nx && row >= 0 && row < ny) {
          selVal = nextC[idx(col, row, nx)];
        }
      }

      const point: TimeSeriesPoint = {
        t: nextT,
        totalMass: summary.totalMass,
        avgConc: summary.averageConcentration,
        maxConc: summary.maxConcentration,
        selectedConc: selVal,
      };

      dispatch({
        type: 'TICK_STEP',
        newC: nextC,
        newT: nextT,
        historyPoint: point,
      });
    } catch (err: any) {
      console.error('Solver calculation error:', err);
      dispatch({ type: 'PAUSE' });
      dispatch({ type: 'SET_WARNING', msg: `Simulation halted: ${err.message}` });
    }
  };

  // Animation rAF loop
  useEffect(() => {
    if (!state.isRunning) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let isSubscribed = true;

    const loop = () => {
      if (!isSubscribed) return;
      if (stateRef.current.isRunning && !stateRef.current.isComplete) {
        // Run configured animation steps per frame
        const stepsPerFrame = Math.max(1, Math.min(10, stateRef.current.params.animationSpeed));
        for (let s = 0; s < stepsPerFrame; s++) {
          if (stateRef.current.isComplete) break;
          executeStep();
        }
      }
      if (stateRef.current.isRunning && !stateRef.current.isComplete) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      isSubscribed = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [state.isRunning]);

  // Context API methods
  const startSimulation = () => dispatch({ type: 'START' });
  const pauseSimulation = () => dispatch({ type: 'PAUSE' });
  const resetSimulation = () => dispatch({ type: 'RESET' });
  const stepSimulationOnce = () => executeStep();

  const updateParams = (updates: Partial<SimulationParams>) => {
    dispatch({ type: 'UPDATE_PARAMS', updates });
  };

  const updateWind = (speed: number, directionDeg: number) => {
    // Meteorological to Cartesian: 0° is North (wind from North blows South), 90° is East
    // Or standard vector angle: let's map directionDeg so 0° blows East, 90° blows North
    // Standard math angle θ:
    const rad = (directionDeg * Math.PI) / 180;
    const ux = speed * Math.cos(rad);
    const uy = speed * Math.sin(rad);

    dispatch({
      type: 'UPDATE_PARAMS',
      updates: {
        wind: {
          speed,
          directionDeg,
          ux,
          uy,
        },
      },
    });
  };

  const addSource = (x: number, y: number, rate = 30, label = 'Emission Source') => {
    const newSrc: EmissionSource = {
      id: 'src_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      x,
      y,
      rate,
      label,
      color: '#FFFFFF',
    };
    dispatch({
      type: 'UPDATE_PARAMS',
      updates: {
        sources: [...state.params.sources, newSrc],
      },
    });
  };

  const updateSource = (id: string, updates: Partial<EmissionSource>) => {
    const updated = state.params.sources.map(s => (s.id === id ? { ...s, ...updates } : s));
    dispatch({
      type: 'UPDATE_PARAMS',
      updates: { sources: updated },
    });
  };

  const removeSource = (id: string) => {
    dispatch({
      type: 'UPDATE_PARAMS',
      updates: {
        sources: state.params.sources.filter(s => s.id !== id),
      },
    });
  };

  const clearSources = () => {
    dispatch({
      type: 'UPDATE_PARAMS',
      updates: { sources: [] },
    });
  };

  const setSelectedPoint = (pt: GridPoint | null) => {
    dispatch({ type: 'SET_SELECTED_POINT', pt });
  };

  const loadScenarioById = (id: string) => {
    const scenarios = loadSavedScenarios();
    const found = scenarios.find(s => s.id === id);
    if (found) {
      dispatch({ type: 'LOAD_PARAMS', params: found.params });
    }
  };

  const saveCurrentScenario = (name: string) => {
    const cur = stateRef.current;
    const { nx, ny, dx, dy } = cur.params.grid;
    const summary = integrateConcentration(cur.C, nx, ny, dx, dy);
    saveScenario(name, cur.params, cur.history, summary.maxConcentration, summary.totalMass);
  };

  return (
    <SimulationContext.Provider
      value={{
        state,
        startSimulation,
        pauseSimulation,
        resetSimulation,
        stepSimulationOnce,
        updateParams,
        updateWind,
        addSource,
        updateSource,
        removeSource,
        clearSources,
        setSelectedPoint,
        loadScenarioById,
        saveCurrentScenario,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = (): SimulationContextType => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
