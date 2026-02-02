import { useParams, Link } from 'react-router-dom';
import { useCommittee, useCommitteeSittings } from '../../hooks/useCommittees';
import { PartyBadge, SejmApiError } from '../../components/sejm';

export function CommitteeDetailPage() {
  const { code } = useParams<{ code: string }>();
  const { committee, loading, error } = useCommittee(code || null);
  const { sittings } = useCommitteeSittings(code || null);

  if (error) {
    return <SejmApiError message={error.message} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-zinc-100 animate-pulse rounded" />
        <div className="h-32 bg-zinc-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!committee) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Nie znaleziono komisji</p>
        <Link to="/sejm/komisje" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          <i className="ri-arrow-left-s-line" /> Wróć do listy
        </Link>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    standing: 'Komisja stała',
    extraordinary: 'Komisja nadzwyczajna',
    investigative: 'Komisja śledcza',
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/sejm/komisje" className="text-sm text-zinc-500 hover:text-zinc-700">
        <i className="ri-arrow-left-s-line" /> Wszystkie komisje
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-zinc-100 text-zinc-600 text-sm font-mono px-2 py-0.5 rounded">
            {committee.code}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded ${
            committee.type === 'standing' ? 'bg-blue-100 text-blue-700' :
            committee.type === 'extraordinary' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {typeLabels[committee.type]}
          </span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-900">{committee.name}</h1>
        {committee.scope && (
          <p className="text-zinc-600 mt-2">{committee.scope}</p>
        )}
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {committee.phone && (
          <div>
            <span className="text-zinc-500">Telefon:</span>
            <p className="text-zinc-900">{committee.phone}</p>
          </div>
        )}
        {committee.appointmentDate && (
          <div>
            <span className="text-zinc-500">Data powołania:</span>
            <p className="text-zinc-900">{formatDate(committee.appointmentDate)}</p>
          </div>
        )}
      </div>

      {/* Presidium */}
      {committee.presidium && committee.presidium.length > 0 && (
        <div className="rounded-lg border border-zinc-200 p-4">
          <h2 className="text-sm font-medium text-zinc-900 mb-3">Prezydium</h2>
          <div className="space-y-2">
            {committee.presidium.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/sejm/poslowie/${member.id}`}
                    className="text-sm text-zinc-900 hover:text-blue-600"
                  >
                    {member.firstLastName}
                  </Link>
                  <PartyBadge club={member.club} size="sm" />
                </div>
                {member.function && (
                  <span className="text-xs text-zinc-500">{member.function}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      {committee.members && committee.members.length > 0 && (
        <div className="rounded-lg border border-zinc-200 p-4">
          <h2 className="text-sm font-medium text-zinc-900 mb-3">
            Członkowie ({committee.members.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {committee.members.map((member) => (
              <div key={member.id} className="flex items-center gap-2">
                <Link
                  to={`/sejm/poslowie/${member.id}`}
                  className="text-sm text-zinc-900 hover:text-blue-600"
                >
                  {member.firstLastName}
                </Link>
                <PartyBadge club={member.club} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sittings */}
      {sittings.length > 0 && (
        <div className="rounded-lg border border-zinc-200 p-4">
          <h2 className="text-sm font-medium text-zinc-900 mb-3">Ostatnie posiedzenia</h2>
          <div className="space-y-2">
            {sittings.slice(0, 5).map((sitting) => (
              <div key={sitting.num} className="flex items-start justify-between py-2 border-b border-zinc-100 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">#{sitting.num}</span>
                    <span className="text-sm text-zinc-900">{formatDate(sitting.date)}</span>
                  </div>
                  {sitting.agenda && (
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{sitting.agenda}</p>
                  )}
                </div>
                {sitting.videoLink && (
                  <a
                    href={sitting.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs text-blue-600 hover:underline"
                  >
                    Video <i className="ri-arrow-right-s-line" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
