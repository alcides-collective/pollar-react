import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

const footerSections = [
  {
    title: 'Nawigacja',
    links: [
      { label: 'Strona główna', to: '/' },
      { label: 'Daily Brief', to: '/brief' },
      { label: 'Mapa wydarzeń', to: '/mapa' },
      { label: 'Terminal', to: '/terminal' },
      { label: 'Powiązania', to: '/powiazania' },
    ],
  },
  {
    title: 'Sejm',
    links: [
      { label: 'Dashboard', to: '/sejm' },
      { label: 'Posłowie', to: '/sejm/poslowie' },
      { label: 'Głosowania', to: '/sejm/glosowania' },
      { label: 'Komisje', to: '/sejm/komisje' },
      { label: 'Druki', to: '/sejm/druki' },
    ],
  },
  {
    title: 'Dane',
    links: [
      { label: 'Przegląd', to: '/dane' },
      { label: 'Jakość powietrza', to: '/dane/srodowisko/powietrze' },
      { label: 'Energia', to: '/dane/ekonomia/energia' },
      { label: 'Eurostat', to: '/dane/ekonomia/eurostat' },
      { label: 'Mieszkania', to: '/dane/ekonomia/mieszkania' },
    ],
  },
];

const legalLinks = [
  { label: 'Regulamin', to: '#' },
  { label: 'Polityka prywatności', to: '/polityka-prywatnosci' },
  { label: 'Cookies', to: '#' },
];

const socialLinks = [
  { label: 'X', icon: 'ri-twitter-x-line', href: 'https://x.com' },
  { label: 'LinkedIn', icon: 'ri-linkedin-line', href: 'https://linkedin.com' },
  { label: 'GitHub', icon: 'ri-github-line', href: 'https://github.com' },
];

export function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        {/* Logo i tagline */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Link to="/" className="inline-block group">
            <h2 className="text-2xl font-bold text-white tracking-tight group-hover:text-zinc-300 transition-colors">
              Pollar News
            </h2>
          </Link>
          <p className="text-zinc-500 text-sm mt-2 max-w-xs">
            Agregator wiadomości napędzany AI. Śledź wydarzenia, analizuj dane Sejmu i eksploruj statystyki publiczne.
          </p>
        </motion.div>

        {/* Sekcje linków */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
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
                    <Link
                      to={link.to}
                      className="text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Sekcja Prawne */}
          <motion.div variants={staggerItem}>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Prawne
            </h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Dolna sekcja */}
        <motion.div
          className="border-t border-zinc-800 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Pollar News. Wszelkie prawa zastrzeżone.
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
              >
                <i className={`${link.icon} text-lg`} />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
