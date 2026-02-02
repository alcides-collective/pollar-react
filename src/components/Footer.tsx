import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

const footerSections = [
  {
    title: 'Rynki',
    links: [
      { label: 'Akcje', href: '#' },
      { label: 'Waluty', href: '#' },
      { label: 'Surowce', href: '#' },
      { label: 'Obligacje', href: '#' },
      { label: 'Crypto', href: '#' },
    ],
  },
  {
    title: 'Sekcje',
    links: [
      { label: 'Ekonomia', href: '#' },
      { label: 'Przemysł', href: '#' },
      { label: 'Technologia', href: '#' },
      { label: 'Polityka', href: '#' },
      { label: 'Finanse', href: '#' },
    ],
  },
  {
    title: 'Media',
    links: [
      { label: 'Na żywo', href: '#' },
      { label: 'Podcasty', href: '#' },
      { label: 'Newsletter', href: '#' },
      { label: 'Wideo', href: '#' },
    ],
  },
  {
    title: 'Firma',
    links: [
      { label: 'O nas', href: '#' },
      { label: 'Kariera', href: '#' },
      { label: 'Reklama', href: '#' },
      { label: 'Kontakt', href: '#' },
    ],
  },
];

const legalLinks = [
  { label: 'Regulamin', href: '#' },
  { label: 'Polityka prywatności', to: '/polityka-prywatnosci' },
  { label: 'Cookies', href: '#' },
  { label: 'Dostępność', href: '#' },
];

const socialLinks = [
  { label: 'Twitter', href: '#' },
  { label: 'LinkedIn', href: '#' },
  { label: 'Facebook', href: '#' },
  { label: 'Instagram', href: '#' },
];

export function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-5 gap-10"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
        >
          {footerSections.map((section) => (
            <motion.div key={section.title} variants={staggerItem}>
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
          <motion.div variants={staggerItem}>
            <h4 className="text-white font-semibold mb-4">Prawne</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  {link.to ? (
                    <Link to={link.to} className="hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
        <motion.div
          className="border-t border-zinc-800 mt-10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <p className="text-zinc-500 text-sm">
            &copy; 2026 Pollar. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex gap-8 text-zinc-400 text-sm">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
