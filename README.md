# BreezeLab: Vector Calculus-Based Air Pollution Dispersion Simulation and Analysis Platform

**Tagline:** Model the flow. Understand the impact.  
**Academic Alignment:** Course Outcome 1 (CO1) — Applied 2-D Vector Calculus (Gradient, Divergence, Curl, Double Integrals) applied to the Advection–Diffusion Partial Differential Equation (PDE).

---

## 1. Project Overview

**BreezeLab** is an interactive environmental modelling platform that simulates how air pollutants disperse through a 2-D atmospheric boundary domain under varying wind conditions. Built with React 19, TypeScript, Tailwind CSS, Lucide icons, Recharts, and custom HTML5 Canvas numerical renderers, BreezeLab operates as an **Environmental Intelligence** scientific modeling workstation.

The application computes real numerical simulations on every step using explicit finite difference approximations — no mock values, no pre-drawn gradient art, and no fabricated static metrics.

---

## 2. Mathematical Foundation & Numerical Engine

### 2.1 The Governing PDE
The Eulerian transport of a continuous scalar pollutant concentration field $C(x, y, t)$ is modeled via the two-dimensional advection–diffusion equation:

$$\frac{\partial C}{\partial t} + \mathbf{u} \cdot \nabla C = D \nabla^2 C + S(x, y, t)$$

Where:
- $C(x, y, t)$: Modeled pollutant concentration (model-units / grid cell).
- $\mathbf{u} = (u_x, u_y)$: Prescribed 2-D horizontal wind velocity field ($\text{m/s}$).
- $D$: Turbulent eddy diffusion coefficient ($\text{m}^2/\text{s}$).
- $S(x, y, t)$: Continuous emission sources injecting mass at specified rates.

### 2.2 Finite Difference Scheme
- **Advection:** First-order upwind difference (direction-dependent backward/forward stencil) ensuring non-oscillatory transport along wind velocity streamlines.
- **Diffusion:** Second-order central difference Laplacian approximation.
- **Time Stepping:** Explicit Forward Euler discretization with automated sub-stepping.

### 2.3 Combined Stability Condition
BreezeLab implements a combined CFL and Von Neumann stability criterion that simultaneously evaluates advection and diffusion limits:

$$\nu = \Delta t \left( \frac{|u_x|}{\Delta x} + \frac{|u_y|}{\Delta y} + 2D \left[\frac{1}{\Delta x^2} + \frac{1}{\Delta y^2}\right] \right) \le 1.0$$

When the requested time-step $\Delta t$ violates stability ($\nu > 1$), the simulation engine automatically subdivides the step into safe sub-steps without user disruption.

### 2.4 Vector Calculus Operators
1. **Concentration Gradient $\nabla C$:** Evaluated via central finite differences away from boundaries. Indicates the local direction and steepness of pollutant fronts.
2. **Velocity Divergence $\nabla \cdot \mathbf{u}$:** Evaluates kinematic compressibility. Evaluates to $0.0000\,\text{s}^{-1}$ everywhere for uniform background fields.
3. **Velocity Curl $(\nabla \times \mathbf{u})_z$:** Measures out-of-plane vorticity and rotational shear ($0.0000\,\text{s}^{-1}$ for irrotational flow).
4. **2-D Quadrature $\iint_\Omega C(x,y,t)\,dA$:** Discrete double Riemann summation estimating total enclosed pollutant mass $M(t)$.

---

## 3. Architecture & Project Structure

```
d:\BreezeLab\
├── src/
│   ├── app/
│   │   └── App.tsx                 # React Router v7 routes
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx       # Persistent shell with sidebar & topbar
│   │   │   ├── Sidebar.tsx         # Navigation drawer & CO1 syllabus footer
│   │   │   └── TopBar.tsx          # Status badge & simulation playback actions
│   │   └── simulation/
│   │       ├── canvasRenderer.ts   # HTML5 Canvas 6-stop sequential heatmap
│   │       └── SimulationCanvas.tsx# Interactive viewport (click inspect, add source)
│   ├── mathematics/
│   │   ├── gradient.ts             # ∇C central differences & magnitude
│   │   ├── divergence.ts           # ∇·u velocity divergence
│   │   ├── curl.ts                 # (∇×u)_z out-of-plane vorticity
│   │   ├── integration.ts          # ∬ C dA 2-D area quadrature
│   │   └── numericalValidation.ts  # 8 automated mathematical verification tests
│   ├── pages/
│   │   ├── OverviewPage.tsx        # KPI metrics, mini canvas preview & sparkline
│   │   ├── SimulationPage.tsx      # Full simulation controls & source editor
│   │   ├── VectorAnalysisPage.tsx  # Tabs for Gradient, Divergence, Curl, Integral
│   │   ├── ReportsPage.tsx         # Recharts time series, CSV export, print report
│   │   ├── ScenariosPage.tsx       # LocalStorage scenario manager (load/duplicate/delete)
│   │   ├── MathematicsPage.tsx     # Curriculum syllabus reference with worked derivations
│   │   └── SettingsPage.tsx        # Grid resolution slider & automated test runner
│   ├── simulation/
│   │   ├── boundaryConditions.ts   # Neumann ∂C/∂n = 0 boundary discretization
│   │   ├── grid.ts                 # Float64Array row-major memory buffers
│   │   ├── solver.ts               # Numerical advection-diffusion time-stepper
│   │   ├── sources.ts              # Bilinear emission source distribution
│   │   └── simulationTypes.ts      # Shared TypeScript data models
│   ├── state/
│   │   ├── persistence.ts          # LocalStorage serialization & presets
│   │   └── simulationStore.tsx     # Global React Context with rAF loop
│   ├── index.css                   # Environmental Intelligence design tokens
│   └── main.tsx                    # Vite entry point
├── package.json
├── vite.config.ts
└── README.md
```

---

## 4. Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/Samxxr007/BreezeLab.git
cd BreezeLab

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to explore BreezeLab.

### Building for Production
```bash
# Run production TypeScript check & Vite build
npm run build

# Preview production build locally
npm run preview
```

---

## 5. Automated Validation Tests

BreezeLab includes an automated test runner accessible via **Settings & Tests** in the navigation menu. The suite verifies:

1. **Test 1:** Zero initial state + zero sources maintains $C \equiv 0$.
2. **Test 2:** Spatially uniform velocity field has $\text{div}(\mathbf{u}) = 0$ and $\text{curl}(\mathbf{u}) = 0$.
3. **Test 3:** Linear field $C(x,y) = 2x + 3y$ evaluates to $\nabla C = (2, 3)$ across interior cells.
4. **Test 4:** Diffusion spreads isolated pollutant mass while conserving discrete area integrals.
5. **Test 5:** Wind transport translates peak concentration centroid downstream.
6. **Test 6:** Unstable $\Delta t$ configurations are flagged by combined stability index $\nu$.
7. **Test 7:** LocalStorage scenario serialization round-trip verification.
8. **Test 8:** CSV export generates complete mathematical headers and physical coordinates.

---

## 6. Academic Disclaimer & Limitations

BreezeLab is an applied mathematics educational capstone workstation demonstrating finite-difference solutions and vector calculus operators in two spatial dimensions. It is not an operational three-dimensional meso-scale meteorological weather prediction model (such as WRF-Chem) and does not ingest live telemetry sensors.
