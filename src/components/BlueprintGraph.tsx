import React, { useMemo, useId, useState, useCallback, useRef, useEffect } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

type PinType = 'exec' | 'bool' | 'int' | 'float' | 'string' | 'vector' | 'rotator' | 'object' | 'class' | 'name' | 'text' | 'struct' | 'wildcard' | 'transform' | 'byte' | 'enum' | 'delegate' | 'array';
type NodeStyle = 'function' | 'event' | 'pure' | 'macro' | 'variable-get' | 'variable-set' | 'branch' | 'comment' | 'cast' | 'sequence' | 'for-each' | 'select';

interface Pin {
  id: string;
  label: string;
  type: PinType;
  side: 'input' | 'output';
  value?: string;
  connected?: boolean;
}

interface BlueprintNode {
  id: string;
  title: string;
  subtitle?: string;
  style?: NodeStyle;
  x: number;
  y: number;
  width?: number;
  height?: number;
  pins: Pin[];
  compact?: boolean;
}

interface Wire {
  from: { node: string; pin: string };
  to: { node: string; pin: string };
}

interface BlueprintGraphProps {
  nodes: BlueprintNode[];
  wires: Wire[];
  title?: string;
  height?: number;
}

// ── Colors (UE5-accurate) ─────────────────────────────────────────────────

const PIN_COLORS: Record<string, string> = {
  exec: '#ffffff', bool: '#900000', byte: '#006D6B', int: '#1CC7A0',
  float: '#A3D44C', string: '#F0A0C8', name: '#C8A0D8', text: '#DC90B8',
  vector: '#FFC107', rotator: '#9370DB', transform: '#F28B22', object: '#0070E0',
  class: '#6038A0', struct: '#0077FF', enum: '#006C7F', delegate: '#FF3838',
  wildcard: '#808080', array: '#808080',
};

const HEADER_GRADIENTS: Record<string, [string, string]> = {
  'function': ['#2a6aaa', '#1b4a7a'], 'event': ['#b01010', '#7b0000'],
  'pure': ['#4a8b45', '#3a6b35'], 'macro': ['#8b7b5a', '#6b5b3a'],
  'variable-get': ['#3a8b5a', '#2a6b3a'], 'variable-set': ['#3a8b5a', '#2a6b3a'],
  'branch': ['#7b7b7b', '#555555'], 'sequence': ['#7b7b7b', '#555555'],
  'for-each': ['#7b7b7b', '#555555'], 'cast': ['#2b8b7a', '#1b6b5a'],
  'select': ['#7b7b7b', '#555555'],
};

const NODE_ICONS: Record<string, { path: string; fill: string; stroke: string }> = {
  event:          { path: 'M8,1 A7,7 0 1,1 8,15 A7,7 0 1,1 8,1 Z', fill: '#ff4444', stroke: 'none' },
  function:       { path: 'M2,2 L7,2 L7,7 L2,7 Z M9,2 L14,2 L14,7 L9,7 Z M2,9 L7,9 L7,14 L2,14 Z M9,9 L14,9 L14,14 L9,14 Z', fill: 'none', stroke: '#ddd' },
  pure:           { path: 'M2,2 L7,2 L7,7 L2,7 Z M9,2 L14,2 L14,7 L9,7 Z M2,9 L7,9 L7,14 L2,14 Z M9,9 L14,9 L14,14 L9,14 Z', fill: 'none', stroke: '#8fd88f' },
  macro:          { path: 'M3,4 L13,4 M3,8 L13,8 M3,12 L13,12 M5,2 L5,14 M11,2 L11,14', fill: 'none', stroke: '#ddd' },
  'variable-get': { path: 'M3,8 Q3,4 8,4 Q13,4 13,8 Q13,12 8,12 Q3,12 3,8 Z M6,8 A2,2 0 1,1 10,8 A2,2 0 1,1 6,8 Z', fill: 'none', stroke: '#8fd88f' },
  'variable-set': { path: 'M8,2 L8,11 M5,8 L8,12 L11,8 M3,14 L13,14', fill: 'none', stroke: '#8fd88f' },
  branch:         { path: 'M8,2 L14,8 L8,14 L2,8 Z', fill: 'none', stroke: '#ddd' },
  cast:           { path: 'M3,8 L10,8 M7,5 L10,8 L7,11 M12,3 L12,13', fill: 'none', stroke: '#5fd8c8' },
  sequence:       { path: 'M2,3 L14,3 M2,8 L14,8 M2,13 L14,13', fill: 'none', stroke: '#ddd' },
  'for-each':     { path: 'M2,3 L14,3 M2,8 L14,8 M2,13 L14,13 M10,6 L13,8 L10,10', fill: 'none', stroke: '#ddd' },
  select:         { path: 'M8,2 L14,8 L8,14 L2,8 Z', fill: 'none', stroke: '#ddd' },
};

