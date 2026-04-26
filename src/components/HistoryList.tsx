import { describeAction } from '../domain/game';
import type { GameState } from '../domain/types';

interface Props {
  state: GameState;
}

export function HistoryList({ state }: Props) {
  if (state.history.length === 0) {
    return (
      <div className="card text-center text-sm text-stone-400">
        まだ投擲履歴はありません
      </div>
    );
  }

  const recent = [...state.history].reverse().slice(0, 10);

  return (
    <div className="card">
      <h3 className="text-sm font-bold text-stone-600 mb-2">投擲履歴（直近10件）</h3>
      <ol className="divide-y divide-stone-100 text-sm">
        {recent.map((rec, idx) => {
          const player = state.players[rec.playerId];
          const gain = rec.scoreAfter - rec.scoreBefore;
          const gainText =
            gain > 0
              ? `+${gain}`
              : rec.scoreAfter < rec.scoreBefore
                ? `→${rec.scoreAfter} (戻り)`
                : '±0';
          return (
            <li
              key={state.history.length - idx}
              className="py-2 flex items-center justify-between gap-2"
            >
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-xs text-stone-400 tabular-nums w-8 shrink-0">
                  #{rec.turnNumber}
                </span>
                <span className="font-bold text-stone-700 truncate">{player.name}</span>
                <span className="text-stone-500 truncate">{describeAction(rec.action)}</span>
              </div>
              <div className="flex items-baseline gap-2 shrink-0">
                <span
                  className={`text-xs tabular-nums ${
                    gain > 0
                      ? 'text-molkky-green'
                      : rec.scoreAfter < rec.scoreBefore
                        ? 'text-orange-500'
                        : 'text-stone-400'
                  }`}
                >
                  {gainText}
                </span>
                <span className="font-bold tabular-nums">{rec.scoreAfter}</span>
                {rec.isWinningTurn && <span className="text-yellow-500">🏆</span>}
                {rec.isEliminatingTurn && <span className="text-red-500">❌</span>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
