import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAICurrentStatus, useAIGenerationStartTime } from '../../stores/aiStore';

export function AITypingIndicator() {
  const { t } = useTranslation('ai');
  const currentStatus = useAICurrentStatus();
  const generationStartTime = useAIGenerationStartTime();

  // Use status from API, fallback to default
  const label = currentStatus || t('status.analyzing');

  // Live elapsed time counter
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!generationStartTime) {
      setElapsedMs(0);
      return;
    }

    // Update immediately
    setElapsedMs(Date.now() - generationStartTime);

    // Update every 100ms for smooth counter
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - generationStartTime);
    }, 100);

    return () => clearInterval(interval);
  }, [generationStartTime]);

  const elapsedSeconds = (elapsedMs / 1000).toFixed(1);

  return (
    <div className="self-start w-full animate-fade-in">
      <div className="flex items-center gap-2 py-2 text-[15px] text-content-subtle dark:text-zinc-400">
        <i className="ri-sparkling-2-fill text-base animate-pulse" />
        <span className="italic">{label}</span>
        <span className="text-content-faint dark:text-zinc-500 tabular-nums">
          {elapsedSeconds}s
        </span>
      </div>
    </div>
  );
}
