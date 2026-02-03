import { useEffect, useRef, useCallback } from 'react';
import { useAIStore, useAIAnimatingMessageId, useAIVisibleWordCount } from '../stores/aiStore';
import { easeOutQuad } from '../utils/ai-helpers';

// Animation timing: starts fast (15ms), slows to (80ms) using ease-out curve
const WORD_DELAY_MIN = 15;
const WORD_DELAY_MAX = 80;

interface UseWordAnimationOptions {
  onScrollToBottom?: () => void;
  isUserAtBottom?: boolean;
}

export function useWordAnimation(options: UseWordAnimationOptions = {}) {
  const { onScrollToBottom, isUserAtBottom = true } = options;
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get state with individual selectors (stable references)
  const animatingMessageId = useAIAnimatingMessageId();
  const visibleWordCount = useAIVisibleWordCount();

  // Get actions (these are stable and don't cause re-renders)
  const startWordAnimation = useAIStore((s) => s.startWordAnimation);
  const incrementWordCount = useAIStore((s) => s.incrementWordCount);
  const stopWordAnimation = useAIStore((s) => s.stopWordAnimation);

  /**
   * Start word-by-word animation for a message
   */
  const animateMessage = useCallback(
    (messageId: string, totalWords: number) => {
      // Clear any existing animation
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Start animation state
      startWordAnimation(messageId);

      // Initial scroll
      if (onScrollToBottom) {
        onScrollToBottom();
      }

      let currentWord = 1;

      const animate = () => {
        if (currentWord < totalWords) {
          currentWord++;
          incrementWordCount();

          // Calculate progress (0 to 1)
          const progress = currentWord / totalWords;
          // Apply ease-out: fast at start, slow at end
          const eased = easeOutQuad(progress);
          const delay = WORD_DELAY_MIN + (WORD_DELAY_MAX - WORD_DELAY_MIN) * eased;

          // Scroll during animation only if user is at bottom
          if (onScrollToBottom && isUserAtBottom) {
            onScrollToBottom();
          }

          timeoutRef.current = setTimeout(animate, delay);
        } else {
          // Animation complete
          stopWordAnimation();
        }
      };

      // Start with first word visible, then begin animation
      timeoutRef.current = setTimeout(animate, WORD_DELAY_MIN);
    },
    [
      startWordAnimation,
      incrementWordCount,
      stopWordAnimation,
      onScrollToBottom,
      isUserAtBottom,
    ]
  );

  /**
   * Stop current animation
   */
  const stopAnimation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    stopWordAnimation();
  }, [stopWordAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    animateMessage,
    stopAnimation,
    animatingMessageId,
    visibleWordCount,
    isAnimating: animatingMessageId !== null,
  };
}
