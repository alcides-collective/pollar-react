import { LocalizedLink } from '@/components/LocalizedLink';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { CcAttribution } from '@/components/common/CcAttribution';

const featureKeys = [
  { key: 'brief', icon: 'ri-calendar-todo-line', href: '/brief', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' },
  { key: 'assistant', icon: 'ri-robot-2-line', href: '/asystent', color: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400' },
  { key: 'sejm', icon: 'ri-government-line', href: '/sejm', color: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' },
  { key: 'stock', icon: 'ri-stock-line', href: '/gielda', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
  { key: 'data', icon: 'ri-bar-chart-box-line', href: '/dane', color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' },
  { key: 'connections', icon: 'ri-gamepad-line', href: '/powiazania', color: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400' },
  { key: 'map', icon: 'ri-map-pin-line', href: '/mapa', color: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400' },
  { key: 'terminal', icon: 'ri-terminal-line', href: '/terminal', color: 'bg-surface text-content' },
  { key: 'archive', icon: 'ri-archive-line', href: '/archiwum', color: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400' },
] as const;

export function FeaturesSection() {
  const { t } = useTranslation('info');

  const features = featureKeys.map((feature) => ({
    ...feature,
    title: t(`features.items.${feature.key}.title`),
    description: t(`features.items.${feature.key}.description`),
  }));

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-surface to-background relative overflow-hidden">
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
          <h2 className="text-4xl lg:text-5xl font-bold text-content-heading mb-4 tracking-tight">
            {t('features.title')}
          </h2>
          <p className="text-lg text-content max-w-2xl mx-auto">
            {t('features.subtitle')}
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
              key={feature.key}
              variants={staggerItem}
              className="break-inside-avoid"
            >
              <LocalizedLink
                to={feature.href}
                className="group block bg-background/80 backdrop-blur-sm rounded-2xl border border-divider/50 hover:border-divider hover:shadow-xl hover:bg-background hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 p-6 lg:p-8"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} mb-5`}>
                  <i className={`${feature.icon} text-2xl`} />
                </div>
                <h3 className="text-lg font-semibold text-content-heading mb-2 group-hover:text-content transition-colors">
                  {feature.title}
                </h3>
                <p className="text-content text-sm leading-relaxed">
                  {feature.description}
                </p>
              </LocalizedLink>
            </motion.div>
          ))}
        </motion.div>

        <CcAttribution />
      </div>
    </section>
  );
}
