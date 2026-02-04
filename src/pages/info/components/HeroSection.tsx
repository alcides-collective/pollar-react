import { LocalizedLink } from '@/components/LocalizedLink';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useEvents } from '@/stores/eventsStore';
import { useArchiveEvents } from '@/hooks/useArchiveEvents';
import { useLanguage } from '@/stores/languageStore';
import logoImg from '@/assets/logo-white.png';

function AnimatedCounter({ value, suffix, duration = 2 }: { value: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString('pl-PL')}{suffix}
    </span>
  );
}

export function HeroSection() {
  const { t } = useTranslation('info');
  const language = useLanguage();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const videoY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Fetch stats
  const { events: currentEvents } = useEvents({ limit: 100, lang: language, skipHiddenFilter: true });
  const { events: archiveEvents } = useArchiveEvents({ limit: 500, lang: language });

  const stats = useMemo(() => {
    const eventMap = new Map<string, typeof currentEvents[0]>();
    currentEvents.forEach((event) => eventMap.set(event.id, event));
    archiveEvents.forEach((event) => {
      if (!eventMap.has(event.id)) eventMap.set(event.id, event);
    });

    const allEvents = Array.from(eventMap.values());
    const allSources = new Set<string>();
    allEvents.forEach((event) => {
      event.sources?.forEach((source) => allSources.add(source));
    });

    return [
      { value: allEvents.length || 500, suffix: '+', label: t('hero.stats.events') },
      { value: allSources.size || 50, suffix: '+', label: t('hero.stats.sources') },
      { value: 0, suffix: '', label: t('hero.stats.ads') },
      { value: 24, suffix: '/7', label: t('hero.stats.online') },
    ];
  }, [currentEvents, archiveEvents, t]);

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden">
      {/* Video background with parallax */}
      <motion.div className="absolute inset-0" style={{ y: videoY }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-110"
        >
          <source src="/videos/hero.webm" type="video/webm" />
        </video>
      </motion.div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />

      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: 'url(/grain.webp)' }}
      />

      {/* Content with parallax */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white text-center px-6 py-20"
        style={{ y: contentY, opacity }}
      >
        <motion.img
          src={logoImg}
          alt="Pollar"
          className="h-10 lg:h-12 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        <motion.h1
          className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 max-w-4xl leading-[1.1] tracking-tight bg-gradient-to-r from-white via-zinc-200 to-white bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          {t('hero.title')}
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-zinc-300 max-w-2xl mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        >
          <Button size="lg" asChild className="text-base px-8 py-6 shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_50px_rgba(59,130,246,0.7)] transition-shadow duration-300">
            <LocalizedLink to="/">{t('hero.cta')}</LocalizedLink>
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-16 lg:mt-20 grid grid-cols-4 gap-6 lg:gap-12 w-full max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs md:text-sm text-zinc-400 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 flex flex-col items-center gap-2 text-zinc-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <span className="text-xs uppercase tracking-widest">{t('hero.scroll')}</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
