import { useTranslation } from 'react-i18next';

const LOCALE_MAP: Record<string, string> = { pl: 'pl-PL', en: 'en-GB', de: 'de-DE' };

interface TerminalStatusBarProps {
  connected: boolean;
  loading: boolean;
  lastUpdateTime: number;
  eventCount: number;
  totalEventCount: number;
}

function formatUpdateTime(timestamp: number, locale: string): string {
  return new Date(timestamp).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

export function TerminalStatusBar({
  connected,
  loading,
  lastUpdateTime,
  eventCount,
  totalEventCount
}: TerminalStatusBarProps) {
  const { t, i18n } = useTranslation('terminal');
  const locale = LOCALE_MAP[i18n.language] || 'pl-PL';

  return (
    <footer className="terminal-status">
      <div className="status-left">
        <span className={`status-indicator ${connected ? 'connected' : ''}`}>
          {loading
            ? t('status.loading').toUpperCase()
            : connected
              ? t('status.connected').toUpperCase()
              : t('status.disconnected').toUpperCase()
          }
        </span>
      </div>
      <div className="status-center">
        <span className="status-item">
          {t('status.lastUpdate').toUpperCase()}: {formatUpdateTime(lastUpdateTime, locale)}
        </span>
      </div>
      <div className="status-right">
        <span className="status-item">
          {t('status.events').toUpperCase()}: {eventCount} / {totalEventCount}
        </span>
      </div>
    </footer>
  );
}
