import { useGameStore } from '../store/gameStore';
import type { PlayerId } from '../domain/types';

export function SettingsTab() {
  const state = useGameStore((s) => s.state);
  const updatePlayerName = useGameStore((s) => s.updatePlayerName);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const newGame = useGameStore((s) => s.newGame);

  const onNameChange = (id: PlayerId, value: string) => {
    updatePlayerName(id, value);
  };

  const onMissLimitChange = (value: number) => {
    updateSettings({ missLimit: value });
  };

  return (
    <div className="p-4 space-y-4">
      <section className="card">
        <h2 className="text-lg font-bold mb-3 text-molkky-green">プレイヤー名</h2>
        <div className="space-y-2">
          {(['A', 'B'] as PlayerId[]).map((id) => (
            <label key={id} className="block">
              <span className="text-sm text-stone-600">プレイヤー{id === 'A' ? '1' : '2'}</span>
              <input
                type="text"
                value={state.settings.playerNames[id]}
                onChange={(e) => onNameChange(id, e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-molkky-green focus:outline-none"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-bold mb-3 text-molkky-green">ゲームルール</h2>

        <div className="space-y-3">
          <div>
            <div className="text-sm text-stone-600">勝利点</div>
            <div className="text-stone-800 font-bold mt-1">{state.settings.winningScore} 点（固定）</div>
          </div>

          <div>
            <div className="text-sm text-stone-600">超過時の戻り点</div>
            <div className="text-stone-800 font-bold mt-1">{state.settings.rollbackScore} 点（固定）</div>
          </div>

          <div>
            <div className="text-sm text-stone-600 mb-1">連続ミス失格回数</div>
            <div className="flex gap-2">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onMissLimitChange(n)}
                  className={`flex-1 rounded-lg py-2 font-bold transition ${
                    state.settings.missLimit === n
                      ? 'bg-molkky-green text-white'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {n}回
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-stone-500">
              ※ 公式ルールは3回。ローカルルールに合わせて変更可能です。
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-bold mb-3 text-stone-700">データ</h2>
        <button type="button" onClick={newGame} className="btn-secondary w-full">
          現在のゲームをリセットして新ゲーム
        </button>
        <p className="mt-2 text-xs text-stone-500">
          ※ 試合状態はブラウザのローカルストレージに自動保存されます。
        </p>
      </section>

      <section className="card bg-stone-100 text-xs text-stone-600 leading-relaxed">
        <div className="font-bold text-stone-700 mb-1">モルック大ちゃん v0.3.0 (Phase 1.1)</div>
        <p>今後のフェーズ追加予定: 作戦提示UI改善、複数人対戦、AI推奨モード（強化学習）。</p>
      </section>
    </div>
  );
}
