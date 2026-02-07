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
            <h2 className="text-sm text-content-subtle mb-3 pb-2 border-b border-divider font-medium">
              {t('mentions.people')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {people.map((person, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-sm bg-surface border border-divider text-content rounded hover:bg-muted transition-colors cursor-default"
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
            <h2 className="text-sm text-content-subtle mb-3 pb-2 border-b border-divider font-medium">
              {t('mentions.organizations')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {organizations.map((org, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-sm bg-surface border border-divider text-content rounded hover:bg-muted transition-colors cursor-default"
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
