import type { Player } from '../domain/types';

interface Props {
  player: Player;
  isCurrent: boolean;
  missLimit: number;
  winningScore: number;
}

export function PlayerCard({ player, isCurrent, missLimit, winningScore }: Props) {
  const remaining = Math.max(0, winningScore - player.score);
  const stateLabel = player.isEliminated ? '失格' : isCurrent ? '◀ 投擲中' : '';

  return (
    <div
      className={`card transition ${
        isCurrent ? 'ring-4 ring-molkky-accent' : ''
      } ${player.isEliminated ? 'opacity-50' : ''}`}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-stone-700 truncate">{player.name}</h2>
        <span className="text-sm font-bold text-molkky-green">{stateLabel}</span>
      </div>
      <div className="flex items-end justify-between mt-1">
        <div className="text-5xl font-extrabold text-stone-900 leading-none tabular-nums">
          {player.score}
          <span className="text-base text-stone-400 font-normal"> / {winningScore}</span>
        </div>
        <div className="text-right text-xs text-stone-500">
          <div>残り <span className="font-bold text-stone-700">{remaining}</span> 点</div>
          <div className="mt-1">
            ミス
            <span className="ml-1 font-bold text-red-500">
              {'●'.repeat(player.consecutiveMisses)}
              <span className="text-stone-300">
                {'○'.repeat(Math.max(0, missLimit - player.consecutiveMisses))}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
