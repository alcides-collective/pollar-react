import { motion } from 'framer-motion';

const team = [
  {
    name: 'Jakub Dudek',
    role: 'Programista',
    location: 'Kraków',
    description: 'Buduje całą stronę techniczną Pollar — od interfejsu po serwery. Dba o szybkość, sprawność i niezawodność systemu.',
    email: 'jakub@pollar.pl',
  },
  {
    name: 'Bartosz Kasprzycki',
    role: 'Produkt i Marketing',
    location: 'Warszawa',
    description: 'Pilnuje intuicyjności i dba o to, żeby Pollar nie zabierał zbyt dużo Twojego czasu, jednocześnie dostarczając wartość.',
    email: 'bartosz@pollar.pl',
  },
];

export function TeamSection() {
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
            Twórcy
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Dwóch przyjaciół z wizją — pomagamy ludziom być na bieżąco bez przytłaczania ich nadmiarem informacji.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Photo */}
          <motion.div
            className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-100"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="/images/team/founders.webp"
              alt="Jakub i Bartosz - twórcy Pollar"
              className="w-full h-full object-cover"
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
              <div key={member.name} className={index > 0 ? 'pt-10 border-t border-zinc-200' : ''}>
                <h3 className="text-xl font-semibold text-zinc-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-sky-600 font-medium mb-3">
                  {member.role} • {member.location}
                </p>
                <p className="text-zinc-600 leading-relaxed mb-3">
                  {member.description}
                </p>
                <a
                  href={`mailto:${member.email}`}
                  className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                >
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
            Pollar jest w fazie <span className="font-semibold">bety</span>. Twój feedback jest dla nas niezwykle cenny — pisz śmiało!
          </p>
        </motion.div>
      </div>
    </section>
  );
}
