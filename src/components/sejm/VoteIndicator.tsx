import { getVoteColor, type VoteValue } from '../../types/sejm';

interface VoteIndicatorProps {
  vote: VoteValue;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function VoteIndicator({ vote, showLabel = false, size = 'sm' }: VoteIndicatorProps) {
  const color = getVoteColor(vote);

  const sizeClasses = size === 'sm' ? 'w-4 h-4 text-[8px]' : 'w-5 h-5 text-[10px]';

  const icons: Record<VoteValue, string> = {
    'YES': '+',
    'NO': '−',
    'ABSTAIN': '○',
    'ABSENT': '·',
    'VOTE_VALID': '✓',
  };

  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={`inline-flex items-center justify-center rounded-full font-bold ${sizeClasses}`}
        style={{ backgroundColor: color.bg, color: color.text }}
      >
        {icons[vote]}
      </span>
      {showLabel && (
        <span className="text-xs text-content">{color.label}</span>
      )}
    </span>
  );
}
