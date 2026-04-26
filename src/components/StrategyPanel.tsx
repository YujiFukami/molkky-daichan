import { useMemo } from 'react';
import { generateStrategies, type Strategy } from '../domain/heuristic';
import { useGameStore } from '../store/gameStore';

const TOP_N = 4;

export function StrategyPanel() {
  const board = useGameStore((s) => s.board);
  const state = useGameStore((s) => s.state);
  const setHighlightedPinIds = useGameStore((s) => s.setHighlightedPinIds);
  const highlightedPinIds = useGameStore((s) => s.highlightedPinIds);

  const player = state.players[state.currentTurn];

  const strategies = useMemo(() => {
    if (state.isGameOver) return [];
    return generateStrategies(
      board,
      player.score,
      state.settings.winningScore,
      state.settings.rollbackScore,
    ).slice(0, TOP_N);
  }, [board, player.score, state.settings, state.isGameOver]);

  if (state.isGameOver) return null;

  if (strategies.length === 0) {
    return (
      <div className="card text-center text-sm text-stone-500">
        立っているピンがありません
      </div>
    );
  }

  const isHighlighted = (s: Strategy) =>
    highlightedPinIds.length === s.pinIds.length &&
    s.pinIds.every((id) => highlightedPinIds.includes(id));

  return (
    <div className="card">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-sm font-bold text-stone-700">
          作戦提案 <span className="text-xs text-stone-400">（おすすめ順）</span>
        </h3>
        <button
          type="button"
          className="text-xs text-stone-500 underline"
          onClick={() => setHighlightedPinIds([])}
          disabled={highlightedPinIds.length === 0}
        >
          ハイライト解除
        </button>
      </div>
      <ul className="space-y-2">
        {strategies.map((s, idx) => (
          <li key={`${s.type}-${s.pinIds.join('-')}`}>
            <button
              type="button"
              onClick={() => setHighlightedPinIds(s.pinIds)}
              className={`w-full rounded-xl border p-3 text-left transition ${
                isHighlighted(s)
                  ? 'border-molkky-accent bg-yellow-50'
                  : 'border-stone-200 bg-white hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span
                    className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                      idx === 0
                        ? 'bg-molkky-green text-white'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="font-bold text-stone-800 truncate">
                    {strategyTitle(s)}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-stone-500">
                    {s.isWinningMove ? (
                      <span className="text-yellow-600 font-bold">🏆 勝利</span>
                    ) : s.isOvershoot ? (
                      <span className="text-red-500 font-bold">超過 →25</span>
                    ) : (
                      <span>+{s.gain}点 → {s.resultingScore}</span>
                    )}
                  </div>
                  <div className="text-xs">
                    倒しやすさ
                    <span className="font-bold ml-1 tabular-nums">
                      {(s.ease * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-1 text-xs text-stone-500">
                対象ピン: {s.pinIds.join(', ')}
              </div>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-stone-500 leading-relaxed">
        ※ 倒しやすさはヒューリスティック評価（投擲位置からの距離・周囲ピンとの間隔）です。
        作戦をタップするとピン盤上にハイライト表示されます。
      </p>
    </div>
  );
}

function strategyTitle(s: Strategy): string {
  if (s.type === 'single') {
    return `${s.pinIds[0]}番ピン狙い`;
  }
  return `${s.pinIds.length}本まとめて狙い`;
}
