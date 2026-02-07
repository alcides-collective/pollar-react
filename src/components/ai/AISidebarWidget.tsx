import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAISuggestions, useAIStore } from '../../stores/aiStore';
import { useLanguage } from '../../stores/languageStore';
import { API_BASE } from '../../config/api';

const PAUSE_BETWEEN = 4000; // ms to show each placeholder

export function AISidebarWidget() {
  const { t } = useTranslation('ai');
  const navigate = useNavigate();
  const language = useLanguage();
  const suggestions = useAISuggestions();
  const setSuggestions = useAIStore((s) => s.setSuggestions);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Get default suggestions from i18n
  const defaultSuggestions = useMemo(() =>
    t('suggestions.default', { returnObjects: true }) as string[],
    [t]
  );

  // Use suggestions or default
  const placeholders =
    suggestions.length >= 4 ? suggestions : defaultSuggestions;

  const currentText = placeholders[placeholderIndex];

  // Fetch suggestions on mount and when language changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`${API_BASE}/assistant/suggestions?language=${language}`);
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
  }, [setSuggestions, language]);

  // Cycle through placeholders with fade
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);

      // After fade out, change text and fade in
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        setIsVisible(true);
      }, 200);
    }, PAUSE_BETWEEN);

    return () => clearInterval(interval);
  }, [placeholders.length]);

  const handleClick = () => {
    navigate('/asystent');
  };

  return (
    <div className="p-4">
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-3 px-4 py-3
                   bg-background dark:bg-zinc-900
                   border border-divider dark:border-zinc-800 rounded-lg
                   hover:border-divider dark:hover:border-zinc-700
                   hover:shadow-sm
                   transition-all duration-200 cursor-pointer
                   group"
      >
        {/* Sparks icon */}
        <svg
          className="w-4 h-4 text-content-faint dark:text-zinc-500 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
        </svg>

        {/* Placeholder text - fixed height to prevent layout shift */}
        <div className="flex-1 text-left overflow-hidden min-h-[20px]">
          <span
            className="text-sm text-content-faint dark:text-zinc-500 block truncate transition-opacity duration-200"
            style={{ opacity: isVisible ? 1 : 0 }}
          >
            {currentText}
          </span>
        </div>
      </button>
    </div>
  );
}
