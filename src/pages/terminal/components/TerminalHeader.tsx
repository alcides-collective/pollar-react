import { useTranslation } from 'react-i18next';

const LOCALE_MAP: Record<string, string> = { pl: 'pl-PL', en: 'en-GB', de: 'de-DE' };

interface TerminalHeaderProps {
  currentTime: Date;
  onBack: () => void;
}

function formatTime(date: Date, locale: string): string {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function TerminalHeader({ currentTime, onBack }: TerminalHeaderProps) {
  const { t, i18n } = useTranslation('terminal');
  const locale = LOCALE_MAP[i18n.language] || 'pl-PL';

  return (
    <header className="terminal-header">
      <div className="header-left">
        <button className="mobile-back" onClick={onBack} aria-label={t('header.back')}>←</button>
        <span className="logo">POLLAR</span>
        <span className="separator">|</span>
        <span className="mode">{t('header.mode')}</span>
      </div>
      <div className="header-center">
        <span className="time">{formatTime(currentTime, locale)}</span>
        <span className="date">{formatDate(currentTime, locale)}</span>
      </div>
      <div className="header-right">
        <span className="hint">{t('header.exit').toUpperCase()}</span>
      </div>
    </header>
  );
}
