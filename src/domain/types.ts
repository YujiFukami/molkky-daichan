export interface Pin {
  id: number;
  x: number;
  y: number;
  isStanding: boolean;
}

export interface BoardState {
  pins: Pin[];
}

export type PlayerId = 'A' | 'B';

export interface Player {
  id: PlayerId;
  name: string;
  score: number;
  consecutiveMisses: number;
  isEliminated: boolean;
}

export type TurnAction =
  | { type: 'miss' }
  | { type: 'singlePin'; pinNumber: number }
  | { type: 'multiplePins'; count: number };

export interface TurnRecord {
  turnNumber: number;
  playerId: PlayerId;
  action: TurnAction;
  scoreBefore: number;
  scoreAfter: number;
  consecutiveMissesAfter: number;
  isWinningTurn: boolean;
  isEliminatingTurn: boolean;
}

export interface GameSettings {
  winningScore: number;
  rollbackScore: number;
  missLimit: number;
  playerNames: Record<PlayerId, string>;
}

export interface GameState {
  players: Record<PlayerId, Player>;
  currentTurn: PlayerId;
  turnNumber: number;
  history: TurnRecord[];
  winner: PlayerId | null;
  isGameOver: boolean;
  settings: GameSettings;
}
