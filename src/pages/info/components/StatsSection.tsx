import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useBrief } from '@/hooks/useBrief';

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
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

export function StatsSection() {
  const { brief } = useBrief({ lang: 'pl' });

  const stats = [
    { value: brief?.analytics?.totalEvents ?? 1000, suffix: '+', label: 'Wydarzeń dziennie' },
    { value: brief?.analytics?.topSources?.length ?? 50, suffix: '+', label: 'Źródeł informacji' },
    { value: 0, suffix: '', label: 'Reklam', highlight: true },
    { value: 24, suffix: '/7', label: 'Dostępność' },
  ];

  return (
    <section className="py-16 bg-zinc-900 relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
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
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              className="text-center"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <div className={`text-4xl lg:text-5xl font-bold mb-2 ${stat.highlight ? 'text-emerald-400' : 'text-white'}`}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-zinc-400 text-sm lg:text-base">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
