// BreezeLab – Canvas Renderer
//
// Renders the 2-D pollution concentration heatmap, velocity vector field,
// emission sources, grid coordinates, tracer particles, and colorbar scale.
//
// Sequential visual palette:
//   Stop 1: #163B70 (Deep Blue)
//   Stop 2: #1677A7 (Ocean Blue)
//   Stop 3: #29B9B7 (Teal / Cyan)
//   Stop 4: #F2DF54 (Yellow)
//   Stop 5: #F59E35 (Orange)
//   Stop 6: #D93434 (Crimson Red)

import type { SimulationState, GridPoint } from '../../simulation/simulationTypes';
import { idx } from '../../simulation/grid';

const COLOR_STOPS = [
  { r: 0x16, g: 0x3b, b: 0x70 }, // #163B70
  { r: 0x16, g: 0x77, b: 0xa7 }, // #1677A7
  { r: 0x29, g: 0xb9, b: 0xb7 }, // #29B9B7
  { r: 0xf2, g: 0xdf, b: 0x54 }, // #F2DF54
  { r: 0xf5, g: 0x9e, b: 0x35 }, // #F59E35
  { r: 0xd9, g: 0x34, b: 0x34 }, // #D93434
];

export interface RenderOptions {
  showVectors: boolean;
  showSources: boolean;
  showGridLines: boolean;
  showCoordinates: boolean;
  colorScaleMax?: number;
  highlightPoint?: GridPoint | null;
}

/**
 * Maps a normalized scalar t in [0, 1] to an interpolated RGB string.
 */
export function getInterpolatedColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const segment = clamped * (COLOR_STOPS.length - 1);
  const idxLow = Math.floor(segment);
  const idxHigh = Math.min(COLOR_STOPS.length - 1, idxLow + 1);
  const frac = segment - idxLow;

  const c1 = COLOR_STOPS[idxLow];
  const c2 = COLOR_STOPS[idxHigh];

  const r = Math.round(c1.r + (c2.r - c1.r) * frac);
  const g = Math.round(c1.g + (c2.g - c1.g) * frac);
  const b = Math.round(c1.b + (c2.b - c1.b) * frac);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Draws the complete simulation scene onto the HTML5 Canvas.
 */
