import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

const features = [
  {
    title: 'Daily Brief',
    description: 'Codzienny przegląd najważniejszych wydarzeń. Wszystko, co musisz wiedzieć, w jednym miejscu.',
    icon: 'ri-calendar-todo-line',
    href: '/brief',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'AI Asystent',
    description: 'Zadaj pytanie o dzisiejsze wiadomości. AI pomoże Ci zrozumieć kontekst i powiązania między wydarzeniami.',
    icon: 'ri-robot-2-line',
    href: '/asystent',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    title: 'Sejm',
    description: 'Śledź głosowania, projekty ustaw i aktywność posłów. Pełna transparentność prac parlamentu.',
    icon: 'ri-government-line',
    href: '/sejm',
    color: 'bg-red-50 text-red-600',
  },
  {
    title: 'Giełda',
    description: 'Notowania, analizy i prognozy rynkowe. Bądź na bieżąco z sytuacją na GPW.',
    icon: 'ri-stock-line',
    href: '/gielda',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'Dane',
    description: 'Wizualizacje danych publicznych. Od jakości powietrza po statystyki przestępczości.',
    icon: 'ri-bar-chart-box-line',
    href: '/dane',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Powiązania',
    description: 'Codzienna gra słowna. Znajdź ukryte połączenia między słowami i pogrupuj je w kategorie.',
    icon: 'ri-gamepad-line',
    href: '/powiazania',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    title: 'Mapa wydarzeń',
    description: 'Interaktywna mapa z lokalizacją wydarzeń. Zobacz co dzieje się w Polsce i na świecie.',
    icon: 'ri-map-pin-line',
    href: '/mapa',
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    title: 'Terminal',
    description: 'Interfejs terminalowy dla zaawansowanych użytkowników. Szybki dostęp do danych i komend.',
    icon: 'ri-terminal-line',
    href: '/terminal',
    color: 'bg-zinc-100 text-zinc-700',
  },
  {
    title: 'Archiwum',
    description: 'Przeglądaj historyczne wydarzenia. Pełna baza artykułów z możliwością wyszukiwania.',
    icon: 'ri-archive-line',
    href: '/archiwum',
    color: 'bg-orange-50 text-orange-600',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-zinc-50 to-white relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8881_1px,transparent_1px),linear-gradient(to_bottom,#8881_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-zinc-900 mb-4 tracking-tight">
            Wszystko w jednym miejscu
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Wiadomości, dane parlamentarne, rynek finansowy i więcej — dostęp do informacji, które mają znaczenie.
          </p>
        </motion.div>

        <motion.div
          className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={staggerItem}
              className="break-inside-avoid"
            >
              <Link
                to={feature.href}
                className="group block bg-white/80 backdrop-blur-sm rounded-2xl border border-zinc-200/50 hover:border-zinc-300 hover:shadow-xl hover:bg-white hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 p-6 lg:p-8"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} mb-5`}>
                  <i className={`${feature.icon} text-2xl`} />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2 group-hover:text-zinc-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
