interface VotingResultBarProps {
  yes: number;
  no: number;
  abstain: number;
  notParticipating?: number;
  showNumbers?: boolean;
  height?: 'sm' | 'md';
}

export function VotingResultBar({
  yes,
  no,
  abstain,
  notParticipating = 0,
  showNumbers = true,
  height = 'sm',
}: VotingResultBarProps) {
  const total = yes + no + abstain + notParticipating;
  if (total === 0) return null;

  const yesPercent = (yes / total) * 100;
  const noPercent = (no / total) * 100;
  const abstainPercent = (abstain / total) * 100;

  const heightClass = height === 'sm' ? 'h-2' : 'h-3';

  return (
    <div className="w-full">
      <div className={`flex ${heightClass} rounded-full overflow-hidden bg-zinc-100`}>
        <div
          className="transition-all duration-300"
          style={{
            width: `${yesPercent}%`,
            backgroundColor: 'oklch(65% 0.18 145)',
          }}
        />
        <div
          className="transition-all duration-300"
          style={{
            width: `${noPercent}%`,
            backgroundColor: 'oklch(58% 0.20 25)',
          }}
        />
        <div
          className="transition-all duration-300"
          style={{
            width: `${abstainPercent}%`,
            backgroundColor: 'oklch(82% 0.12 85)',
          }}
        />
      </div>

      {showNumbers && (
        <div className="flex justify-between mt-1 text-xs font-mono">
          <span style={{ color: 'oklch(55% 0.15 145)' }}>{yes}</span>
          <span style={{ color: 'oklch(50% 0.17 25)' }}>{no}</span>
          <span className="text-zinc-400">{abstain}</span>
        </div>
      )}
    </div>
  );
}
