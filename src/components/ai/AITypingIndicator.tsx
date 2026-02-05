import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAIDebugSteps } from '../../stores/aiStore';
import { getTypingLabelKey } from '../../utils/ai-helpers';

export function AITypingIndicator() {
  const { t } = useTranslation('ai');
  const debugSteps = useAIDebugSteps();
  const labelKey = getTypingLabelKey(debugSteps);
  const label = t(`status.${labelKey}`);

  return (
    <div className="self-start w-full animate-fade-in">
      <div className="flex items-center gap-2 py-2 text-[15px] text-zinc-500 dark:text-zinc-400">
        <motion.i
          className="ri-sparkling-2-fill text-base"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <span className="italic">{label}</span>
      </div>
    </div>
  );
}
