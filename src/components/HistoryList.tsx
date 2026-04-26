import { describeAction } from '../domain/game';
import type { GameState, PlayerId, TurnRecord } from '../domain/types';

interface Props {
  state: GameState;
}

const PER_PLAYER_LIMIT = 10;

export function HistoryList({ state }: Props) {
  if (state.history.length === 0) {
    return (
      <div className="card text-center text-sm text-stone-400">
        まだ投擲履歴はありません
      </div>
    );
  }

  const recordsByPlayer: Record<PlayerId, TurnRecord[]> = { A: [], B: [] };
  for (const rec of state.history) {
    recordsByPlayer[rec.playerId].push(rec);
  }
  const recentA = [...recordsByPlayer.A].reverse().slice(0, PER_PLAYER_LIMIT);
  const recentB = [...recordsByPlayer.B].reverse().slice(0, PER_PLAYER_LIMIT);

  return (
    <div className="card">
      <h3 className="text-sm font-bold text-stone-600 mb-2">
        投擲履歴（各プレイヤー直近{PER_PLAYER_LIMIT}件）
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <PlayerColumn name={state.players.A.name} records={recentA} />
        <PlayerColumn name={state.players.B.name} records={recentB} />
      </div>
    </div>
  );
}

function PlayerColumn({
  name,
  records,
}: {
  name: string;
  records: TurnRecord[];
}) {
  return (
    <div className="min-w-0">
      <div className="text-xs font-bold text-molkky-green mb-1 truncate border-b border-stone-200 pb-1">
        {name}
      </div>
      {records.length === 0 ? (
        <div className="text-xs text-stone-300 py-1">—</div>
      ) : (
        <ol className="divide-y divide-stone-100 text-xs">
          {records.map((rec) => {
            const gain = rec.scoreAfter - rec.scoreBefore;
            const gainText =
              gain > 0
                ? `+${gain}`
                : rec.scoreAfter < rec.scoreBefore
                  ? `→${rec.scoreAfter}`
                  : '±0';
            const gainColor =
              gain > 0
                ? 'text-molkky-green'
                : rec.scoreAfter < rec.scoreBefore
                  ? 'text-orange-500'
                  : 'text-stone-400';
            return (
              <li key={rec.turnNumber} className="py-1.5">
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-stone-400 tabular-nums shrink-0 text-[10px]">
                    #{rec.turnNumber}
                  </span>
                  <span className="font-bold tabular-nums text-stone-800">
                    {rec.scoreAfter}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-1 mt-0.5">
                  <span className="text-stone-600 truncate">
                    {describeAction(rec.action)}
                  </span>
                  <span className={`tabular-nums shrink-0 ${gainColor}`}>
                    {gainText}
                    {rec.isWinningTurn && <span className="ml-0.5">🏆</span>}
                    {rec.isEliminatingTurn && <span className="ml-0.5">❌</span>}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
