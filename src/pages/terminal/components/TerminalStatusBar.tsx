interface TerminalStatusBarProps {
  connected: boolean;
  loading: boolean;
  lastUpdateTime: number;
  eventCount: number;
  totalEventCount: number;
}

function formatUpdateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('pl-PL', {
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
  return (
    <footer className="terminal-status">
      <div className="status-left">
        <span className={`status-indicator ${connected ? 'connected' : ''}`}>
          {loading ? 'LADOWANIE...' : connected ? 'POLACZONO' : 'ROZLACZONO'}
        </span>
      </div>
      <div className="status-center">
        <span className="status-item">
          OSTATNIA AKT.: {formatUpdateTime(lastUpdateTime)}
        </span>
      </div>
      <div className="status-right">
        <span className="status-item">
          WYDARZENIA: {eventCount} / {totalEventCount}
        </span>
      </div>
    </footer>
  );
}
