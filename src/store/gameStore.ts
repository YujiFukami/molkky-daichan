import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_SETTINGS,
  applyAction,
  createInitialState,
  undoLastAction,
} from '../domain/game';
import {
  createInitialBoard,
  movePin as movePinOnBoard,
  standAllPins,
  togglePinStanding as togglePinStandingOnBoard,
} from '../domain/board';
import type {
  BoardState,
  GameSettings,
  GameState,
  PlayerId,
  TurnAction,
} from '../domain/types';

type TabId = 'game' | 'rules' | 'settings';

interface GameStore {
  state: GameState;
  board: BoardState;
  highlightedPinIds: number[];
  activeTab: TabId;

  setActiveTab: (tab: TabId) => void;

  apply: (action: TurnAction) => void;
  undo: () => void;
  newGame: () => void;

  movePin: (pinId: number, x: number, y: number) => void;
  togglePinStanding: (pinId: number) => void;
  resetBoardPositions: () => void;
  standAllPins: () => void;
  commitFromBoard: () => void;
  setHighlightedPinIds: (ids: number[]) => void;

  updatePlayerName: (id: PlayerId, name: string) => void;
  updateSettings: (patch: Partial<GameSettings>) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      state: createInitialState(),
      board: createInitialBoard(),
      highlightedPinIds: [],
      activeTab: 'game',

      setActiveTab: (tab) => set({ activeTab: tab }),

      apply: (action) =>
        set((store) => ({
          state: applyAction(store.state, action),
          board: standAllPins(store.board),
          highlightedPinIds: [],
        })),

      undo: () => set((store) => ({ state: undoLastAction(store.state) })),

      newGame: () =>
        set((store) => ({
          state: createInitialState(store.state.settings),
          board: createInitialBoard(),
          highlightedPinIds: [],
        })),

      movePin: (pinId, x, y) =>
        set((store) => ({ board: movePinOnBoard(store.board, pinId, x, y) })),

      togglePinStanding: (pinId) =>
        set((store) => ({
          board: togglePinStandingOnBoard(store.board, pinId),
        })),

      resetBoardPositions: () =>
        set(() => ({ board: createInitialBoard(), highlightedPinIds: [] })),

      standAllPins: () =>
        set((store) => ({
          board: standAllPins(store.board),
          highlightedPinIds: [],
        })),

      commitFromBoard: () =>
        set((store) => {
          const fallen = store.board.pins.filter((p) => !p.isStanding);
          let action: TurnAction;
          if (fallen.length === 0) {
            action = { type: 'miss' };
          } else if (fallen.length === 1) {
            action = { type: 'singlePin', pinNumber: fallen[0].id };
          } else {
            action = { type: 'multiplePins', count: fallen.length };
          }
          return {
            state: applyAction(store.state, action),
            board: standAllPins(store.board),
            highlightedPinIds: [],
          };
        }),

      setHighlightedPinIds: (ids) => set({ highlightedPinIds: ids }),

      updatePlayerName: (id, name) =>
        set((store) => {
          const settings: GameSettings = {
            ...store.state.settings,
            playerNames: { ...store.state.settings.playerNames, [id]: name },
          };
          const players = {
            ...store.state.players,
            [id]: { ...store.state.players[id], name },
          };
          return { state: { ...store.state, settings, players } };
        }),

      updateSettings: (patch) =>
        set((store) => {
          const settings: GameSettings = {
            ...store.state.settings,
            ...patch,
            playerNames: {
              ...store.state.settings.playerNames,
              ...(patch.playerNames ?? {}),
            },
          };
          return { state: { ...store.state, settings } };
        }),
    }),
    {
      name: 'molkky-daichan-store',
      version: 3,
      migrate: (persistedState, version) => {
        const ps = persistedState as
          | {
              state?: { settings?: GameSettings };
              board?: BoardState;
            }
          | null;
        if (!ps) return ps as never;
        if (version < 2 && ps.state?.settings) {
          ps.state.settings.missLimit = DEFAULT_SETTINGS.missLimit;
        }
        if (version < 3 && !ps.board) {
          ps.board = createInitialBoard();
        }
        return ps as never;
      },
      partialize: (s) => ({ state: s.state, board: s.board }),
    },
  ),
);

export type { TabId };
