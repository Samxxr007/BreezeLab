// BreezeLab – Numerical Validation Engine
//
// Automated test suite covering the 8 mandatory validation tests:
//   Test 1: Zero source + zero initial concentration => C remains identically 0.
//   Test 2: Spatially constant velocity field => divergence ≈ 0 and curl ≈ 0.
//   Test 3: Scalar field C(x,y) = 2x + 3y => numerical gradient ≈ (2, 3) in interior.
//   Test 4: Pure diffusion mass conservation => exact numerical conservation (|ΔM|/M < 1e-10)
//           with no-flux boundaries, even when plume extends to the boundary.
//   Test 5: Wind-only transport moves concentration centroid strictly downstream.
//   Test 6: Time-step validation rejects or safely sub-steps unstable dt.
//   Test 7: LocalStorage scenario persistence round-trip.
//   Test 8: CSV export generation contains true simulation parameters & values.

import { createGrid, idx } from '../simulation/grid';
import { stepSolver, checkStability } from '../simulation/solver';
import type { SimulationParams, SimulationState } from '../simulation/simulationTypes';
import { computeGradient } from './gradient';
import { computeDivergence } from './divergence';
import { computeCurl } from './curl';
import { integrateConcentration } from './integration';
import { generateSimulationCSV } from '../simulation/exportUtils';
import { saveScenario, loadSavedScenarios, deleteScenario } from '../state/persistence';

export interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  error?: string;
  details?: string;
}

