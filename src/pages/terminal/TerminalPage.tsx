import { useState, useEffect, useCallback, useMemo } from 'react';
import { useEvents } from '../../stores/eventsStore';
import { useLanguageNavigate } from '../../hooks/useLanguageNavigate';
import { useRouteLanguage } from '../../hooks/useRouteLanguage';
import { useMarketData } from '../../hooks/useMarketData';
import { TerminalHeader } from './components/TerminalHeader';
import { EventDetailsPanel } from './components/EventDetailsPanel';
import { TrendingList } from './components/TrendingList';
import { TerminalSidebar } from './components/TerminalSidebar';
import { TerminalStatusBar } from './components/TerminalStatusBar';
import type { Event } from '../../types/events';
import './terminal.css';

const KEYPOINT_ROTATION_MS = 4000;
const MIN_EVENT_DISPLAY_MS = 8000;
const PROGRESS_UPDATE_MS = 50;

type FocusedPanel = 'details' | 'list' | 'sidebar';

export function TerminalPage() {
  const navigate = useLanguageNavigate();
  const language = useRouteLanguage();

  // Data fetching
  const { events, loading, error } = useEvents({ limit: 500, lang: language, includeArchive: true, articleFields: 'minimal' });
  const { indices } = useMarketData();

  // Sort events by trending score
  const trendingEvents = useMemo(() => {
    return [...events].sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
  }, [events]);

  // UI State
  const [focusedPanel, setFocusedPanel] = useState<FocusedPanel>('list');
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const [keyPointIndex, setKeyPointIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [eventProgress, setEventProgress] = useState(0);
  const [progressStartTime, setProgressStartTime] = useState(Date.now());

  // Derived state
  const selectedEvent = trendingEvents[selectedEventIndex] || null;
  const keyPoints = selectedEvent?.metadata?.keyPoints || [];
  const currentKeyPoint = keyPoints[keyPointIndex] || null;
  const totalEventDisplayMs = Math.max(keyPoints.length * KEYPOINT_ROTATION_MS, MIN_EVENT_DISPLAY_MS);

  // Categories count
  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    events.forEach(event => {
      const cat = event.category || 'News';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });
    return Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }));
  }, [events]);

  // Reset progress
  const resetProgress = useCallback(() => {
    setProgressStartTime(Date.now());
    setEventProgress(0);
  }, []);

  // Reset rotation when event changes
  const resetRotation = useCallback(() => {
    setKeyPointIndex(0);
    resetProgress();
  }, [resetProgress]);

  // Select event handler
  const handleSelectEvent = useCallback((index: number) => {
    setSelectedEventIndex(index);
    resetRotation();
  }, [resetRotation]);

  // Navigate to event
  const handleNavigateToEvent = useCallback((event: Event) => {
    navigate(`/event/${event.id}`);
  }, [navigate]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          navigate('/');
          break;
        case 'Tab':
          event.preventDefault();
          setFocusedPanel(prev => {
            if (prev === 'list') return 'details';
            if (prev === 'details') return 'sidebar';
            return 'list';
          });
          break;
        case 'ArrowUp':
          if (focusedPanel === 'list' || focusedPanel === 'details') {
            setSelectedEventIndex(prev => {
              const newIndex = Math.max(0, prev - 1);
              if (newIndex !== prev) resetRotation();
              return newIndex;
            });
          }
          break;
        case 'ArrowDown':
          if (focusedPanel === 'list' || focusedPanel === 'details') {
            setSelectedEventIndex(prev => {
              const newIndex = Math.min(trendingEvents.length - 1, prev + 1);
              if (newIndex !== prev) resetRotation();
              return newIndex;
            });
          }
          break;
        case 'Enter':
          if (selectedEvent) {
            handleNavigateToEvent(selectedEvent);
          }
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [navigate, focusedPanel, trendingEvents.length, selectedEvent, handleNavigateToEvent, toggleFullscreen, resetRotation]);

  // Clock update
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotation for key points
  useEffect(() => {
    if (trendingEvents.length === 0) return;

    const interval = setInterval(() => {
      const currentKeyPoints = trendingEvents[selectedEventIndex]?.metadata?.keyPoints || [];

      if (currentKeyPoints.length > 0) {
        setKeyPointIndex(prev => {
          if (prev < currentKeyPoints.length - 1) {
            return prev + 1;
          } else {
            // Move to next event
            setSelectedEventIndex(prevEvent => (prevEvent + 1) % trendingEvents.length);
            resetProgress();
            return 0;
          }
        });
      } else {
        // No key points, move after 2 ticks
        setKeyPointIndex(prev => {
          if (prev >= 1) {
            setSelectedEventIndex(prevEvent => (prevEvent + 1) % trendingEvents.length);
            resetProgress();
            return 0;
          }
          return prev + 1;
        });
      }
    }, KEYPOINT_ROTATION_MS);

    return () => clearInterval(interval);
  }, [trendingEvents, selectedEventIndex, resetProgress]);

  // Progress bar update
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - progressStartTime;
      setEventProgress(Math.min((elapsed / totalEventDisplayMs) * 100, 100));
    }, PROGRESS_UPDATE_MS);

    return () => clearInterval(interval);
  }, [progressStartTime, totalEventDisplayMs]);

  // Disable body scroll
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  // Reset key point index when event changes
  useEffect(() => {
    setKeyPointIndex(0);
    resetProgress();
  }, [selectedEventIndex, resetProgress]);

  return (
    <div className="terminal-container">
      <TerminalHeader currentTime={currentTime} />

      <main className="terminal-main">
        <section className="main-panel">
          <EventDetailsPanel
            event={selectedEvent}
            keyPointIndex={keyPointIndex}
            keyPoints={keyPoints}
            currentKeyPoint={currentKeyPoint}
            progress={eventProgress}
            selectedIndex={selectedEventIndex}
            focused={focusedPanel === 'details'}
          />

          <TrendingList
            events={trendingEvents}
            selectedIndex={selectedEventIndex}
            onSelect={handleSelectEvent}
            onNavigate={handleNavigateToEvent}
            focused={focusedPanel === 'list'}
          />
        </section>

        <TerminalSidebar
          indices={indices}
          categories={categories}
          event={selectedEvent}
          focused={focusedPanel === 'sidebar'}
        />
      </main>

      <TerminalStatusBar
        connected={!error}
        loading={loading ?? false}
        lastUpdateTime={Date.now()}
        eventCount={events.length}
        totalEventCount={trendingEvents.length}
      />
    </div>
  );
}
