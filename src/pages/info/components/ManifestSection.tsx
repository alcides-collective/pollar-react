import { motion } from 'framer-motion';

const values = [
  {
    title: 'Rzetelność',
    description: 'Informacja powinna służyć zrozumieniu, nie zyskowi. Skupiamy się na prawdzie, nie na wzbudzaniu emocji.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Jakość ponad ilość',
    description: 'Wzmocnienie sygnału, eliminacja szumu. Grupujemy powiązane historie i prezentujemy różne perspektywy.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h.01" />
        <path d="M7 20v-4" />
        <path d="M12 20v-8" />
        <path d="M17 20V8" />
        <path d="M22 4v16" />
      </svg>
    ),
  },
  {
    title: 'Szacunek dla czytelnika',
    description: 'Każda chwila powinna zostawiać nas bardziej świadomymi, nie bardziej zaniepokojonym. Tworzymy narzędzia dla myślących ludzi.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
];

export function ManifestSection() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-zinc-900 mb-4 tracking-tight">
            Co nas wyróżnia
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Wierzymy, że informacja powinna służyć zrozumieniu świata, nie generowaniu kliknięć.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8 lg:gap-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          {values.map((value) => (
            <motion.div
              key={value.title}
              className="text-center p-6 lg:p-8 group"
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.5, ease: 'easeOut' },
                },
              }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 mb-6 group-hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-shadow duration-300">
                {value.icon}
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">
                {value.title}
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
