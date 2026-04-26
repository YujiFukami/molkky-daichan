import type {
  GameSettings,
  GameState,
  Player,
  PlayerId,
  TurnAction,
  TurnRecord,
} from './types';

export const DEFAULT_SETTINGS: GameSettings = {
  winningScore: 50,
  rollbackScore: 25,
  missLimit: 3,
  playerNames: { A: 'プレイヤー1', B: 'プレイヤー2' },
};

export function createInitialState(settings: GameSettings = DEFAULT_SETTINGS): GameState {
  const makePlayer = (id: PlayerId, name: string): Player => ({
    id,
    name,
    score: 0,
    consecutiveMisses: 0,
    isEliminated: false,
  });
  return {
    players: {
      A: makePlayer('A', settings.playerNames.A),
      B: makePlayer('B', settings.playerNames.B),
    },
    currentTurn: 'A',
    turnNumber: 1,
    history: [],
    winner: null,
    isGameOver: false,
    settings,
  };
}

export function gainOf(action: TurnAction): number {
  switch (action.type) {
    case 'miss':
      return 0;
    case 'singlePin':
      return action.pinNumber;
    case 'multiplePins':
      return action.count;
  }
}

export function applyScoreRule(
  current: number,
  gain: number,
  winningScore: number,
  rollbackScore: number,
): number {
  const next = current + gain;
  if (next > winningScore) return rollbackScore;
  return next;
}

function nextActivePlayer(state: GameState, fromId: PlayerId): PlayerId {
  const order: PlayerId[] = ['A', 'B'];
  const startIdx = order.indexOf(fromId);
  for (let i = 1; i <= order.length; i++) {
    const candidate = order[(startIdx + i) % order.length];
    if (!state.players[candidate].isEliminated) return candidate;
  }
  return fromId;
}

export function applyAction(state: GameState, action: TurnAction): GameState {
  if (state.isGameOver) return state;

  const playerId = state.currentTurn;
  const player = state.players[playerId];
  if (player.isEliminated) {
    return state;
  }

  const gain = gainOf(action);
  const isMiss = gain === 0;
  const scoreBefore = player.score;
  const scoreAfter = applyScoreRule(
    scoreBefore,
    gain,
    state.settings.winningScore,
    state.settings.rollbackScore,
  );
  const consecutiveMissesAfter = isMiss ? player.consecutiveMisses + 1 : 0;
  const isEliminatingTurn = consecutiveMissesAfter >= state.settings.missLimit;
  const isWinningTurn = scoreAfter === state.settings.winningScore && !isEliminatingTurn;

  const updatedPlayer: Player = {
    ...player,
    score: scoreAfter,
    consecutiveMisses: consecutiveMissesAfter,
    isEliminated: isEliminatingTurn,
  };

  const players: Record<PlayerId, Player> = {
    ...state.players,
    [playerId]: updatedPlayer,
  };

  const turnRecord: TurnRecord = {
    turnNumber: state.turnNumber,
    playerId,
    action,
    scoreBefore,
    scoreAfter,
    consecutiveMissesAfter,
    isWinningTurn,
    isEliminatingTurn,
  };

  let winner: PlayerId | null = null;
  let isGameOver = false;

  if (isWinningTurn) {
    winner = playerId;
    isGameOver = true;
  } else {
    const remaining = (Object.keys(players) as PlayerId[]).filter(
      (id) => !players[id].isEliminated,
    );
    if (remaining.length <= 1) {
      isGameOver = true;
      winner = remaining[0] ?? null;
    }
  }

  const nextTurn = isGameOver
    ? state.currentTurn
    : nextActivePlayer({ ...state, players }, playerId);

  return {
    ...state,
    players,
    history: [...state.history, turnRecord],
    currentTurn: nextTurn,
    turnNumber: isGameOver ? state.turnNumber : state.turnNumber + 1,
    winner,
    isGameOver,
  };
}

export function undoLastAction(state: GameState): GameState {
  if (state.history.length === 0) return state;
  const last = state.history[state.history.length - 1];
  const player = state.players[last.playerId];

  const restoredPlayer: Player = {
    ...player,
    score: last.scoreBefore,
    consecutiveMisses: Math.max(0, last.consecutiveMissesAfter - (gainOf(last.action) === 0 ? 1 : 0)),
    isEliminated: false,
  };

  const players: Record<PlayerId, Player> = {
    ...state.players,
    [last.playerId]: restoredPlayer,
  };

  return {
    ...state,
    players,
    history: state.history.slice(0, -1),
    currentTurn: last.playerId,
    turnNumber: last.turnNumber,
    winner: null,
    isGameOver: false,
  };
}

export function describeAction(action: TurnAction): string {
  switch (action.type) {
    case 'miss':
      return 'ミス';
    case 'singlePin':
      return `${action.pinNumber}番ピン (+${action.pinNumber})`;
    case 'multiplePins':
      return `${action.count}本倒し (+${action.count})`;
  }
}
