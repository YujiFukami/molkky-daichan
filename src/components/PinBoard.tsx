import { useRef, useState } from 'react';
import {
  PIN_R,
  THROWING_LINE_Y,
  THROWER,
  VIEW_H,
  VIEW_W,
} from '../domain/board';
import type { Pin } from '../domain/types';
import { useGameStore } from '../store/gameStore';

const TAP_MOVE_THRESHOLD_SQ = 1.5;

interface DragState {
  pinId: number;
  hasMoved: boolean;
}

export function PinBoard() {
  const board = useGameStore((s) => s.board);
  const highlightedPinIds = useGameStore((s) => s.highlightedPinIds);
  const movePin = useGameStore((s) => s.movePin);
  const togglePinStanding = useGameStore((s) => s.togglePinStanding);

  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const eventToSvg = (
    clientX: number,
    clientY: number,
  ): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const t = pt.matrixTransform(ctm.inverse());
    return { x: t.x, y: t.y };
  };

  const onPointerDown = (e: React.PointerEvent<SVGElement>, pinId: number) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const { x, y } = eventToSvg(e.clientX, e.clientY);
    dragStartRef.current = { x, y };
    setDrag({ pinId, hasMoved: false });
  };

  const onPointerMove = (e: React.PointerEvent<SVGElement>) => {
    if (!drag || !dragStartRef.current) return;
    const { x, y } = eventToSvg(e.clientX, e.clientY);
    const dx = x - dragStartRef.current.x;
    const dy = y - dragStartRef.current.y;
    const moved = dx * dx + dy * dy >= TAP_MOVE_THRESHOLD_SQ;
    if (moved) {
      if (!drag.hasMoved) setDrag({ ...drag, hasMoved: true });
      movePin(drag.pinId, x, y);
    }
  };

  const onPointerEnd = (e: React.PointerEvent<SVGElement>) => {
    if (!drag) return;
    if (!drag.hasMoved) togglePinStanding(drag.pinId);
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    setDrag(null);
    dragStartRef.current = null;
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="block w-full h-auto rounded-2xl shadow-md select-none touch-none"
      style={{ background: '#e8d5b1' }}
    >
      <line
        x1={5}
        y1={THROWING_LINE_Y}
        x2={VIEW_W - 5}
        y2={THROWING_LINE_Y}
        stroke="#8a5a2b"
        strokeWidth={0.6}
        strokeDasharray="2 2"
      />
      <text
        x={VIEW_W / 2}
        y={THROWING_LINE_Y + 5}
        textAnchor="middle"
        fontSize={3}
        fill="#8a5a2b"
        fontWeight="bold"
      >
        投擲ライン
      </text>
      <circle cx={THROWER.x} cy={THROWER.y} r={1} fill="#8a5a2b" />

      {board.pins.map((pin) => (
        <PinShape
          key={pin.id}
          pin={pin}
          highlighted={highlightedPinIds.includes(pin.id)}
          isDragging={drag?.pinId === pin.id && drag.hasMoved}
          onPointerDown={(e) => onPointerDown(e, pin.id)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        />
      ))}
    </svg>
  );
}

interface PinShapeProps {
  pin: Pin;
  highlighted: boolean;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent<SVGElement>) => void;
  onPointerMove: (e: React.PointerEvent<SVGElement>) => void;
  onPointerUp: (e: React.PointerEvent<SVGElement>) => void;
  onPointerCancel: (e: React.PointerEvent<SVGElement>) => void;
}

function PinShape({
  pin,
  highlighted,
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: PinShapeProps) {
  const fill = pin.isStanding ? '#c98e57' : '#bcb09a';
  const stroke = pin.isStanding ? '#7c4a1c' : '#8a8273';
  const opacity = pin.isStanding ? 1 : 0.55;

  return (
    <g
      style={{ cursor: 'grab' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {highlighted && (
        <circle
          cx={pin.x}
          cy={pin.y}
          r={PIN_R + 1.6}
          fill="none"
          stroke="#f5b400"
          strokeWidth={1.2}
          opacity={0.95}
        />
      )}
      {!pin.isStanding && (
        <line
          x1={pin.x - PIN_R}
          y1={pin.y - PIN_R}
          x2={pin.x + PIN_R}
          y2={pin.y + PIN_R}
          stroke="#8a8273"
          strokeWidth={0.6}
          opacity={0.6}
        />
      )}
      <circle
        cx={pin.x}
        cy={pin.y}
        r={PIN_R}
        fill={fill}
        stroke={stroke}
        strokeWidth={isDragging ? 1.2 : 0.6}
        opacity={opacity}
      />
      <text
        x={pin.x}
        y={pin.y + 0.2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={4}
        fontWeight="900"
        fill={pin.isStanding ? 'white' : '#8a8273'}
        style={{ pointerEvents: 'none' }}
      >
        {pin.id}
      </text>
    </g>
  );
}
