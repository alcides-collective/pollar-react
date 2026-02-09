import { useSmartScale, useToggleSmartScale } from '@/stores/chartScaleStore';

export function ChartScaleToggle() {
  const smartScale = useSmartScale();
  const toggle = useToggleSmartScale();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 pr-4"
      title={smartScale ? 'Skala dopasowana do danych — kliknij aby rozpocząć od 0' : 'Skala od zera — kliknij aby dopasować do danych'}
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
  );
}
