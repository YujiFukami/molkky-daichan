import { useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PlayerCard } from './PlayerCard';
import { ScoreInput } from './ScoreInput';
import { HistoryList } from './HistoryList';
import { PinBoard } from './PinBoard';
import { StrategyPanel } from './StrategyPanel';

export function GameTab() {
  const state = useGameStore((s) => s.state);
  const board = useGameStore((s) => s.board);
  const apply = useGameStore((s) => s.apply);
  const undo = useGameStore((s) => s.undo);
  const newGame = useGameStore((s) => s.newGame);
  const commitFromBoard = useGameStore((s) => s.commitFromBoard);
  const standAll = useGameStore((s) => s.standAllPins);
  const resetBoard = useGameStore((s) => s.resetBoardPositions);

  const [showManual, setShowManual] = useState(false);

  const winnerName = state.winner ? state.players[state.winner].name : null;

  const fallen = useMemo(
    () => board.pins.filter((p) => !p.isStanding),
    [board.pins],
  );

  const preview = useMemo(() => {
    if (fallen.length === 0) {
      return { label: 'ミス（0点）', gain: 0, tone: 'miss' as const };
    }
    if (fallen.length === 1) {
      const pin = fallen[0];
      return {
        label: `${pin.id}番ピン (+${pin.id})`,
        gain: pin.id,
        tone: 'gain' as const,
      };
    }
    return {
      label: `${fallen.length}本倒し (+${fallen.length})`,
      gain: fallen.length,
      tone: 'gain' as const,
    };
  }, [fallen]);

  return (
    <div className="p-3 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <PlayerCard
          player={state.players.A}
          isCurrent={!state.isGameOver && state.currentTurn === 'A'}
          missLimit={state.settings.missLimit}
          winningScore={state.settings.winningScore}
        />
        <PlayerCard
          player={state.players.B}
          isCurrent={!state.isGameOver && state.currentTurn === 'B'}
          missLimit={state.settings.missLimit}
          winningScore={state.settings.winningScore}
        />
      </div>

      {state.isGameOver ? (
        <div className="card bg-yellow-50 border-2 border-yellow-300 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-lg font-bold text-yellow-800">
            {winnerName ? `${winnerName} の勝ち！` : 'ゲーム終了'}
          </div>
          <button type="button" onClick={newGame} className="btn-primary mt-3 w-full">
            新しいゲームを始める
          </button>
        </div>
      ) : (
        <>
          <div className="text-center text-sm text-stone-600 font-bold">
            ターン #{state.turnNumber}：
            <span className="text-molkky-green">
              {state.players[state.currentTurn].name}
            </span>{' '}
            の投擲
          </div>

          <PinBoard />

          <div className="card">
            <p className="text-xs text-stone-500 leading-relaxed">
              ピンをタップすると倒れた状態に切り替わります。ドラッグで位置調整も可能です。
              倒れたピンの数で得点を自動判定します。
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="text-stone-700">
                <div className="text-xs text-stone-500">確定する内容</div>
                <div
                  className={`text-lg font-extrabold ${
                    preview.tone === 'miss' ? 'text-red-500' : 'text-molkky-green'
                  }`}
                >
                  {preview.label}
                </div>
              </div>
              <button
                type="button"
                className="btn-primary text-base px-5 py-3"
                onClick={commitFromBoard}
              >
                投擲を確定
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={standAll}
                className="btn-secondary text-sm py-2"
              >
                全ピンを立て直す
              </button>
              <button
                type="button"
                onClick={resetBoard}
                className="btn-secondary text-sm py-2"
              >
                初期配置に戻す
              </button>
            </div>
          </div>

          <StrategyPanel />

          <div>
            <button
              type="button"
              onClick={() => setShowManual((v) => !v)}
              className="card w-full text-left text-sm font-bold text-stone-600 flex items-center justify-between"
            >
              <span>手動で入力（番号パッド）</span>
              <span>{showManual ? '▲' : '▼'}</span>
            </button>
            {showManual && (
              <div className="mt-2">
                <ScoreInput onApply={apply} disabled={state.isGameOver} />
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          className="btn-secondary flex-1"
          onClick={undo}
          disabled={state.history.length === 0}
        >
          ↶ 1手戻す
        </button>
        <button type="button" className="btn-secondary flex-1" onClick={newGame}>
          新ゲーム
        </button>
      </div>

      <HistoryList state={state} />
    </div>
  );
}
