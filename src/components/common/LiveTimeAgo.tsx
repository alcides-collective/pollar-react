import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatTimeAgo } from '../../utils/formatTimeAgo';

interface LiveTimeAgoProps {
  date: string;
  className?: string;
  updateInterval?: number; // in milliseconds, default 30 seconds
}

/**
 * A component that displays relative time ("5 min", "2 godz.")
 * and automatically updates at the specified interval.
 */
export function LiveTimeAgo({
  date,
  className,
  updateInterval = 30000
}: LiveTimeAgoProps) {
  const { t } = useTranslation('common');
  const [timeAgo, setTimeAgo] = useState(() => formatTimeAgo(date, t));

  useEffect(() => {
    // Update immediately when date changes
    setTimeAgo(formatTimeAgo(date, t));

    // Set up interval for live updates
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(date, t));
    }, updateInterval);

    return () => clearInterval(interval);
  }, [date, updateInterval, t]);

  return <span className={className}>{timeAgo}</span>;
}
