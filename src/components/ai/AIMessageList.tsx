import { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { AIMessage } from './AIMessage';
import { AITypingIndicator } from './AITypingIndicator';
import { AISuggestions } from './AISuggestions';
import { useAIMessages, useAILoading, useAIFollowUps, useAIAnimatingMessageId } from '../../stores/aiStore';

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
  const animatingMessageId = useAIAnimatingMessageId();

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

  // Show scroll button when loading, not at bottom, AND content is scrollable
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      setShowScrollButton(false);
      return;
    }
    // Only show if content actually overflows (needs scrolling)
    const isScrollable = container.scrollHeight > container.clientHeight + 50;
    setShowScrollButton(isLoading && !isUserAtBottom && isScrollable);
  }, [isLoading, isUserAtBottom, containerRef, messages.length]);

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
    !animatingMessageId &&
    followUps.length > 0 &&
    lastMessage?.role === 'assistant';

  // Auto scroll when follow-ups appear
  useEffect(() => {
    if (showFollowUps) {
      const timeout = setTimeout(() => {
        const container = containerRef.current;
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [showFollowUps, containerRef]);

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
        {messages.map((message) => (
          <AIMessage key={message.id} message={message} />
        ))}

        {showTypingIndicator && <AITypingIndicator />}

        {showFollowUps && (
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 animate-fade-in">
            {followUps.map((followUp) => (
              <button
                key={followUp}
                onClick={() => onSuggestionSelect(followUp)}
                className="text-sm text-left text-zinc-600 dark:text-zinc-400
                           border border-zinc-200 dark:border-zinc-700 rounded-lg
                           px-4 py-3 leading-relaxed
                           hover:bg-zinc-50 dark:hover:bg-zinc-800/50
                           hover:border-zinc-300 dark:hover:border-zinc-600
                           transition-colors duration-150"
              >
                {followUp}
              </button>
            ))}
          </div>
        )}

        {/* Invisible anchor for scroll detection */}
        <div ref={scrollAnchorRef} className="h-px w-full" />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          aria-label="Przewin w dol"
          className="absolute bottom-3 right-3 flex items-center justify-center
                     w-9 h-9 rounded-full
                     border border-zinc-200 dark:border-zinc-700
                     bg-white/95 dark:bg-zinc-900/95
                     text-zinc-500 dark:text-zinc-400
                     shadow-lg backdrop-blur-sm
                     hover:border-zinc-300 dark:hover:border-zinc-600
                     active:scale-95
                     transition-all duration-150 z-10
                     animate-fade-in"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
