import { useTranslation } from 'react-i18next';
import type { BriefMentionedPerson } from '../../types/brief';

interface BriefMentionsProps {
  people: BriefMentionedPerson[];
  organizations: string[];
}

export function BriefMentions({ people, organizations }: BriefMentionsProps) {
  const { t } = useTranslation('brief');
  if (!people?.length && !organizations?.length) return null;

  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* People */}
        {people?.length > 0 && (
          <div>
            <h2 className="text-sm text-zinc-500 mb-3 pb-2 border-b border-zinc-200 font-medium">
              {t('mentions.people')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {people.map((person, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-sm bg-zinc-100 border border-zinc-200 text-zinc-700 rounded hover:bg-zinc-200 transition-colors cursor-default"
                  title={person.context}
                >
                  {person.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Organizations */}
        {organizations?.length > 0 && (
          <div>
            <h2 className="text-sm text-zinc-500 mb-3 pb-2 border-b border-zinc-200 font-medium">
              {t('mentions.organizations')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {organizations.map((org, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-sm bg-zinc-100 border border-zinc-200 text-zinc-700 rounded hover:bg-zinc-200 transition-colors cursor-default"
                >
                  {org}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
