import { useState } from 'react';
import type { TurnAction } from '../domain/types';

interface Props {
  onApply: (action: TurnAction) => void;
  disabled?: boolean;
}

type Mode = 'single' | 'multiple';

export function ScoreInput({ onApply, disabled }: Props) {
  const [mode, setMode] = useState<Mode>('single');

  const handleMiss = () => onApply({ type: 'miss' });
  const handlePin = (n: number) => {
    if (mode === 'single') onApply({ type: 'singlePin', pinNumber: n });
    else onApply({ type: 'multiplePins', count: n });
  };

  return (
    <div className="card">
      <div className="flex gap-2 mb-3">
        <ModeButton
          active={mode === 'single'}
          onClick={() => setMode('single')}
          label="単本倒し"
          hint="番号がそのまま得点"
        />
        <ModeButton
          active={mode === 'multiple'}
          onClick={() => setMode('multiple')}
          label="複数本倒し"
          hint="本数が得点"
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
          const disabledForMode = mode === 'multiple' && n < 2;
          return (
            <button
              key={n}
              type="button"
              disabled={disabled || disabledForMode}
              onClick={() => handlePin(n)}
              className={`pin-btn ${
                disabled || disabledForMode ? 'opacity-30 pointer-events-none' : ''
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={handleMiss}
        className={`btn-danger w-full mt-3 ${disabled ? 'opacity-30 pointer-events-none' : ''}`}
      >
        ミス（0点）
      </button>

      <p className="mt-3 text-xs text-stone-500 leading-relaxed">
        {mode === 'single'
          ? '※ 倒したピン1本の番号をタップ。1本のみ倒した場合に使います。'
          : '※ 倒したピンの本数をタップ（2〜12本）。複数本倒した場合の点数は本数になります。'}
      </p>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl px-3 py-2 text-left transition ${
        active
          ? 'bg-molkky-green text-white shadow'
          : 'bg-stone-100 text-stone-700'
      }`}
    >
      <div className="text-sm font-bold">{label}</div>
      <div className={`text-xs ${active ? 'text-white/80' : 'text-stone-500'}`}>{hint}</div>
    </button>
  );
}
