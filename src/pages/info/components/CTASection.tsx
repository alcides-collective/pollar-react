import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function CTASection() {
  const { t } = useTranslation('info');

  return (
    <section className="py-20 lg:py-28 bg-zinc-900 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-900/30 via-transparent to-transparent" />

      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: 'url(/grain.webp)' }}
      />

      <div className="relative z-10 max-w-[800px] mx-auto px-6 text-center">
        <motion.h2
          className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          {t('cta.title')}
        </motion.h2>

        <motion.p
          className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {t('cta.subtitle')}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button size="lg" asChild className="text-base px-8 py-6 shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_50px_rgba(59,130,246,0.7)] transition-shadow duration-300">
            <Link to="/">{t('cta.primaryButton')}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-base px-8 py-6 bg-white text-zinc-900 border-white hover:bg-zinc-100 hover:text-zinc-900 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transition-shadow duration-300">
            <Link to="/brief">{t('cta.secondaryButton')}</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
