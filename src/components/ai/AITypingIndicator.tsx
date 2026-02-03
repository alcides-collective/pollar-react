import { useAIDebugSteps } from '../../stores/aiStore';
import { getTypingLabel } from '../../utils/ai-helpers';

export function AITypingIndicator() {
  const debugSteps = useAIDebugSteps();
  const label = getTypingLabel(debugSteps);

  return (
    <div className="self-start w-full animate-fade-in">
      <div className="flex items-center gap-0 py-2 text-[15px] italic text-zinc-500 dark:text-zinc-400">
        <span>{label}</span>
        <span className="typing-dots">
          <span className="dot">.</span>
          <span className="dot">.</span>
          <span className="dot">.</span>
        </span>
      </div>

      <style>{`
        .typing-dots .dot {
          opacity: 0;
          animation: typing-dot 1.4s infinite;
        }
        .typing-dots .dot:nth-child(1) { animation-delay: 0s; }
        .typing-dots .dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing-dot {
          0%, 60%, 100% { opacity: 0; }
          30% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
