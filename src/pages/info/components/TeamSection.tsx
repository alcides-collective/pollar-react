import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';

const teamMembers = [
  { key: 'jakub', name: 'Jakub Dudek', location: 'Kraków', email: 'jakub@pollar.pl' },
  { key: 'bartosz', name: 'Bartosz Kasprzycki', location: 'Berlin', email: 'bartosz@pollar.pl' },
] as const;

export function TeamSection() {
  const { t } = useTranslation('info');

  const team = teamMembers.map((member) => ({
    ...member,
    role: t(`team.members.${member.key}.role`),
    description: t(`team.members.${member.key}.description`),
  }));

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-content-heading mb-4 tracking-tight">
            {t('team.title')}
          </h2>
          <p className="text-lg text-content max-w-2xl mx-auto">
            {t('team.subtitle')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Photo */}
          <motion.div
            className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-surface"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="/images/team/founders.webp"
              alt={t('team.photoAlt')}
              className="w-full h-full object-cover"
              loading="lazy"
              width={800}
              height={1000}
            />
            {/* Grain overlay */}
            <div
              className="absolute inset-0 opacity-[0.1] pointer-events-none mix-blend-overlay"
              style={{ backgroundImage: 'url(/grain.webp)' }}
            />
          </motion.div>

          {/* Team members */}
          <motion.div
            className="space-y-10"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {team.map((member, index) => (
              <div key={member.name} className={index > 0 ? 'pt-10 border-t border-divider' : ''}>
                <h3 className="text-xl font-semibold text-content-heading mb-1">
                  {member.name}
                </h3>
                <p className="text-sky-600 font-medium mb-3">
                  {member.role} • {member.location}
                </p>
                <p className="text-content leading-relaxed mb-3">
                  {member.description}
                </p>
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition-colors font-medium text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {member.email}
                </a>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Beta notice */}
        <motion.div
          className="mt-16 p-6 bg-sky-50 rounded-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-sky-900">
            <Trans i18nKey="team.betaNotice" ns="info" components={{ strong: <span className="font-semibold" /> }} />
          </p>
        </motion.div>
      </div>
    </section>
  );
}
