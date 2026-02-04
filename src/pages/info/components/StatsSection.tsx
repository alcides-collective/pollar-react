import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState, useMemo } from 'react';
import { useEvents } from '@/stores/eventsStore';
import { useArchiveEvents } from '@/hooks/useArchiveEvents';

function AnimatedCounter({ value, suffix, duration = 2 }: { value: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Easing function for smoother animation
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

// Icons for each stat
const icons = {
  events: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
    </svg>
  ),
  sources: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  ),
  ads: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  availability: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

export function StatsSection() {
  // Fetch current events + archive events
  const { events: currentEvents } = useEvents({ limit: 100, lang: 'pl', skipHiddenFilter: true });
  const { events: archiveEvents } = useArchiveEvents({ limit: 500, lang: 'pl' });

  // Combine and deduplicate events from both sources
  const aggregatedStats = useMemo(() => {
    // Merge current + archive, deduplicate by ID
    const eventMap = new Map<string, typeof currentEvents[0]>();

    currentEvents.forEach((event) => eventMap.set(event.id, event));
    archiveEvents.forEach((event) => {
      if (!eventMap.has(event.id)) {
        eventMap.set(event.id, event);
      }
    });

    const allEvents = Array.from(eventMap.values());

    if (allEvents.length === 0) {
      return { totalEvents: 1000, uniqueSources: 50 };
    }

    // Count unique sources across all events
    const allSources = new Set<string>();
    allEvents.forEach((event) => {
      event.sources?.forEach((source) => allSources.add(source));
    });

    return {
      totalEvents: allEvents.length,
      uniqueSources: allSources.size,
    };
  }, [currentEvents, archiveEvents]);

  const stats = [
    { value: aggregatedStats.totalEvents, suffix: '+', label: 'Wydarzeń', icon: icons.events, color: 'sky' },
    { value: aggregatedStats.uniqueSources, suffix: '+', label: 'Źródeł informacji', icon: icons.sources, color: 'violet' },
    { value: 0, suffix: '', label: 'Reklam', icon: icons.ads, color: 'emerald', highlight: true },
    { value: 24, suffix: '/7', label: 'Dostępność', icon: icons.availability, color: 'amber' },
  ];

  const colorClasses = {
    sky: {
      bg: 'from-sky-500/20 to-sky-600/5',
      border: 'border-sky-500/20 hover:border-sky-400/40',
      glow: 'group-hover:shadow-[0_0_30px_rgba(14,165,233,0.3)]',
      icon: 'text-sky-400',
      number: 'from-sky-300 to-sky-500',
    },
    violet: {
      bg: 'from-violet-500/20 to-violet-600/5',
      border: 'border-violet-500/20 hover:border-violet-400/40',
      glow: 'group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]',
      icon: 'text-violet-400',
      number: 'from-violet-300 to-violet-500',
    },
    emerald: {
      bg: 'from-emerald-500/20 to-emerald-600/5',
      border: 'border-emerald-500/20 hover:border-emerald-400/40',
      glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]',
      icon: 'text-emerald-400',
      number: 'from-emerald-300 to-emerald-500',
    },
    amber: {
      bg: 'from-amber-500/20 to-amber-600/5',
      border: 'border-amber-500/20 hover:border-amber-400/40',
      glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]',
      icon: 'text-amber-400',
      number: 'from-amber-300 to-amber-500',
    },
  };

  return (
    <section className="py-20 lg:py-28 bg-zinc-950 relative overflow-hidden">
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {stats.map((stat) => {
            const colors = colorClasses[stat.color as keyof typeof colorClasses];
            return (
              <motion.div
                key={stat.label}
                className={`group relative rounded-2xl border backdrop-blur-sm bg-gradient-to-b ${colors.bg} ${colors.border} ${colors.glow} p-6 lg:p-8 transition-all duration-500`}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                {/* Icon */}
                <div className={`${colors.icon} mb-4 opacity-80`}>
                  {stat.icon}
                </div>

                {/* Number with gradient */}
                <div className={`text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 bg-gradient-to-r ${colors.number} bg-clip-text text-transparent`}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>

                {/* Label */}
                <div className="text-zinc-400 text-sm lg:text-base font-medium">
                  {stat.label}
                </div>

                {/* Subtle shine effect on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
