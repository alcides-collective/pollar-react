import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const values = [
  {
    title: 'Rzetelność',
    description: 'Informacja powinna służyć zrozumieniu, nie zyskowi. Skupiamy się na prawdzie, nie na wzbudzaniu emocji.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Jakość ponad ilość',
    description: 'Wzmocnienie sygnału, eliminacja szumu. Grupujemy powiązane historie i prezentujemy różne perspektywy.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
];

interface ValueCardProps {
  value: typeof values[0];
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}

function ValueCard({ value, index, scrollYProgress }: ValueCardProps) {
  const total = values.length;

  // Each value takes up 1/total of the scroll, with overlap for smooth transitions
  const segmentSize = 1 / total;
  const start = index * segmentSize;
  const peak = start + segmentSize * 0.5;
  const end = start + segmentSize;

  // Fade in from 0 to peak, fade out from peak to end
  const opacity = useTransform(
    scrollYProgress,
    [
      Math.max(0, start - 0.05),  // Start fading in slightly before
      start + segmentSize * 0.2,  // Fully visible
      end - segmentSize * 0.2,    // Start fading out
      Math.min(1, end + 0.05),    // Fully hidden
    ],
    [0, 1, 1, 0]
  );

  // Subtle y movement
  const y = useTransform(
    scrollYProgress,
    [start, peak, end],
    [30, 0, -30]
  );

  // Subtle scale
  const scale = useTransform(
    scrollYProgress,
    [start, peak, end],
    [0.95, 1, 0.95]
  );

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
      style={{ opacity, y, scale }}
    >
      <div className="inline-flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 rounded-3xl bg-zinc-100 text-zinc-900 mb-8">
        {value.icon}
      </div>
      <h3 className="text-3xl lg:text-5xl font-bold text-zinc-900 mb-4 tracking-tight max-w-2xl">
        {value.title}
      </h3>
      <p className="text-lg lg:text-xl text-zinc-600 leading-relaxed max-w-xl">
        {value.description}
      </p>
    </motion.div>
  );
}

export function ManifestSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.2'],
  });

  // Progress indicator dots
  const progressOpacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative bg-white"
      style={{ height: `${values.length * 60 + 40}vh` }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Header - fades in at start */}
        <motion.div
          className="absolute top-20 lg:top-28 left-0 right-0 text-center px-6"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]),
          }}
        >
          <h2 className="text-sm lg:text-base font-medium text-zinc-400 uppercase tracking-widest">
            Co nas wyróżnia
          </h2>
        </motion.div>

        {/* Values - each one fades in/out based on scroll */}
        <div className="relative h-full">
          {values.map((value, index) => (
            <ValueCard
              key={value.title}
              value={value}
              index={index}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>

        {/* Progress indicator */}
        <motion.div
          className="absolute bottom-20 lg:bottom-28 left-0 right-0 flex justify-center gap-3"
          style={{ opacity: progressOpacity }}
        >
          {values.map((_, index) => (
            <ProgressDot
              key={index}
              index={index}
              scrollYProgress={scrollYProgress}
              total={values.length}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

interface ProgressDotProps {
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  total: number;
}

function ProgressDot({ index, scrollYProgress, total }: ProgressDotProps) {
  const segmentSize = 1 / total;
  const start = index * segmentSize;
  const end = start + segmentSize;

  const scale = useTransform(
    scrollYProgress,
    [start, start + segmentSize * 0.5, end],
    [1, 1.5, 1]
  );

  const opacity = useTransform(
    scrollYProgress,
    [start, start + segmentSize * 0.3, end - segmentSize * 0.3, end],
    [0.3, 1, 1, 0.3]
  );

  return (
    <motion.div
      className="w-2 h-2 rounded-full bg-zinc-900"
      style={{ scale, opacity }}
    />
  );
}