// ── Helpers ────────────────────────────────────────────────────────────────

const NODE_MIN_WIDTH = 200;
const PIN_HEIGHT = 26;
const HEADER_HEIGHT = 30;
const PIN_RADIUS = 6.5;
const EXEC_PIN_W = 11;
const EXEC_PIN_H = 13;
const PADDING = 40;

function getNodeHeight(node: BlueprintNode): number {
  if (node.style === 'comment') return node.height || 200;
  const inputPins = node.pins.filter(p => p.side === 'input');
  const outputPins = node.pins.filter(p => p.side === 'output');
  const maxPins = Math.max(inputPins.length, outputPins.length, 1);
  return HEADER_HEIGHT + maxPins * PIN_HEIGHT + 12;
}

function getNodeWidth(node: BlueprintNode): number {
  if (node.style === 'comment') return node.width || Math.max(320, node.title.length * 9);
  const titleLen = node.title.length * 8.5 + 60;
  const maxPinLabel = Math.max(
    ...node.pins.map(p => p.label.length * 7.2 + (p.value ? p.value.length * 6.8 + 36 : 0) + 36),
    0
  );
  return Math.max(NODE_MIN_WIDTH, titleLen, maxPinLabel + 70);
}

function computeBounds(nodes: BlueprintNode[]) {
  if (!nodes.length) return { x: 0, y: 0, w: 800, h: 400 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nodes) {
    const w = getNodeWidth(n);
    const h = getNodeHeight(n);
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x + w > maxX) maxX = n.x + w;
    if (n.y + h > maxY) maxY = n.y + h;
  }
  return {
    x: minX - PADDING,
    y: minY - PADDING,
    w: maxX - minX + PADDING * 2,
    h: maxY - minY + PADDING * 2,
  };
}

