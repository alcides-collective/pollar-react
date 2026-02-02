import { useParams, Link } from 'react-router-dom';
import { useClub } from '../../hooks/useClubs';
import { useMPs } from '../../hooks/useMPs';
import { MPCard, SejmApiError } from '../../components/sejm';

export function ClubDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { club, loading, error } = useClub(id || null);
  const { mps } = useMPs();

  // Filter MPs by club
  const clubMPs = mps.filter(mp => mp.club === id);

  if (error) {
    return <SejmApiError message={error.message} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-zinc-100 animate-pulse rounded" />
        <div className="h-24 bg-zinc-100 animate-pulse rounded-lg" />
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-zinc-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Nie znaleziono klubu</p>
        <Link to="/sejm/kluby" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          ← Wróć do listy
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/sejm/kluby" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Wszystkie kluby
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        {club.logoUrl && (
          <img
            src={club.logoUrl}
            alt={club.name}
            className="w-16 h-16 object-contain"
          />
        )}
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">{club.name}</h1>
          <p className="text-zinc-500">{club.membersCount} posłów</p>
        </div>
      </div>

      {/* Contact info */}
      {(club.email || club.phone || club.fax) && (
        <div className="rounded-lg border border-zinc-200 p-4">
          <h2 className="text-sm font-medium text-zinc-900 mb-3">Kontakt</h2>
          <div className="space-y-2 text-sm">
            {club.email && (
              <div>
                <span className="text-zinc-500">Email:</span>{' '}
                <a href={`mailto:${club.email}`} className="text-blue-600 hover:underline">
                  {club.email}
                </a>
              </div>
            )}
            {club.phone && (
              <div>
                <span className="text-zinc-500">Telefon:</span>{' '}
                <span className="text-zinc-900">{club.phone}</span>
              </div>
            )}
            {club.fax && (
              <div>
                <span className="text-zinc-500">Fax:</span>{' '}
                <span className="text-zinc-900">{club.fax}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members */}
      <div>
        <h2 className="text-sm font-medium text-zinc-900 mb-4">
          Członkowie ({clubMPs.length})
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1">
          {clubMPs.map((mp) => (
            <MPCard key={mp.id} mp={mp} />
          ))}
        </div>
      </div>
    </div>
  );
}
