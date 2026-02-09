import { useSmartScale, useToggleSmartScale } from '@/stores/chartScaleStore';
import { useUser } from '@/stores/authStore';
import { updateUserSmartScalePreference } from '@/services/userService';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

export function ChartScaleToggle() {
  const smartScale = useSmartScale();
  const toggle = useToggleSmartScale();
  const user = useUser();

  const handleToggle = () => {
    toggle();
    if (user) {
      updateUserSmartScalePreference(user.uid, !smartScale).catch(console.error);
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleToggle}
            className="flex items-center gap-1.5 pr-4"
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
        </TooltipTrigger>
        <TooltipContent side="top" align="end" className="max-w-56 leading-relaxed">
          {smartScale
            ? 'Oś dopasowana do zakresu danych — widoczne szczegóły zmian. Kliknij aby rozpocząć od zera.'
            : 'Oś wykresu zaczyna się od zera — uczciwe proporcje wizualne. Kliknij aby dopasować do danych.'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
