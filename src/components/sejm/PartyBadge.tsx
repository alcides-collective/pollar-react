import { getPartyColor, getPartyShort } from '../../types/sejm';

interface PartyBadgeProps {
  club: string;
  size?: 'xs' | 'sm' | 'md';
  showFullName?: boolean;
}

export function PartyBadge({ club, size = 'sm', showFullName = false }: PartyBadgeProps) {
  const color = getPartyColor(club);
  const displayName = showFullName ? club : getPartyShort(club);

  const sizeClasses =
    size === 'xs' ? 'text-[6px] px-0.5 py-px' :
    size === 'sm' ? 'text-[10px] px-1.5 py-0.5' :
    'text-xs px-2 py-1';

  return (
    <span
      className={`inline-flex items-center rounded font-medium ${sizeClasses}`}
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {displayName}
    </span>
  );
}
