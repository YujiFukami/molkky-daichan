export function RulesTab() {
  return (
    <div className="p-4 space-y-4 text-stone-800">
      <section className="card">
        <h2 className="text-lg font-bold mb-2 text-molkky-green">モルックとは？</h2>
        <p className="text-sm leading-relaxed">
          フィンランド発祥のスポーツ。木製の棒（モルック）を投げて、1〜12の数字が書かれた12本の
          スキットルピンを倒し、ちょうど50点を目指す競技です。
        </p>
      </section>

      <section className="card">
        <h2 className="text-lg font-bold mb-2 text-molkky-green">基本の流れ</h2>
        <ol className="text-sm space-y-2 list-decimal list-inside leading-relaxed">
          <li>プレイヤーは順番にモルック（投擲棒）を投げる</li>
          <li>倒れたピンの状況によって得点が決まる</li>
          <li>累計が ちょうど 50点 になった人が勝ち</li>
        </ol>
      </section>

      <section className="card">
        <h2 className="text-lg font-bold mb-2 text-molkky-green">得点計算</h2>
        <ul className="text-sm space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong>1本だけ倒した</strong>: そのピンの番号がそのまま得点（例: 7番 → 7点）
          </li>
          <li>
            <strong>複数本倒した</strong>: 倒した本数が得点（例: 3本 → 3点。番号は無関係）
          </li>
          <li>
            <strong>1本も倒れない（ミス）</strong>: 0点
          </li>
        </ul>
      </section>

      <section className="card">
        <h2 className="text-lg font-bold mb-2 text-molkky-green">勝利条件・ペナルティ</h2>
        <ul className="text-sm space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong>ちょうど50点</strong> になったら勝ち
          </li>
          <li>
            <strong>50点を超えた</strong> 場合は <strong>25点に戻る</strong>
          </li>
          <li>
            <strong>3回連続でミス</strong> すると失格（ローカルルール: 25点戻り版もあり）
          </li>
        </ul>
      </section>

      <section className="card">
        <h2 className="text-lg font-bold mb-2 text-molkky-green">ピン配置の特徴</h2>
        <p className="text-sm leading-relaxed">
          倒れたピンは <strong>その場で立て直す</strong> ため、ターンが進むにつれて配置が散らばっていきます。
          これがモルックの戦略性の核となる要素です。次にどのピンを狙うかは、配置と残り点数を読んで判断します。
        </p>
      </section>

      <section className="card bg-stone-100">
        <h2 className="text-lg font-bold mb-2 text-stone-700">参考</h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          ※ 大会・ローカルによってルール差があります。本アプリでは「設定」タブから一部のルール（連続ミス上限など）を調整できます。
        </p>
      </section>
    </div>
  );
}
