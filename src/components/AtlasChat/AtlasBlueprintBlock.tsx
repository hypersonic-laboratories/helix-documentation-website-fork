import React, { useState, useRef, useCallback, useEffect } from 'react';
import BlueprintGraph from '../BlueprintGraph';
import type { ToolCall } from './types';

interface AtlasBlueprintBlockProps {
  toolCall: ToolCall;
}

/**
 * Renders a BlueprintGraph from an Atlas tool_call response.
 * Click to open in a full-screen lightbox with zoom and pan.
 */
export default function AtlasBlueprintBlock({ toolCall }: AtlasBlueprintBlockProps) {
  const { nodes, wires, title, width, height } = toolCall.data as {
    nodes: unknown[];
    wires: unknown[];
    title?: string;
    width?: number;
    height?: number;
  };

  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!nodes || !wires) {
    return (
      <div className="atlas-chat__blueprint-error">
        Failed to render Blueprint graph.
      </div>
    );
  }

  return (
    <>
      {/* Inline preview — click to expand */}
      <div
        className="atlas-chat__blueprint atlas-chat__blueprint--clickable"
        onClick={() => setLightboxOpen(true)}
        title="Click to expand"
      >
        <BlueprintGraph
          nodes={nodes as any}
          wires={wires as any}
          title={title}
          width={width || 600}
          height={height || 300}
        />
        <div className="atlas-chat__blueprint-expand-hint">
          Click to expand &amp; interact
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <BlueprintLightbox
          nodes={nodes}
          wires={wires}
          title={title}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

// ── Lightbox with zoom + pan ──────────────────────────────────────────────

interface BlueprintLightboxProps {
  nodes: unknown[];
  wires: unknown[];
  title?: string;
  onClose: () => void;
}

function BlueprintLightbox({ nodes, wires, title, onClose }: BlueprintLightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Zoom with scroll wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom(z => Math.min(Math.max(z + delta, 0.3), 4));
  }, []);

  // Pan with mouse drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // left click only
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({
      x: panStart.current.x + (e.clientX - dragStart.current.x),
      y: panStart.current.y + (e.clientY - dragStart.current.y),
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Fit to screen
  const handleFit = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Calculate a generous graph size for the lightbox
  const graphWidth = 1200;
  const graphHeight = 700;

  return (
    <div className="atlas-lightbox__overlay" onClick={onClose}>
      <div
        className="atlas-lightbox__container"
        onClick={e => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="atlas-lightbox__toolbar">
          <span className="atlas-lightbox__title">
            {title || 'Blueprint Graph'}
          </span>
          <div className="atlas-lightbox__controls">
            <button
              className="atlas-lightbox__btn"
              onClick={() => setZoom(z => Math.min(z + 0.25, 4))}
              title="Zoom in"
            >
              +
            </button>
            <span className="atlas-lightbox__zoom-label">
              {Math.round(zoom * 100)}%
            </span>
            <button
              className="atlas-lightbox__btn"
              onClick={() => setZoom(z => Math.max(z - 0.25, 0.3))}
              title="Zoom out"
            >
              &minus;
            </button>
            <button
              className="atlas-lightbox__btn"
              onClick={handleFit}
              title="Reset view"
            >
              Fit
            </button>
            <button
              className="atlas-lightbox__btn atlas-lightbox__btn--close"
              onClick={onClose}
              title="Close (Esc)"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="atlas-lightbox__canvas"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        >
          <div
            className="atlas-lightbox__graph"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            <BlueprintGraph
              nodes={nodes as any}
              wires={wires as any}
              title={undefined}
              width={graphWidth}
              height={graphHeight}
            />
          </div>
        </div>

        {/* Help hint */}
        <div className="atlas-lightbox__hint">
          Scroll to zoom &middot; Drag to pan &middot; Esc to close
        </div>
      </div>
    </div>
  );
}
