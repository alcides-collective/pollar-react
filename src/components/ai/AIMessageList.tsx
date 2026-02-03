import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { AIMessage } from './AIMessage';
import { AITypingIndicator } from './AITypingIndicator';
import { AISuggestions } from './AISuggestions';
import { useAIMessages, useAILoading, useAIFollowUps } from '../../stores/aiStore';

interface AIMessageListProps {
  onSuggestionSelect: (suggestion: string) => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export function AIMessageList({
  onSuggestionSelect,
  scrollContainerRef,
}: AIMessageListProps) {
  const messages = useAIMessages();
  const isLoading = useAILoading();
  const followUps = useAIFollowUps();

  const internalRef = useRef<HTMLDivElement>(null);
  const containerRef = scrollContainerRef || internalRef;
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Intersection observer for scroll tracking
  useEffect(() => {
    const anchor = scrollAnchorRef.current;
    const container = containerRef.current;
    if (!anchor || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIsUserAtBottom(entries[0].isIntersecting);
      },
      { root: container, threshold: 0.1 }
    );

    observer.observe(anchor);
    return () => observer.disconnect();
  }, [containerRef]);

  // Show scroll button when loading and not at bottom
  useEffect(() => {
    setShowScrollButton(isLoading && !isUserAtBottom);
  }, [isLoading, isUserAtBottom]);

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [containerRef]);

  // Auto scroll when new messages arrive (if user was at bottom)
  useEffect(() => {
    if (isUserAtBottom) {
      const container = containerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages.length, isUserAtBottom, containerRef]);

  const lastMessage = messages[messages.length - 1];
  const showFollowUps =
    !isLoading &&
    followUps.length > 0 &&
    lastMessage?.role === 'assistant';
  const showTypingIndicator =
    isLoading &&
    (!lastMessage || lastMessage.role !== 'assistant' || !lastMessage.content);

  if (messages.length === 0) {
    return <AISuggestions onSelect={onSuggestionSelect} variant="grid" />;
  }

  return (
    <div
      ref={internalRef}
      className="flex-1 overflow-y-auto min-h-0 relative"
    >
      <div className="flex flex-col gap-3 p-4">
        {messages.map((message, i) => (
          <AIMessage key={message.id} message={message} index={i} />
        ))}

        <AnimatePresence>
          {showTypingIndicator && <AITypingIndicator />}
        </AnimatePresence>

        <AnimatePresence>
          {showFollowUps && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50"
            >
              {followUps.map((followUp, i) => (
                <motion.button
                  key={followUp}
                  onClick={() => onSuggestionSelect(followUp)}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-sm text-left text-zinc-600 dark:text-zinc-400
                             border border-zinc-200 dark:border-zinc-700 rounded-lg
                             px-4 py-3 leading-relaxed
                             hover:bg-zinc-50 dark:hover:bg-zinc-800/50
                             hover:border-zinc-300 dark:hover:border-zinc-600
                             transition-all duration-150"
                >
                  {followUp}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Invisible anchor for scroll detection */}
        <div ref={scrollAnchorRef} className="h-px w-full" />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={scrollToBottom}
            aria-label="Przewin w dol"
            className="absolute bottom-3 right-3 flex items-center justify-center
                       w-9 h-9 rounded-full
                       border border-zinc-200 dark:border-zinc-700
                       bg-white/95 dark:bg-zinc-900/95
                       text-zinc-500 dark:text-zinc-400
                       shadow-lg backdrop-blur-sm
                       hover:border-zinc-300 dark:hover:border-zinc-600
                       hover:-translate-y-0.5
                       transition-all duration-150 z-10"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
