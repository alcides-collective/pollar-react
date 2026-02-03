import { motion, AnimatePresence } from 'framer-motion';
import { useAIDebugSteps } from '../../stores/aiStore';
import type { DebugStep } from '../../types/ai';

const isDev = import.meta.env.DEV;

function DebugStepItem({ step }: { step: DebugStep }) {
  const renderContent = () => {
    switch (step.step) {
      case 'keywordsAndExpansion':
        return (
          <>
            <span className="text-lg">&#128292;</span>
            <span className="flex-1">
              <strong>Keywords</strong>
              {step.model && ` (${step.model})`}
              {step.timeMs && (
                <span className="text-zinc-400 dark:text-zinc-500 ml-2">
                  {step.timeMs}ms
                </span>
              )}
            </span>
          </>
        );

      case 'parallelSearch':
        return (
          <>
            <span className="text-lg">&#128269;</span>
            <span className="flex-1">
              <strong>Search</strong>
              {step.timeMs && (
                <span className="text-zinc-400 dark:text-zinc-500 ml-2">
                  {step.timeMs}ms
                </span>
              )}
            </span>
          </>
        );

      case 'fusion':
        return (
          <>
            <span className="text-lg">&#129520;</span>
            <span className="flex-1">
              <strong>Fusion</strong>
              {step.method && ` (${step.method})`}
              {step.output && (
                <span className="text-zinc-400 dark:text-zinc-500 ml-2">
                  {step.output} results
                </span>
              )}
            </span>
          </>
        );

      case 'rerank':
        return (
          <>
            <span className="text-lg">&#128200;</span>
            <span className="flex-1">
              <strong>Rerank</strong>
              {step.model && ` (${step.model})`}
              {step.timeMs && (
                <span className="text-zinc-400 dark:text-zinc-500 ml-2">
                  {step.timeMs}ms
                </span>
              )}
            </span>
          </>
        );

      case 'searchComplete':
        return (
          <>
            <span className="text-lg">&#128270;</span>
            <span className="flex-1">
              <strong>Search Complete</strong>
              {step.finalResults && (
                <span className="text-zinc-400 dark:text-zinc-500 ml-2">
                  {step.finalResults} events
                </span>
              )}
              {step.totalTimeMs && (
                <span className="text-zinc-400 dark:text-zinc-500 ml-2">
                  ({step.totalTimeMs}ms)
                </span>
              )}
            </span>
          </>
        );

      case 'generating':
        return (
          <>
            <span className="text-lg">&#9997;</span>
            <span className="flex-1">
              <strong>Generating</strong>
              {step.model && ` (${step.model})`}
            </span>
          </>
        );

      case 'complete':
        return (
          <>
            <span className="text-lg">&#9989;</span>
            <span className="flex-1">
              <strong>Complete</strong>
              {step.totalTimeMs && (
                <span className="text-zinc-400 dark:text-zinc-500 ml-2">
                  {step.totalTimeMs}ms total
                </span>
              )}
            </span>
          </>
        );

      default:
        return (
          <>
            <span className="text-lg">&#128736;</span>
            <span className="flex-1">
              <strong>{step.step}</strong>
            </span>
          </>
        );
    }
  };

  return (
    <div className="flex items-center gap-2 py-1 text-[12px] text-zinc-600 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800/50 last:border-b-0">
      {renderContent()}
    </div>
  );
}

export function AIDebugPanel() {
  const debugSteps = useAIDebugSteps();

  // Only show in dev mode
  if (!isDev || debugSteps.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="bg-blue-50/50 dark:bg-blue-950/20 border-t border-blue-200/50 dark:border-blue-800/30 px-4 py-3 shrink-0"
      >
        <div className="font-sans text-[11px] font-semibold text-blue-600/80 dark:text-blue-400/80 mb-2 uppercase tracking-wide">
          Debug Pipeline
        </div>
        {debugSteps.map((step, i) => (
          <DebugStepItem key={`${step.step}-${i}`} step={step} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
