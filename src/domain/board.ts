import type { BoardState, Pin } from './types';

export const VIEW_W = 100;
export const VIEW_H = 140;
export const VIEW_BOTTOM = 80;
export const PIN_R = 4;
export const THROWER = { x: 50, y: 132 };
export const THROWING_LINE_Y = 128;

export const MIN_X = -70;
export const MAX_X = VIEW_W + 70;
export const MIN_Y = -150;
export const MAX_Y = VIEW_BOTTOM - PIN_R;

const INITIAL_POSITIONS: Record<number, { x: number; y: number }> = {
  7: { x: 40, y: 22 },
  9: { x: 50, y: 22 },
  8: { x: 60, y: 22 },
  5: { x: 35, y: 36 },
  11: { x: 45, y: 36 },
  12: { x: 55, y: 36 },
  6: { x: 65, y: 36 },
  3: { x: 40, y: 50 },
  10: { x: 50, y: 50 },
  4: { x: 60, y: 50 },
  1: { x: 45, y: 64 },
  2: { x: 55, y: 64 },
};

export function createInitialBoard(): BoardState {
  const pins: Pin[] = [];
  for (let i = 1; i <= 12; i++) {
    pins.push({
      id: i,
      x: INITIAL_POSITIONS[i].x,
      y: INITIAL_POSITIONS[i].y,
      isStanding: true,
    });
  }
  return { pins };
}

export function standAllPins(board: BoardState): BoardState {
  return {
    ...board,
    pins: board.pins.map((p) => ({ ...p, isStanding: true })),
  };
}

export function togglePinStanding(board: BoardState, pinId: number): BoardState {
  return {
    ...board,
    pins: board.pins.map((p) =>
      p.id === pinId ? { ...p, isStanding: !p.isStanding } : p,
    ),
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function movePin(
  board: BoardState,
  pinId: number,
  x: number,
  y: number,
): BoardState {
  const cx = clamp(x, MIN_X, MAX_X);
  const cy = clamp(y, MIN_Y, MAX_Y);
  return {
    ...board,
    pins: board.pins.map((p) => (p.id === pinId ? { ...p, x: cx, y: cy } : p)),
  };
}

export function distance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
