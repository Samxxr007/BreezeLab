// BreezeLab – Interactive Simulation Canvas Component
//
// Handles user interaction:
//   - Click to inspect local concentration
//   - Double-click or Shift-click to add an emission source
//   - Responsive canvas auto-sizing via ResizeObserver

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSimulation } from '../../state/simulationStore';
import { renderSimulationCanvas, getInterpolatedColor } from './canvasRenderer';
import { Eye, Wind, Layers, Grid, PlusCircle } from 'lucide-react';

interface SimulationCanvasProps {
  interactive?: boolean;
  className?: string;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  interactive = true,
  className = '',
}) => {
  const { state, setSelectedPoint, addSource } = useSimulation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Visualization toggles
  const [showVectors, setShowVectors] = useState(true);
  const [showSources, setShowSources] = useState(true);
  const [showGridLines, setShowGridLines] = useState(true);
  const [addSourceMode, setAddSourceMode] = useState(false);

  // Re-draw canvas whenever simulation state or toggles change
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderSimulationCanvas(ctx, canvas.width, canvas.height, state, {
      showVectors,
      showSources,
      showGridLines,
      showCoordinates: true,
      highlightPoint: state.selectedPoint,
    });
  }, [state, showVectors, showSources, showGridLines]);

  // Handle Resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (canvasRef.current && width > 0 && height > 0) {
          // Set internal canvas resolution
          canvasRef.current.width = Math.floor(width);
          canvasRef.current.height = Math.floor(height);
          draw();
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Canvas Click Handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const xPix = e.clientX - rect.left;
    const yPix = e.clientY - rect.top;

    const { nx, ny } = state.params.grid;
    const col = Math.floor((xPix / canvas.width) * nx);
    const row = Math.floor(((canvas.height - yPix) / canvas.height) * ny);

    if (col >= 0 && col < nx && row >= 0 && row < ny) {
      if (addSourceMode || e.shiftKey) {
        addSource(col, row, 30, `Source (${col}, ${row})`);
        setAddSourceMode(false);
      } else {
        setSelectedPoint({ col, row });
      }
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#142326] rounded-lg border border-[#2C4140] overflow-hidden ${className}`}>
      {/* Canvas Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0F191B] border-b border-[#2C4140] text-xs text-[#9EB3AC]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#F4F8F6] uppercase tracking-wider">
            Spatial Field Display
          </span>
          <span className="text-[#9EB3AC] px-1.5 py-0.5 rounded bg-[#18272A] border border-[#2C4140]">
            {state.params.grid.nx} × {state.params.grid.ny} Cells
          </span>
        </div>

        {interactive && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAddSourceMode(!addSourceMode)}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                addSourceMode
                  ? 'bg-[#35B8A5] text-[#0F191B] font-medium'
                  : 'bg-[#18272A] text-[#D7F5E9] hover:bg-[#2C4140]'
              }`}
              title="Click to activate source placement mode"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{addSourceMode ? 'Click Canvas to Add' : 'Add Source'}</span>
            </button>

            <button
              onClick={() => setShowVectors(!showVectors)}
              className={`p-1.5 rounded transition-colors ${
                showVectors ? 'bg-[#35B8A5]/20 text-[#35B8A5]' : 'bg-[#18272A] text-[#9EB3AC]'
              }`}
              title="Toggle Wind Vectors"
            >
              <Wind className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowSources(!showSources)}
              className={`p-1.5 rounded transition-colors ${
                showSources ? 'bg-[#35B8A5]/20 text-[#35B8A5]' : 'bg-[#18272A] text-[#9EB3AC]'
              }`}
              title="Toggle Emission Sources"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowGridLines(!showGridLines)}
              className={`p-1.5 rounded transition-colors ${
                showGridLines ? 'bg-[#35B8A5]/20 text-[#35B8A5]' : 'bg-[#18272A] text-[#9EB3AC]'
              }`}
              title="Toggle Grid Lines"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Canvas Viewport */}
      <div ref={containerRef} className="relative flex-1 w-full min-h-[350px] cursor-crosshair">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full block"
        />

        {/* Vertical Color Scale Legend */}
        <div className="absolute right-3 top-3 bottom-12 w-9 bg-[#142326]/90 border border-[#2C4140] rounded flex flex-col items-center justify-between py-2 text-[10px] text-[#9EB3AC] pointer-events-none select-none">
          <span className="font-mono font-bold text-[#D7F5E9]">
            {Math.max(...state.history.map(h => h.maxConc)).toFixed(0)}
          </span>
          <div
            className="w-2.5 flex-1 mx-auto my-1 rounded"
            style={{
              background: `linear-gradient(to top, 
                #163B70 0%, 
                #1677A7 20%, 
                #29B9B7 40%, 
                #F2DF54 60%, 
                #F59E35 80%, 
                #D93434 100%)`,
            }}
          />
          <span className="font-mono">0</span>
        </div>
      </div>
    </div>
  );
};
