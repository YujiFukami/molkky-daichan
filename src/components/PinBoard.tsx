import { useMemo, useRef, useState } from 'react';
import { PIN_R, VIEW_H, VIEW_W } from '../domain/board';
import { easeSinglePin } from '../domain/heuristic';
import type { Pin } from '../domain/types';
import { useGameStore } from '../store/gameStore';

const TAP_MOVE_THRESHOLD_SQ = 1.5;
const ZOOM_MIN = 0.45;
const ZOOM_MAX = 1.0;
const ZOOM_STEP = 0.05;

const PIN_FONT_SIZE = 4;
const HALO_R = PIN_R + 1.6;
const FALLEN_STROKE_W = 0.6;
const PIN_STROKE_W = 0.6;
const DRAG_STROKE_W = 1.2;
const EASE_FONT_SIZE = 3;
const EASE_OFFSET = PIN_R + 1.5;

interface DragState {
  pinId: number;
  hasMoved: boolean;
}

export function PinBoard() {
  const board = useGameStore((s) => s.board);
  const highlightedPinIds = useGameStore((s) => s.highlightedPinIds);
  const movePin = useGameStore((s) => s.movePin);
  const togglePinStanding = useGameStore((s) => s.togglePinStanding);

  const [zoom, setZoom] = useState<number>(ZOOM_MAX);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const visibleW = VIEW_W / zoom;
  const visibleH = VIEW_H / zoom;
  const offsetX = (visibleW - VIEW_W) / 2;
  const offsetY = visibleH - VIEW_H;
  const viewBox = `${-offsetX} ${-offsetY} ${visibleW} ${visibleH}`;

  const eases = useMemo(() => {
    const result = new Map<number, number>();
    const standing = board.pins.filter((p) => p.isStanding);
    for (const pin of standing) {
      const others = standing.filter((p) => p.id !== pin.id);
      result.set(pin.id, easeSinglePin(pin, others));
    }
    return result;
  }, [board.pins]);

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
    <div>
      <div className="flex items-center justify-between gap-2 px-1 mb-1.5">
        <button
          type="button"
          onClick={() => setIsHidden((v) => !v)}
          className="text-xs px-3 py-1 rounded-lg bg-stone-200 text-stone-700 font-bold shrink-0"
        >
          {isHidden ? '▼ ピン盤を表示' : '▲ ピン盤を非表示'}
        </button>
        {!isHidden && (
          <button
            type="button"
            onClick={() => setZoom(ZOOM_MAX)}
            className="text-xs text-stone-500 underline shrink-0"
            aria-label="ズームをリセット"
          >
            ズームリセット
          </button>
        )}
      </div>

      {!isHidden && (
        <>
          <div className="flex items-center gap-2 px-1 mb-1.5">
            <span className="text-xs text-stone-500 shrink-0">広域</span>
            <input
              type="range"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={ZOOM_STEP}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-molkky-green"
              aria-label="ズーム"
            />
            <span className="text-xs text-stone-500 shrink-0">標準</span>
          </div>

          <svg
            ref={svgRef}
            viewBox={viewBox}
            className="block w-full h-auto rounded-2xl shadow-md select-none touch-none"
            style={{ background: '#e8d5b1' }}
          >
            {board.pins.map((pin) => (
              <PinShape
                key={pin.id}
                pin={pin}
                ease={eases.get(pin.id)}
                highlighted={highlightedPinIds.includes(pin.id)}
                isDragging={drag?.pinId === pin.id && drag.hasMoved}
                onPointerDown={(e) => onPointerDown(e, pin.id)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerEnd}
                onPointerCancel={onPointerEnd}
              />
            ))}
          </svg>
        </>
      )}
    </div>
  );
}

function easeColor(ease: number): string {
  if (ease >= 0.7) return '#15803d';
  if (ease >= 0.4) return '#b45309';
  return '#b91c1c';
}

interface PinShapeProps {
  pin: Pin;
  ease: number | undefined;
  highlighted: boolean;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent<SVGElement>) => void;
  onPointerMove: (e: React.PointerEvent<SVGElement>) => void;
  onPointerUp: (e: React.PointerEvent<SVGElement>) => void;
  onPointerCancel: (e: React.PointerEvent<SVGElement>) => void;
}

function PinShape({
  pin,
  ease,
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
  const showEase = pin.isStanding && ease !== undefined;

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
          r={HALO_R}
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
          strokeWidth={FALLEN_STROKE_W}
          opacity={0.6}
        />
      )}
      <circle
        cx={pin.x}
        cy={pin.y}
        r={PIN_R}
        fill={fill}
        stroke={stroke}
        strokeWidth={isDragging ? DRAG_STROKE_W : PIN_STROKE_W}
        opacity={opacity}
      />
      <text
        x={pin.x}
        y={pin.y + 0.2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={PIN_FONT_SIZE}
        fontWeight="900"
        fill={pin.isStanding ? 'white' : '#8a8273'}
        style={{ pointerEvents: 'none' }}
      >
        {pin.id}
      </text>
      {showEase && (
        <text
          x={pin.x}
          y={pin.y + EASE_OFFSET}
          textAnchor="middle"
          dominantBaseline="hanging"
          fontSize={EASE_FONT_SIZE}
          fontWeight="900"
          fill={easeColor(ease!)}
          paintOrder="stroke"
          stroke="white"
          strokeWidth={EASE_FONT_SIZE * 0.4}
          strokeLinejoin="round"
          style={{ pointerEvents: 'none' }}
        >
          {Math.round(ease! * 100)}%
        </text>
      )}
    </g>
  );
}
