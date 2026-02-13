import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { LocalizedLink } from './LocalizedLink';
import { trackSocialProfileClicked } from '@/lib/analytics';


const socialLinks = [
  { label: 'X', icon: 'ri-twitter-x-line', href: 'https://x.com/pollarnews' },
  { label: 'LinkedIn', icon: 'ri-linkedin-line', href: 'https://www.linkedin.com/company/108790026' },
];

export function Footer() {
  const { t } = useTranslation('common');
  const footerSections = [
    {
      title: t('footer.navigation'),
      links: [
        { label: t('footer.home'), to: '/' },
        { label: t('nav.dailyBrief'), to: '/brief' },
        { label: t('nav.aiAssistant'), to: '/asystent' },
        { label: t('nav.eventMap'), to: '/mapa' },
        { label: t('nav.connectionGraph'), to: '/graf' },
        { label: t('nav.terminal'), to: '/terminal' },
      ],
    },
    {
      title: t('footer.more', 'Więcej'),
      links: [
        { label: t('nav.connections'), to: '/powiazania' },
        { label: t('nav.archive'), to: '/archiwum' },
        { label: t('nav.weather', 'Pogoda'), to: '/pogoda' },
        { label: t('nav.sources'), to: '/sources' },
        { label: t('nav.about'), to: '/info' },
      ],
    },
    {
      title: t('nav.sejm'),
      links: [
        { label: t('user.dashboard'), to: '/sejm' },
        { label: t('sejm:navigation.mps'), to: '/sejm/poslowie' },
        { label: t('sejm:navigation.votings'), to: '/sejm/glosowania' },
        { label: t('sejm:navigation.committees'), to: '/sejm/komisje' },
        { label: t('sejm:navigation.prints'), to: '/sejm/druki' },
      ],
    },
    {
      title: t('nav.stockExchange'),
      links: [
        { label: t('gielda:navigation.overview'), to: '/gielda' },
        { label: t('gielda:navigation.stocks'), to: '/gielda/akcje' },
        { label: t('gielda:navigation.indices'), to: '/gielda/indeksy' },
        { label: t('gielda:navigation.watchlist'), to: '/gielda/watchlist' },
      ],
    },
    {
      title: t('nav.openData'),
      links: [
        { label: t('gielda:navigation.overview'), to: '/dane' },
        { label: t('openData.airQuality'), to: '/dane/srodowisko/powietrze' },
        { label: t('openData.energy'), to: '/dane/ekonomia/energia' },
        { label: t('openData.eurostat'), to: '/dane/ekonomia/eurostat' },
        { label: t('openData.housing'), to: '/dane/ekonomia/mieszkania' },
      ],
    },
  ];

  const legalLinks = [
    { label: t('footer.terms'), to: '/regulamin' },
    { label: t('footer.privacyPolicy'), to: '/polityka-prywatnosci' },
    { label: t('footer.cookies'), to: '/cookies' },
    { label: t('footer.contact'), to: '/kontakt' },
  ];

  return (
    <footer className="bg-zinc-900 dark:bg-zinc-800 border-t border-zinc-800 dark:border-zinc-700 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        {/* Logo i tagline */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <LocalizedLink to="/" className="inline-block group">
            <h2 className="text-2xl font-bold text-white tracking-tight group-hover:text-zinc-300 transition-colors">
              Pollar News
            </h2>
          </LocalizedLink>
          <p className="text-zinc-500 text-sm mt-2 max-w-xs">
            {t('footer.description')}
          </p>
        </motion.div>

        {/* Sekcje linków */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-12"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
        >
          {footerSections.map((section) => (
            <motion.div key={section.title} variants={staggerItem}>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <LocalizedLink
                      to={link.to}
                      className="text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </LocalizedLink>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Sekcja Prawne */}
          <motion.div variants={staggerItem}>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <LocalizedLink
                    to={link.to}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </LocalizedLink>
                </li>
              ))}
              <li>
                <a
                  href="https://status.pollar.news/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Status
                </a>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Dolna sekcja */}
        <motion.div
          className="border-t border-zinc-800 dark:border-zinc-700 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Pollar News. {t('footer.allRightsReserved')}
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all"
                aria-label={link.label}
                onClick={() => trackSocialProfileClicked({ platform: link.label.toLowerCase(), location: 'footer' })}
              >
                <i className={`${link.icon} text-lg`} />
              </a>
            ))}
            <LocalizedLink
              to="/rss"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-orange-500 hover:text-white transition-all"
              aria-label="RSS Feed"
            >
              <i className="ri-rss-line text-lg" />
            </LocalizedLink>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
