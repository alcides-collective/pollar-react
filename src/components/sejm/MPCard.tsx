import { Link } from 'react-router-dom';
import { PartyBadge } from './PartyBadge';
import type { SejmMP } from '../../types/sejm';

interface MPCardProps {
  mp: SejmMP;
}

export function MPCard({ mp }: MPCardProps) {
  return (
    <Link
      to={`/sejm/poslowie/${mp.id}`}
      className="block rounded overflow-hidden border border-zinc-200 hover:border-zinc-300 transition-all"
    >
      <div className="relative aspect-[3/4]">
        <img
          src={mp.photoUrl}
          alt={mp.firstLastName}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://api.sejm.gov.pl/sejm/term10/MP/1/photo';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-1.5">
          <p className="text-white text-[9px] font-medium leading-tight mb-0.5 line-clamp-2">
            {mp.firstLastName}
          </p>
          <PartyBadge club={mp.club} size="xs" />
        </div>
        {!mp.active && (
          <div className="absolute top-0.5 right-0.5">
            <span className="bg-zinc-800/80 text-white text-[6px] px-0.5 py-px rounded-sm">
              Nieaktywny
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
