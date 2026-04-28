import { THROWER, distance } from './board';
import type { BoardState, Pin } from './types';

const MIN_DIST = 50;
const MAX_DIST = 220;
const CLUSTER_RADIUS = 9;
const MAX_CLUSTER_SIZE = 4;

const LANE_WIDTH = 10;
const BEHIND_REF = 25;
const FRONT_BLOCK_FACTOR = 0.55;

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function distanceFactor(target: { x: number; y: number }): number {
  const d = distance(target, THROWER);
  return clamp01((MAX_DIST - d) / (MAX_DIST - MIN_DIST));
}

function trajectoryRisk(target: Pin, other: Pin): number {
  const dx = target.x - THROWER.x;
  const dy = target.y - THROWER.y;
  const targetDist = Math.hypot(dx, dy);
  if (targetDist < 0.001) return 0;

  const dirX = dx / targetDist;
  const dirY = dy / targetDist;

  const px = other.x - THROWER.x;
  const py = other.y - THROWER.y;
  const t = px * dirX + py * dirY;
  if (t < 0) return 0;

  const lat = Math.abs(px * dirY - py * dirX);
  const inLane = clamp01(1 - lat / LANE_WIDTH);
  if (inLane <= 0) return 0;

  if (t < targetDist) {
    return inLane * FRONT_BLOCK_FACTOR;
  }

  const behindDist = t - targetDist;
  const behindFactor = clamp01(1 - behindDist / BEHIND_REF);
  return inLane * behindFactor;
}

export function easeSinglePin(target: Pin, otherStanding: Pin[]): number {
  const distFactor = distanceFactor(target);
  if (otherStanding.length === 0) return distFactor;

  let safetyProduct = 1;
  for (const other of otherStanding) {
    const r = trajectoryRisk(target, other);
    safetyProduct *= 1 - r;
  }

  return distFactor * safetyProduct;
}

export function easeCluster(cluster: Pin[]): number {
  const cx = cluster.reduce((s, p) => s + p.x, 0) / cluster.length;
  const cy = cluster.reduce((s, p) => s + p.y, 0) / cluster.length;
  const centroid = { x: cx, y: cy };
  const distFactor = distanceFactor(centroid);
  const maxSpread = Math.max(...cluster.map((p) => distance(p, centroid)));
  const tightnessFactor = clamp01(1 - maxSpread / (CLUSTER_RADIUS * 0.7));
  const sizeDiscount = Math.pow(0.7, cluster.length - 2);
  return distFactor * tightnessFactor * sizeDiscount;
}

function findClusters(
  standing: Pin[],
  maxRadius: number,
  maxSize: number,
): Pin[][] {
  const result: Pin[][] = [];
  const expand = (current: Pin[], remaining: Pin[]) => {
    if (current.length >= 2) {
      result.push([...current]);
    }
    if (current.length >= maxSize) return;
    for (let i = 0; i < remaining.length; i++) {
      const next = remaining[i];
      const fits = current.every((p) => distance(p, next) <= maxRadius);
      if (fits) {
        expand([...current, next], remaining.slice(i + 1));
      }
    }
  };
  for (let i = 0; i < standing.length; i++) {
    expand([standing[i]], standing.slice(i + 1));
  }
  return result;
}

export interface Strategy {
  type: 'single' | 'multiple';
  pinIds: number[];
  gain: number;
  ease: number;
  resultingScore: number;
  isWinningMove: boolean;
  isOvershoot: boolean;
  utility: number;
  expectedValue: number;
}

export function generateStrategies(
  board: BoardState,
  currentScore: number,
  winningScore: number,
  rollbackScore: number,
): Strategy[] {
  const standing = board.pins.filter((p) => p.isStanding);
  const raw: Array<Pick<Strategy, 'type' | 'pinIds' | 'gain' | 'ease'>> = [];

  for (const pin of standing) {
    const others = standing.filter((p) => p.id !== pin.id);
    raw.push({
      type: 'single',
      pinIds: [pin.id],
      gain: pin.id,
      ease: easeSinglePin(pin, others),
    });
  }

  const clusters = findClusters(standing, CLUSTER_RADIUS, MAX_CLUSTER_SIZE);
  for (const cluster of clusters) {
    raw.push({
      type: 'multiple',
      pinIds: cluster.map((p) => p.id).sort((a, b) => a - b),
      gain: cluster.length,
      ease: easeCluster(cluster),
    });
  }

  const scored: Strategy[] = raw.map((c) => {
    const newScore = currentScore + c.gain;
    let resultingScore: number;
    let isWinningMove = false;
    let isOvershoot = false;
    if (newScore === winningScore) {
      resultingScore = winningScore;
      isWinningMove = true;
    } else if (newScore > winningScore) {
      resultingScore = rollbackScore;
      isOvershoot = true;
    } else {
      resultingScore = newScore;
    }

    let utility: number;
    if (isWinningMove) {
      utility = 100;
    } else if (isOvershoot) {
      utility = -(currentScore - rollbackScore);
    } else {
      utility = c.gain;
    }

    return {
      ...c,
      resultingScore,
      isWinningMove,
      isOvershoot,
      utility,
      expectedValue: c.ease * utility,
    };
  });

  return scored.sort((a, b) => b.expectedValue - a.expectedValue);
}