export function renderSimulationCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  simState: SimulationState,
  options: RenderOptions
): void {
  const { C, params, selectedPoint, t } = simState;
  const { nx, ny } = params.grid;

  // 1. Dark simulation background
  ctx.fillStyle = '#0F191B';
  ctx.fillRect(0, 0, width, height);

  if (nx <= 0 || ny <= 0) return;

  const cellW = width / nx;
  const cellH = height / ny;

  // Find max concentration for dynamic normalization
  let maxConc = options.colorScaleMax ?? 0;
  if (!options.colorScaleMax) {
    for (let i = 0; i < C.length; i++) {
      if (C[i] > maxConc) maxConc = C[i];
    }
  }
  const normBase = maxConc > 1e-4 ? maxConc : 10.0;

  // 2. Render Concentration Heatmap
  for (let r = 0; r < ny; r++) {
    // Invert row so row 0 is bottom (Cartesian origin at bottom-left)
    const yCanvas = height - (r + 1) * cellH;
    for (let c = 0; c < nx; c++) {
      const xCanvas = c * cellW;
      const val = C[idx(c, r, nx)];

      if (val > 1e-5) {
        const norm = Math.min(1, val / normBase);
        ctx.fillStyle = getInterpolatedColor(norm);
        // Slightly overlap cell rects by 0.5px to eliminate seam gaps
        ctx.fillRect(xCanvas, yCanvas, cellW + 0.5, cellH + 0.5);
      }
    }
  }

  // 3. Grid Lines
  if (options.showGridLines && cellW > 6) {
    ctx.strokeStyle = 'rgba(44, 65, 64, 0.45)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    // Vertical grid
    const colStep = Math.max(1, Math.floor(nx / 12));
    for (let c = 0; c <= nx; c += colStep) {
      const x = c * cellW;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    // Horizontal grid
    const rowStep = Math.max(1, Math.floor(ny / 12));
    for (let r = 0; r <= ny; r += rowStep) {
      const y = height - r * cellH;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }

  // 4. Wind Velocity Field Arrows
  if (options.showVectors && params.wind.speed > 0.01) {
    const { ux, uy, speed } = params.wind;
    const arrowSpacing = Math.max(28, Math.min(50, width / 14));
    const angle = Math.atan2(-uy, ux); // canvas y is inverted
    const arrowLen = Math.min(arrowSpacing * 0.75, 12 + speed * 4);

    ctx.strokeStyle = 'rgba(215, 245, 233, 0.65)';
    ctx.fillStyle = 'rgba(215, 245, 233, 0.85)';
    ctx.lineWidth = 1.2;

    for (let x = arrowSpacing / 2; x < width; x += arrowSpacing) {
      for (let y = arrowSpacing / 2; y < height; y += arrowSpacing) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(-arrowLen / 2, 0);
        ctx.lineTo(arrowLen / 2, 0);
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(arrowLen / 2, 0);
        ctx.lineTo(arrowLen / 2 - 5, -3);
        ctx.lineTo(arrowLen / 2 - 5, 3);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    }
  }

  // 5. Emission Sources
  if (options.showSources && params.sources.length > 0) {
    for (const src of params.sources) {
      const srcX = (src.x + 0.5) * cellW;
      const srcY = height - (src.y + 0.5) * cellH;

      // Pulsing outer halo
      ctx.beginPath();
      ctx.arc(srcX, srcY, 11, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fill();

      // Main source circle
      ctx.beginPath();
      ctx.arc(srcX, srcY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = src.color || '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#0F191B';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#F4F8F6';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(src.label || 'Source', srcX, srcY - 14);
    }
  }

  // 6. Selected Inspection Point Crosshair
  const activePt = options.highlightPoint || selectedPoint;
  if (activePt && activePt.col >= 0 && activePt.col < nx && activePt.row >= 0 && activePt.row < ny) {
    const ptX = (activePt.col + 0.5) * cellW;
    const ptY = height - (activePt.row + 0.5) * cellH;

    ctx.strokeStyle = '#35B8A5';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(ptX, ptY, 9, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(ptX - 14, ptY);
    ctx.lineTo(ptX + 14, ptY);
    ctx.moveTo(ptX, ptY - 14);
    ctx.lineTo(ptX, ptY + 14);
    ctx.stroke();

    // Value tooltip
    const val = C[idx(activePt.col, activePt.row, nx)];
    const text = `(${activePt.col}, ${activePt.row}) : ${val.toFixed(2)}`;
    ctx.font = '11px monospace';
    const textWidth = ctx.measureText(text).width;

    ctx.fillStyle = 'rgba(20, 35, 38, 0.88)';
    ctx.fillRect(ptX + 12, ptY - 22, textWidth + 10, 18);
    ctx.strokeStyle = '#35B8A5';
    ctx.lineWidth = 1;
    ctx.strokeRect(ptX + 12, ptY - 22, textWidth + 10, 18);

    ctx.fillStyle = '#F4F8F6';
    ctx.textAlign = 'left';
    ctx.fillText(text, ptX + 17, ptY - 9);
  }

  // 7. Heads-Up Status Overlay
  ctx.fillStyle = 'rgba(20, 35, 38, 0.85)';
  ctx.fillRect(8, 8, 140, 48);
  ctx.strokeStyle = '#2C4140';
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, 140, 48);

  ctx.fillStyle = '#9EB3AC';
  ctx.font = '10px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SIMULATION TIME', 16, 22);

  ctx.fillStyle = '#35B8A5';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(`${t.toFixed(1)} s`, 16, 42);
}
