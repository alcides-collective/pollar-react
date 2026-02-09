import { useState } from 'react';
import { useSmartScale, useToggleSmartScale } from '@/stores/chartScaleStore';
import { useUser } from '@/stores/authStore';
import { updateUserSmartScalePreference } from '@/services/userService';

export function ChartScaleToggle() {
  const smartScale = useSmartScale();
  const toggle = useToggleSmartScale();
  const user = useUser();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleToggle = () => {
    toggle();
    if (user) {
      updateUserSmartScalePreference(user.uid, !smartScale).catch(console.error);
    }
  };

  return (
    <div
      className="relative flex items-center gap-1.5 pr-4"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5"
      >
        <span className="text-[9px] font-medium uppercase tracking-wider text-content-subtle select-none">
          Smart
        </span>
        <span
          className={`relative inline-block w-[26px] h-[14px] rounded-full transition-colors duration-200 ${
            smartScale ? 'bg-content-subtle' : 'bg-divider'
          }`}
        >
          <span
            className={`absolute top-[3px] left-[3px] w-[8px] h-[8px] rounded-full bg-surface shadow-sm transition-transform duration-200 ${
              smartScale ? 'translate-x-[12px]' : 'translate-x-0'
            }`}
          />
        </span>
      </button>
      {showTooltip && (
        <span className="absolute right-4 bottom-full mb-2 px-3 py-2.5 bg-zinc-900/70 backdrop-blur-xl backdrop-saturate-150 text-zinc-100 text-xs rounded-xl border border-white/10 ring-1 ring-white/5 shadow-xl shadow-black/30 z-[60] w-56 font-normal leading-relaxed">
          {smartScale
            ? 'Oś dopasowana do zakresu danych — widoczne szczegóły zmian. Kliknij aby rozpocząć od zera.'
            : 'Oś wykresu zaczyna się od zera — uczciwe proporcje wizualne. Kliknij aby dopasować do danych.'}
        </span>
      )}
    </div>
  );
}