function getPinPosition(node: BlueprintNode, pinId: string): { x: number; y: number } {
  const pin = node.pins.find(p => p.id === pinId);
  if (!pin) return { x: node.x, y: node.y };
  const sameSidePins = node.pins.filter(p => p.side === pin.side);
  const idx = sameSidePins.indexOf(pin);
  const w = getNodeWidth(node);
  return {
    x: pin.side === 'input' ? node.x : node.x + w,
    y: node.y + HEADER_HEIGHT + idx * PIN_HEIGHT + PIN_HEIGHT / 2 + 5,
  };
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ExecPinShape({ x, y, side, connected }: { x: number; y: number; side: 'input' | 'output'; connected?: boolean }) {
  const dx = side === 'input' ? 0 : -EXEC_PIN_W;
  const points = [
    `${x + dx},${y - EXEC_PIN_H / 2}`,
    `${x + dx + EXEC_PIN_W * 0.7},${y - EXEC_PIN_H / 2}`,
    `${x + dx + EXEC_PIN_W},${y}`,
    `${x + dx + EXEC_PIN_W * 0.7},${y + EXEC_PIN_H / 2}`,
    `${x + dx},${y + EXEC_PIN_H / 2}`,
  ].join(' ');
  return <polygon points={points} fill={connected ? '#ffffff' : 'none'} stroke="#ffffff" strokeWidth={1.5} />;
}

function DataPinShape({ x, y, side, type, connected }: { x: number; y: number; side: 'input' | 'output'; type: PinType; connected?: boolean }) {
  const color = PIN_COLORS[type] || '#888';
  const cx = side === 'input' ? x + PIN_RADIUS : x - PIN_RADIUS;
  return <circle cx={cx} cy={y} r={PIN_RADIUS} fill={connected ? color : 'none'} stroke={color} strokeWidth={1.5} />;
}

function NodePin({ pin, x, y, nodeWidth: nw }: { pin: Pin; x: number; y: number; nodeWidth: number }) {
  const isExec = pin.type === 'exec';
  const pinX = pin.side === 'input' ? x + 13 : x + nw - 13;
  const textX = pin.side === 'input' ? x + 32 : x + nw - 32;
  const anchor = pin.side === 'input' ? 'start' : 'end';
  const color = PIN_COLORS[pin.type] || '#888';
  return (
    <g>
      {isExec
        ? <ExecPinShape x={pinX} y={y} side={pin.side} connected={pin.connected} />
        : <DataPinShape x={pinX} y={y} side={pin.side} type={pin.type} connected={pin.connected} />}
      {pin.label && (
        <text x={textX} y={y + 4} fill={isExec ? '#ddd' : color} fontSize={11} fontFamily="system-ui, sans-serif" textAnchor={anchor} opacity={0.92}>
          {pin.label}
        </text>
      )}
      {pin.value && pin.side === 'input' && !pin.connected && (
        <g>
          <rect x={x + 32 + (pin.label ? pin.label.length * 6.8 + 10 : 0)} y={y - 10}
            width={pin.value.length * 7 + 16} height={20} rx={4}
            fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
          <text x={x + 32 + (pin.label ? pin.label.length * 6.8 + 10 : 0) + 8} y={y + 4}
            fill="#aaa" fontSize={10.5} fontFamily="JetBrains Mono, monospace">
            {pin.value}
          </text>
        </g>
      )}
    </g>
  );
}

function NodeIcon({ style, x, y }: { style: string; x: number; y: number }) {
  const d = NODE_ICONS[style];
  if (!d) return null;
  return (
    <svg x={x} y={y} width={14} height={14} viewBox="0 0 16 16" overflow="visible">
      <path d={d.path} fill={d.fill} stroke={d.stroke} strokeWidth={d.stroke !== 'none' ? 1.5 : 0} />
    </svg>
  );
}

function CommentNode({ node }: { node: BlueprintNode }) {
  const w = getNodeWidth(node), h = getNodeHeight(node), bannerH = 28;
  return (
    <g>
      <rect x={node.x} y={node.y} width={w} height={h} rx={6} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      <rect x={node.x} y={node.y} width={w} height={bannerH} rx={6} fill="rgba(255,255,255,0.06)" />
      <rect x={node.x} y={node.y + bannerH - 6} width={w} height={6} fill="rgba(255,255,255,0.06)" />
      <line x1={node.x} y1={node.y + bannerH} x2={node.x + w} y2={node.y + bannerH} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      <text x={node.x + 10} y={node.y + 18} fill="rgba(255,255,255,0.6)" fontSize={13} fontFamily="system-ui, sans-serif" fontWeight={400}>{node.title}</text>
    </g>
  );
}

function BlueprintNodeEl({ node, uid, onPointerDown }: { node: BlueprintNode; uid: string; onPointerDown: (e: React.PointerEvent, id: string) => void }) {
  if (node.style === 'comment') return null;
  const w = getNodeWidth(node), h = getNodeHeight(node);
  const style = node.style || 'function';
  const gradId = `hg-${style}-${uid}`;
  const hasGrad = HEADER_GRADIENTS[style];
  const headerFill = hasGrad ? `url(#${gradId})` : '#1b4a7a';
  const hasIcon = !!NODE_ICONS[style];
  const titleX = hasIcon ? node.x + 28 : node.x + 14;
  const inputPins = node.pins.filter(p => p.side === 'input');
  const outputPins = node.pins.filter(p => p.side === 'output');
  return (
    <g filter={`url(#nsh-${uid})`} style={{ cursor: 'grab' }}
      onPointerDown={e => onPointerDown(e, node.id)}>
      <rect x={node.x} y={node.y} width={w} height={h} rx={8} fill="#2A2A2A" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
      <rect x={node.x} y={node.y} width={w} height={HEADER_HEIGHT} rx={8} fill={headerFill} />
      <rect x={node.x} y={node.y + HEADER_HEIGHT - 8} width={w} height={8} fill={headerFill} />
      <line x1={node.x} y1={node.y + HEADER_HEIGHT} x2={node.x + w} y2={node.y + HEADER_HEIGHT} stroke="rgba(0,0,0,0.4)" strokeWidth={1} />
      {hasIcon && <NodeIcon style={style} x={node.x + 9} y={node.y + (HEADER_HEIGHT - 14) / 2} />}
      <text x={titleX} y={node.y + 20} fill="#fff" fontSize={12.5} fontFamily="system-ui, sans-serif" fontWeight={600}>{node.title}</text>
      {node.subtitle && <text x={node.x + w - 10} y={node.y + 20} fill="rgba(255,255,255,0.35)" fontSize={9.5} textAnchor="end">{node.subtitle}</text>}
      {inputPins.map((pin, i) => <NodePin key={pin.id} pin={pin} x={node.x} y={node.y + HEADER_HEIGHT + i * PIN_HEIGHT + PIN_HEIGHT / 2 + 5} nodeWidth={w} />)}
      {outputPins.map((pin, i) => <NodePin key={pin.id} pin={pin} x={node.x} y={node.y + HEADER_HEIGHT + i * PIN_HEIGHT + PIN_HEIGHT / 2 + 5} nodeWidth={w} />)}
    </g>
  );
}

function WireEl({ wire, nodes }: { wire: Wire; nodes: BlueprintNode[] }) {
  const fromNode = nodes.find(n => n.id === wire.from.node);
  const toNode = nodes.find(n => n.id === wire.to.node);
  if (!fromNode || !toNode) return null;
  const fromPos = getPinPosition(fromNode, wire.from.pin);
  const toPos = getPinPosition(toNode, wire.to.pin);
  const fromPin = fromNode.pins.find(p => p.id === wire.from.pin);
  const isExec = fromPin?.type === 'exec';
  const color = isExec ? '#ffffff' : (PIN_COLORS[fromPin?.type || 'wildcard'] || '#888');
  const dx = Math.abs(toPos.x - fromPos.x) * 0.5;
  const d = `M ${fromPos.x} ${fromPos.y} C ${fromPos.x + dx} ${fromPos.y}, ${toPos.x - dx} ${toPos.y}, ${toPos.x} ${toPos.y}`;
  return <path d={d} fill="none" stroke={color} strokeWidth={isExec ? 3.5 : 2.2} opacity={0.75} />;
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function BlueprintGraph({
  nodes: initialNodes,
  wires,
  title,
  height: propHeight,
}: BlueprintGraphProps): React.ReactElement {
  const uid = useId().replace(/:/g, '');
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mutable node positions (for dragging)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  // Pan & zoom state
  const [viewBox, setViewBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const panRef = useRef<{ isPanning: boolean; startX: number; startY: number; startVB: { x: number; y: number; w: number; h: number } }>({ isPanning: false, startX: 0, startY: 0, startVB: { x: 0, y: 0, w: 0, h: 0 } });
  const dragRef = useRef<{ nodeId: string | null; startX: number; startY: number; origX: number; origY: number }>({ nodeId: null, startX: 0, startY: 0, origX: 0, origY: 0 });

  // Apply position overrides to nodes
  const liveNodes = useMemo(() =>
    initialNodes.map(n => ({
      ...n,
      x: nodePositions[n.id]?.x ?? n.x,
      y: nodePositions[n.id]?.y ?? n.y,
    })),
    [initialNodes, nodePositions]
  );

  // Mark connected pins
  const processedNodes = useMemo(() => {
    const connectedPins = new Set<string>();
    wires.forEach(w => {
      connectedPins.add(`${w.from.node}.${w.from.pin}`);
      connectedPins.add(`${w.to.node}.${w.to.pin}`);
    });
    return liveNodes.map(n => ({
      ...n,
      pins: (n.pins || []).map(p => ({
        ...p,
        connected: connectedPins.has(`${n.id}.${p.id}`) || p.connected,
      })),
    }));
  }, [liveNodes, wires]);

  // Compute initial viewBox from node bounds
  const initialBounds = useMemo(() => computeBounds(initialNodes), [initialNodes]);

  useEffect(() => {
    setViewBox(initialBounds);
  }, [initialBounds]);

  const vb = viewBox || initialBounds;
  const displayHeight = propHeight || Math.max(300, Math.min(500, vb.h));

  // Convert screen coords to SVG coords
  const screenToSVG = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const scaleX = vb.w / rect.width;
    const scaleY = vb.h / rect.height;
    return {
      x: vb.x + (clientX - rect.left) * scaleX,
      y: vb.y + (clientY - rect.top) * scaleY,
    };
  }, [vb]);

  // Node drag
  const onNodePointerDown = useCallback((e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const svgPt = screenToSVG(e.clientX, e.clientY);
    const node = liveNodes.find(n => n.id === nodeId);
    if (!node) return;
    dragRef.current = { nodeId, startX: svgPt.x, startY: svgPt.y, origX: node.x, origY: node.y };
    const onMove = (me: PointerEvent) => {
      const pt = screenToSVG(me.clientX, me.clientY);
      const dx = pt.x - dragRef.current.startX;
      const dy = pt.y - dragRef.current.startY;
      setNodePositions(prev => ({
        ...prev,
        [nodeId]: { x: dragRef.current.origX + dx, y: dragRef.current.origY + dy },
      }));
    };
    const onUp = () => {
      dragRef.current.nodeId = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [screenToSVG, liveNodes]);

  // Pan
  const onCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    if (dragRef.current.nodeId) return;
    panRef.current = { isPanning: true, startX: e.clientX, startY: e.clientY, startVB: { ...vb } };
    const onMove = (me: PointerEvent) => {
      if (!panRef.current.isPanning) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = panRef.current.startVB.w / rect.width;
      const scaleY = panRef.current.startVB.h / rect.height;
      const dx = (me.clientX - panRef.current.startX) * scaleX;
      const dy = (me.clientY - panRef.current.startY) * scaleY;
      setViewBox({
        ...panRef.current.startVB,
        x: panRef.current.startVB.x - dx,
        y: panRef.current.startVB.y - dy,
      });
    };
    const onUp = () => {
      panRef.current.isPanning = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [vb]);

  // Zoom (scroll wheel)
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;
    setViewBox(prev => {
      const v = prev || initialBounds;
      const nw = v.w * factor;
      const nh = v.h * factor;
      return {
        x: v.x + (v.w - nw) * mx,
        y: v.y + (v.h - nh) * my,
        w: nw,
        h: nh,
      };
    });
  }, [initialBounds]);

  const commentNodes = processedNodes.filter(n => n.style === 'comment');
  const regularNodes = processedNodes.filter(n => n.style !== 'comment');

  const gradientDefs = Object.entries(HEADER_GRADIENTS).map(([style, [top, bot]]) => (
    <linearGradient key={style} id={`hg-${style}-${uid}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={top} />
      <stop offset="100%" stopColor={bot} />
    </linearGradient>
  ));

  return (
    <div ref={containerRef} style={{ margin: '16px 0', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
      {title && (
        <div style={{
          background: '#1a1a1a', padding: '6px 12px', fontSize: '0.8rem',
          fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' as const,
          letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>Blueprint<span style={{ opacity: 0.5, marginLeft: 8 }}>{'\u2014'} {title}</span></span>
          <span style={{ fontSize: '0.7rem', opacity: 0.35 }}>Scroll to zoom · Drag to pan · Drag nodes to move</span>
        </div>
      )}
      <svg
        ref={svgRef}
        width="100%"
        height={displayHeight}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        style={{ background: '#1a1a1f', display: 'block', cursor: 'grab' }}
        onPointerDown={onCanvasPointerDown}
        onWheel={onWheel}
      >
        <defs>
          <pattern id={`gs-${uid}`} width={16} height={16} patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={0.5} />
          </pattern>
          <pattern id={`gl-${uid}`} width={80} height={80} patternUnits="userSpaceOnUse">
            <rect width={80} height={80} fill={`url(#gs-${uid})`} />
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />
          </pattern>
          <filter id={`nsh-${uid}`} x="-15%" y="-15%" width="140%" height="140%">
            <feDropShadow dx={2} dy={3} stdDeviation={4} floodColor="#000" floodOpacity={0.55} />
          </filter>
          {gradientDefs}
        </defs>
        <rect x={vb.x - 1000} y={vb.y - 1000} width={vb.w + 2000} height={vb.h + 2000} fill={`url(#gl-${uid})`} />

        {commentNodes.map(n => <CommentNode key={n.id} node={n} />)}
        {wires.map((w, i) => <WireEl key={i} wire={w} nodes={processedNodes} />)}
        {regularNodes.map(n => <BlueprintNodeEl key={n.id} node={n} uid={uid} onPointerDown={onNodePointerDown} />)}
      </svg>
    </div>
  );
}
