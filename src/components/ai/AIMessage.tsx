import { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AIMessage as AIMessageType } from '../../types/ai';
import { tokenizeContent, formatMarkdown } from '../../utils/ai-helpers';
import { useAIAnimatingMessageId, useAIVisibleWordCount } from '../../stores/aiStore';

interface AIMessageProps {
  message: AIMessageType;
  index: number;
}

export const AIMessage = memo(function AIMessage({
  message,
  index,
}: AIMessageProps) {
  const navigate = useNavigate();
  const animatingMessageId = useAIAnimatingMessageId();
  const visibleWordCount = useAIVisibleWordCount();
  const isAnimating = animatingMessageId === message.id;

  // Tokenize content for word-by-word animation
  const tokens = useMemo(
    () => tokenizeContent(message.content),
    [message.content]
  );

  // Handle internal link clicks
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') {
      const href = target.getAttribute('href');
      if (href?.startsWith('/')) {
        e.preventDefault();
        navigate(href);
      }
    }
  };

  if (message.role === 'user') {
    return (
      <div className="self-end max-w-[90%] animate-fade-in">
        <div className="bg-zinc-100 dark:bg-zinc-800/60 px-4 py-3 rounded-2xl rounded-br-sm">
          <p className="text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // Assistant message with word-by-word animation
  const visibleTokens = isAnimating
    ? tokens.slice(0, visibleWordCount)
    : tokens;

  return (
    <div
      className="self-start w-full animate-fade-in"
      onClick={handleClick}
    >
      <div className="text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-200">
        {visibleTokens.map((token, i) => (
          <span
            key={`${index}-${i}`}
            className="inline"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(token) + ' ' }}
          />
        ))}
      </div>

      {/* Source links styling */}
      <style>{`
        .source-link {
          display: inline;
          color: rgb(113 113 122);
          font-size: inherit;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.15s ease;
        }
        .source-link:hover {
          color: rgb(63 63 70);
        }
        .dark .source-link {
          color: rgb(161 161 170);
        }
        .dark .source-link:hover {
          color: rgb(212 212 216);
        }
      `}</style>
    </div>
  );
});