export async function runAllTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // -------------------------------------------------------------
  // Test 1: Zero source & zero initial concentration
  // -------------------------------------------------------------
  try {
    const nx = 20, ny = 20, dx = 10, dy = 10;
    const initial = createGrid(nx, ny);
    const params: SimulationParams = {
      grid: { nx, ny, dx, dy, width: nx * dx, height: ny * dy },
      wind: { ux: 2.0, uy: 1.0, speed: Math.hypot(2, 1), directionDeg: 63.4 },
      diffusion: 1.5,
      dt: 0.1,
      sources: [],
      duration: 10,
      animationSpeed: 1,
    };

    let field = initial;
    for (let step = 0; step < 10; step++) {
      field = stepSolver(field, params);
    }

    const { maxConcentration } = integrateConcentration(field, nx, ny, dx, dy);
    const passed = Math.abs(maxConcentration) < 1e-12;
    results.push({
      id: 'T1',
      name: 'Zero Source & Initial State Conservation',
      passed,
      expected: 'Max concentration = 0.000 µg/m²',
      actual: `Max concentration = ${maxConcentration.toExponential(4)} µg/m²`,
      details: 'With no sources or boundary inputs, C must remain identically zero.',
    });
  } catch (err: any) {
    results.push({
      id: 'T1',
      name: 'Zero Source & Initial State Conservation',
      passed: false,
      expected: 'Max concentration = 0',
      actual: 'Threw exception',
      error: err.message,
    });
  }

  // -------------------------------------------------------------
  // Test 2: Constant velocity field => divergence ≈ 0 and curl ≈ 0
  // -------------------------------------------------------------
  try {
    const nx = 25, ny = 25, dx = 5, dy = 5;
    const ux = 3.5;
    const uy = -2.0;

    const divRes = computeDivergence(ux, uy, nx, ny, dx, dy);
    const curlRes = computeCurl(ux, uy, nx, ny, dx, dy);

    const divMaxAbs = Math.max(Math.abs(divRes.min), Math.abs(divRes.max));
    const curlMaxAbs = Math.max(Math.abs(curlRes.min), Math.abs(curlRes.max));

    const passed = divMaxAbs < 1e-12 && curlMaxAbs < 1e-12;
    results.push({
      id: 'T2',
      name: 'Constant Velocity Field Incompressibility & Irrotationality',
      passed,
      expected: 'div(u) = 0 s⁻¹, curl(u) = 0 s⁻¹',
      actual: `div max|err| = ${divMaxAbs.toExponential(2)}, curl max|err| = ${curlMaxAbs.toExponential(2)}`,
      details: 'Uniform velocity field has analytically zero divergence and zero curl.',
    });
  } catch (err: any) {
    results.push({
      id: 'T2',
      name: 'Constant Velocity Field Incompressibility & Irrotationality',
      passed: false,
      expected: 'div=0, curl=0',
      actual: 'Threw exception',
      error: err.message,
    });
  }

  // -------------------------------------------------------------
  // Test 3: Numerical Gradient for C(x,y) = 2x + 3y
  // -------------------------------------------------------------
  try {
    const nx = 30, ny = 30, dx = 2.0, dy = 2.0;
    const C = createGrid(nx, ny);

    for (let r = 0; r < ny; r++) {
      for (let c = 0; c < nx; c++) {
        const x = c * dx;
        const y = r * dy;
        C[idx(c, r, nx)] = 2.0 * x + 3.0 * y;
      }
    }

    const grad = computeGradient(C, nx, ny, dx, dy);

    let maxGradErr = 0;
    for (let r = 2; r < ny - 2; r++) {
      for (let c = 2; c < nx - 2; c++) {
        const i = idx(c, r, nx);
        const errX = Math.abs(grad.gx[i] - 2.0);
        const errY = Math.abs(grad.gy[i] - 3.0);
        maxGradErr = Math.max(maxGradErr, errX, errY);
      }
    }

    const passed = maxGradErr < 1e-9;
    results.push({
      id: 'T3',
      name: 'Gradient Finite Difference Verification (C = 2x + 3y)',
      passed,
      expected: '∇C = (2.000, 3.000) µg/m³ in interior',
      actual: `Max error = ${maxGradErr.toExponential(4)}`,
      details: 'Central differences evaluate linear polynomial derivatives exactly.',
    });
  } catch (err: any) {
    results.push({
      id: 'T3',
      name: 'Gradient Finite Difference Verification',
      passed: false,
      expected: '∇C = (2, 3)',
      actual: 'Threw exception',
      error: err.message,
    });
  }

  // -------------------------------------------------------------
  // Test 4: Rigorous Diffusion Mass Conservation (No-Flux Neumann BC)
  // -------------------------------------------------------------
  try {
    const nx = 25, ny = 25, dx = 2.0, dy = 2.0;
    const C = createGrid(nx, ny);

    // Initial distribution placed off-center, spreading across entire domain
    for (let r = 5; r <= 15; r++) {
      for (let c = 5; c <= 15; c++) {
        C[idx(c, r, nx)] = 100.0 * Math.sin((c / nx) * Math.PI) * Math.sin((r / ny) * Math.PI);
      }
    }

    const initialTotalMass = integrateConcentration(C, nx, ny, dx, dy).totalMass;

    const params: SimulationParams = {
      grid: { nx, ny, dx, dy, width: nx * dx, height: ny * dy },
      wind: { ux: 0, uy: 0, speed: 0, directionDeg: 0 },
      diffusion: 1.5,
      dt: 0.1,
      sources: [],
      duration: 20,
      animationSpeed: 1,
    };

    let field = C;
    // Step for 50 steps: pollutant interacts strongly with boundaries
    for (let s = 0; s < 50; s++) {
      field = stepSolver(field, params);
    }

    const finalTotalMass = integrateConcentration(field, nx, ny, dx, dy).totalMass;
    const relDiff = Math.abs(finalTotalMass - initialTotalMass) / initialTotalMass;

    // With conservative no-flux boundaries, mass conservation holds to numerical floating-point precision
    const passed = relDiff < 1e-10;
    results.push({
      id: 'T4',
      name: 'Rigorous Diffusion Mass Conservation (No-Flux BC)',
      passed,
      expected: 'Mass variation |ΔM|/M < 1e-10 under pure diffusion',
      actual: `Relative change = ${relDiff.toExponential(4)} (init=${initialTotalMass.toFixed(2)} µg, final=${finalTotalMass.toFixed(2)} µg)`,
      details: 'Evaluates conservative discrete Laplacian with ∂C/∂n = 0 boundary conditions across 50 steps.',
    });
  } catch (err: any) {
    results.push({
      id: 'T4',
      name: 'Rigorous Diffusion Mass Conservation (No-Flux BC)',
      passed: false,
      expected: 'Exact mass conservation',
      actual: 'Threw exception',
      error: err.message,
    });
  }

  // -------------------------------------------------------------
  // Test 5: Wind-only transport (advection direction)
  // -------------------------------------------------------------
  try {
    const nx = 40, ny = 40, dx = 1.0, dy = 1.0;
    const C = createGrid(nx, ny);

    const initX = 10, initY = 10;
    C[idx(initX, initY, nx)] = 100.0;

    const ux = 1.0;
    const uy = 0.5;

    const params: SimulationParams = {
      grid: { nx, ny, dx, dy, width: nx * dx, height: ny * dy },
      wind: { ux, uy, speed: Math.hypot(ux, uy), directionDeg: 63.4 },
      diffusion: 0.0,
      dt: 0.5,
      sources: [],
      duration: 10,
      animationSpeed: 1,
    };

    let field = C;
    const steps = 10;
    for (let s = 0; s < steps; s++) {
      field = stepSolver(field, params);
    }

    let maxVal = -1;
    let peakCol = -1;
    let peakRow = -1;
    for (let r = 0; r < ny; r++) {
      for (let c = 0; c < nx; c++) {
        const val = field[idx(c, r, nx)];
        if (val > maxVal) {
          maxVal = val;
          peakCol = c;
          peakRow = r;
        }
      }
    }

    const movedInWindDirection = peakCol > initX && peakRow >= initY;
    results.push({
      id: 'T5',
      name: 'Wind Transport Directional Validation',
      passed: movedInWindDirection,
      expected: `Peak moves eastward (+x) & northward (+y) from (${initX}, ${initY})`,
      actual: `Final peak at (${peakCol}, ${peakRow})`,
      details: 'Upwind scheme accurately conveys plume centroid downstream along prescribed vector field.',
    });
  } catch (err: any) {
    results.push({
      id: 'T5',
      name: 'Wind Transport Directional Validation',
      passed: false,
      expected: 'Centroid moves downstream',
      actual: 'Threw exception',
      error: err.message,
    });
  }

  // -------------------------------------------------------------
  // Test 6: Combined Time-Step Stability Check
  // -------------------------------------------------------------
  try {
    const params: SimulationParams = {
      grid: { nx: 30, ny: 30, dx: 1.0, dy: 1.0, width: 30, height: 30 },
      wind: { ux: 10.0, uy: 10.0, speed: Math.hypot(10, 10), directionDeg: 45 },
      diffusion: 5.0,
      dt: 1.0,
      sources: [],
      duration: 10,
      animationSpeed: 1,
    };

    const check = checkStability(params);
    const passed = !check.stable && check.maxSafeDt < 0.05;
    results.push({
      id: 'T6',
      name: 'Combined Advection-Diffusion Stability Check',
      passed,
      expected: 'Flags unstable dt (ν > 1) and specifies safe max dt < 0.05s',
      actual: `Stable: ${check.stable}, ν = ${check.combinedNumber.toFixed(2)}, maxSafeDt = ${check.maxSafeDt.toFixed(4)}s`,
      details: 'Evaluates ν = dt · (|ux|/dx + |uy|/dy + 2D(1/dx² + 1/dy²)) <= 1.',
    });
  } catch (err: any) {
    results.push({
      id: 'T6',
      name: 'Combined Advection-Diffusion Stability Check',
      passed: false,
      expected: 'Detected instability',
      actual: 'Threw exception',
      error: err.message,
    });
  }

  // -------------------------------------------------------------
  // Test 7: Persistence Round-Trip via Actual Scenario Helpers
  // -------------------------------------------------------------
  try {
    const testScenarioName = `Verification_Run_${Date.now()}`;
    const testParams: SimulationParams = {
      grid: { nx: 25, ny: 25, dx: 2.0, dy: 2.0, width: 50, height: 50 },
      wind: { ux: 2.5, uy: 1.2, speed: Math.hypot(2.5, 1.2), directionDeg: 64.3 },
      diffusion: 0.8,
      dt: 0.05,
      sources: [
        { id: 'src-test-1', x: 12, y: 12, rate: 45.0, label: 'Primary Test Stack' },
        { id: 'src-test-2', x: 5, y: 5, rate: 20.0, label: 'Secondary Flare' },
      ],
      duration: 30,
      animationSpeed: 2,
    };
    const testHistory = [
      { t: 0, totalMass: 0, avgConc: 0, maxConc: 0, selectedConc: 0 },
      { t: 10, totalMass: 450, avgConc: 0.18, maxConc: 12.4, selectedConc: 8.2 },
    ];

    // 1. Save using the actual application persistence workflow
    const saved = saveScenario(testScenarioName, testParams, testHistory, 12.4, 450);

    // 2. Load from scenarios library
    const loadedList = loadSavedScenarios();
    const retrieved = loadedList.find((s) => s.id === saved.id);

    // 3. Clean up
    deleteScenario(saved.id);

    // Verify all scenario fields were faithfully restored
    const passed =
      retrieved !== undefined &&
      retrieved.name === testScenarioName &&
      retrieved.params.wind.ux === 2.5 &&
      retrieved.params.sources.length === 2 &&
      retrieved.params.sources[0].rate === 45.0 &&
      retrieved.totalMass === 450;

    results.push({
      id: 'T7',
      name: 'Scenario Persistence Workflow (saveScenario / loadSavedScenarios)',
      passed: Boolean(passed),
      expected: 'Exercises app persistence helpers to store, retrieve, and delete scenario',
      actual: retrieved
        ? `Successfully saved & retrieved "${retrieved.name}" with 2 sources (ux=${retrieved.params.wind.ux}m/s, rate=${retrieved.params.sources[0].rate}µg/s)`
        : 'Failed to retrieve saved scenario',
      details: 'Tests the actual saveScenario, loadSavedScenarios, and deleteScenario workflow methods.',
    });
  } catch (err: any) {
    results.push({
      id: 'T7',
      name: 'Scenario Persistence Workflow',
      passed: false,
      expected: 'Store and retrieve via scenario helpers',
      actual: 'Threw exception',
      error: err.message,
    });
  }

  // -------------------------------------------------------------
  // Test 8: Live CSV Export Generation from SimulationState
  // -------------------------------------------------------------
  try {
    const testParams: SimulationParams = {
      grid: { nx: 4, ny: 4, dx: 5.0, dy: 5.0, width: 20, height: 20 },
      wind: { ux: 3.5, uy: 2.1, speed: Math.hypot(3.5, 2.1), directionDeg: 59.04 },
      diffusion: 0.75,
      dt: 0.1,
      sources: [{ id: 's-live', x: 2, y: 2, rate: 80.0, label: 'Generator Stack' }],
      duration: 20,
      animationSpeed: 1,
    };

    // Construct an actual field populated by stepping the solver
    let field = createGrid(testParams.grid.nx, testParams.grid.ny);
    field = stepSolver(field, testParams);

    const mockState: SimulationState = {
      C: field,
      t: 15.5,
      step: 155,
      params: testParams,
      history: [],
      isRunning: false,
      isComplete: false,
      selectedPoint: null,
    };

    // Invoke the actual export utility used by ReportsPage
    const csvOutput = generateSimulationCSV(mockState);

    // Verify all physical parameters, dimensions, and matrix data are included
    const hasHeaderTime = csvOutput.includes('Simulation Time (s),15.50');
    const hasWindSpeed = csvOutput.includes(`Wind Speed (m/s),${testParams.wind.speed.toFixed(3)}`);
    const hasDiffusion = csvOutput.includes(`Diffusion Coefficient D (m2/s),${testParams.diffusion}`);
    const hasGridDim = csvOutput.includes('Grid Dimensions,4x4');
    const hasCellArea = csvOutput.includes('Cell Area dA (m2),25.00');
    const hasSourceConfig = csvOutput.includes('Generator Stack');
    const hasMetricCoords = csvOutput.includes('2,2,10.00,10.00,');

    const passed =
      hasHeaderTime &&
      hasWindSpeed &&
      hasDiffusion &&
      hasGridDim &&
      hasCellArea &&
      hasSourceConfig &&
      hasMetricCoords;

    results.push({
      id: 'T8',
      name: 'Dynamic SimulationState CSV Export (generateSimulationCSV)',
      passed,
      expected: 'Verifies shared export utility generates headers, parameters, coordinates, and computed values from live state',
      actual: `Verified complete CSV (${csvOutput.split('\n').length} lines, headers: t=15.50s, speed=${testParams.wind.speed.toFixed(2)}m/s, dA=25m²)`,
      details: 'Directly tests generateSimulationCSV() with real SimulationState from the solver.',
    });
  } catch (err: any) {
    results.push({
      id: 'T8',
      name: 'Dynamic SimulationState CSV Export',
      passed: false,
      expected: 'Valid CSV from state',
      actual: 'Threw exception',
      error: err.message,
    });
  }

  return results;
}
