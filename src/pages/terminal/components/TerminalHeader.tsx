interface TerminalHeaderProps {
  currentTime: Date;
  onBack: () => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function TerminalHeader({ currentTime, onBack }: TerminalHeaderProps) {
  return (
    <header className="terminal-header">
      <div className="header-left">
        <button className="mobile-back" onClick={onBack} aria-label="Wróć">←</button>
        <span className="logo">POLLAR</span>
        <span className="separator">|</span>
        <span className="mode">TERMINAL (ALPHA)</span>
      </div>
      <div className="header-center">
        <span className="time">{formatTime(currentTime)}</span>
        <span className="date">{formatDate(currentTime)}</span>
      </div>
      <div className="header-right">
        <span className="hint">ESC - WYJSCIE</span>
      </div>
    </header>
  );
}
