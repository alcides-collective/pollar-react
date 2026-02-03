import { motion } from 'framer-motion';
import { useAIDebugSteps } from '../../stores/aiStore';
import { getTypingLabel } from '../../utils/ai-helpers';

export function AITypingIndicator() {
  const debugSteps = useAIDebugSteps();
  const label = getTypingLabel(debugSteps);

  return (
    <motion.div
      className="self-start w-full"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-0 py-2 text-[15px] italic text-zinc-500 dark:text-zinc-400">
        <span>{label}</span>
        <span className="inline-flex">
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
          >
            .
          </motion.span>
        </span>
      </div>
    </motion.div>
  );
}
