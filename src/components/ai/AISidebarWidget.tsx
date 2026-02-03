import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAISuggestions, useAIStore } from '../../stores/aiStore';
import { DEFAULT_SUGGESTIONS } from '../../utils/ai-helpers';
import { API_BASE } from '../../config/api';

// Animation timing for placeholder
const WORD_DELAY = 150; // ms between each word
const PAUSE_BETWEEN = 4000; // ms to show full placeholder

export function AISidebarWidget() {
  const navigate = useNavigate();
  const suggestions = useAISuggestions();
  const setSuggestions = useAIStore((s) => s.setSuggestions);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [visibleWords, setVisibleWords] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Use suggestions or default
  const placeholders =
    suggestions.length >= 4 ? suggestions : DEFAULT_SUGGESTIONS;

  // Fetch suggestions on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`${API_BASE}/assistant/suggestions`);
        if (response.ok) {
          const data = await response.json();
          if (data.suggestions?.length >= 4) {
            setSuggestions(data.suggestions);
          }
        }
      } catch {
        // Keep defaults
      }
    };
    fetchSuggestions();
  }, [setSuggestions]);

  // Initialize with first placeholder
  useEffect(() => {
    const words = placeholders[0].split(' ');
    setVisibleWords(words);
  }, [placeholders]);

  // Animate placeholder cycling
  const animatePlaceholder = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    const currentWords = placeholders[placeholderIndex].split(' ');
    const nextIndex = (placeholderIndex + 1) % placeholders.length;
    const nextWords = placeholders[nextIndex].split(' ');

    // Phase 1: Hide words one by one (from end to start)
    let hideIndex = currentWords.length - 1;
    const hideInterval = setInterval(() => {
      if (hideIndex >= 0) {
        setVisibleWords(currentWords.slice(0, hideIndex));
        hideIndex--;
      } else {
        clearInterval(hideInterval);

        // Switch to next placeholder
        setPlaceholderIndex(nextIndex);
        setVisibleWords([]);

        // Phase 2: Show new words one by one
        let showIndex = 0;
        const showInterval = setInterval(() => {
          if (showIndex < nextWords.length) {
            setVisibleWords(nextWords.slice(0, showIndex + 1));
            showIndex++;
          } else {
            clearInterval(showInterval);
            setIsAnimating(false);
          }
        }, WORD_DELAY);
      }
    }, WORD_DELAY);
  }, [isAnimating, placeholderIndex, placeholders]);

  // Start animation cycle
  useEffect(() => {
    const totalAnimationTime =
      PAUSE_BETWEEN + placeholders[0].split(' ').length * WORD_DELAY * 2;
    const interval = setInterval(animatePlaceholder, totalAnimationTime);
    return () => clearInterval(interval);
  }, [animatePlaceholder, placeholders]);

  const handleClick = () => {
    navigate('/asystent');
  };

  return (
    <div className="p-4">
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-3 px-4 py-3
                   bg-white dark:bg-zinc-900
                   border border-zinc-200 dark:border-zinc-800 rounded-lg
                   hover:border-zinc-300 dark:hover:border-zinc-700
                   hover:shadow-sm
                   transition-all duration-200 cursor-pointer
                   group"
      >
        {/* Sparks icon */}
        <svg
          className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
        </svg>

        {/* Animated placeholder */}
        <div className="flex-1 text-left overflow-hidden">
          <div className="text-sm text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
            <AnimatePresence mode="popLayout">
              {visibleWords.map((word, i) => (
                <motion.span
                  key={`${word}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.03 }}
                  className="inline-block mr-[0.3em]"
                >
                  {word}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </button>
    </div>
  );
}
