import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

// Step icons using Remix icons
const stepIcons = [
  'ri-newspaper-line',      // Sources
  'ri-sparkling-2-line',    // AI
  'ri-line-chart-line',     // Analysis
  'ri-user-line',           // Personalization
  'ri-send-plane-line',     // Delivery
];

const stepKeys = ['sources', 'ai', 'analysis', 'personalization', 'delivery'] as const;

const stepGlowColors = [
  'rgba(59, 130, 246, 0.6)',   // blue - sources
  'rgba(168, 85, 247, 0.6)',   // purple - ai
  'rgba(34, 197, 94, 0.6)',    // green - analysis
  'rgba(249, 115, 22, 0.6)',   // orange - personalization
  'rgba(236, 72, 153, 0.6)',   // pink - delivery
];

interface StepCardProps {
  stepKey: typeof stepKeys[number];
  iconClass: string;
  glowColor: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  mode: 'desktop' | 'mobile';
}

function StepCard({ stepKey, iconClass, glowColor, index, total, scrollYProgress, mode }: StepCardProps) {
  const { t } = useTranslation('info');

  const segmentSize = 1 / total;
  const activationPoint = index * segmentSize;
  const fullActivePoint = activationPoint + segmentSize * 0.5;
  const endPoint = activationPoint + segmentSize;

  // Desktop: fade in quickly, stay visible
  // Mobile: fade in/out quickly (one at a time)
  // First step (index 0) appears immediately when section enters viewport
  // Last step stays visible when exiting section on mobile
  const isFirstStep = index === 0;
  const isLastStep = index === total - 1;

  const opacity = useTransform(
    scrollYProgress,
    mode === 'desktop'
      ? isFirstStep
        ? [0, 0.02, 1]  // First step visible almost immediately
        : [activationPoint - 0.02, activationPoint + 0.02, 1]
      : isFirstStep
        ? [0, 0.01, endPoint - 0.02, endPoint]  // First step visible immediately
        : isLastStep
          ? [activationPoint - 0.02, activationPoint + 0.02, 1]  // Last step stays visible
          : [activationPoint - 0.02, activationPoint + 0.02, endPoint - 0.02, endPoint],
    mode === 'desktop'
      ? isFirstStep ? [0, 1, 1] : [0, 1, 1]
      : isLastStep ? [0, 1, 1] : [0, 1, 1, 0]
  );

  // Scale: quick pop-in (last step stays at scale 1 on mobile)
  const scale = useTransform(
    scrollYProgress,
    mode === 'desktop'
      ? isFirstStep
        ? [0, 0.02]
        : [activationPoint - 0.02, activationPoint + 0.02]
      : isFirstStep
        ? [0, 0.02, endPoint - 0.02, endPoint]
        : isLastStep
          ? [activationPoint - 0.02, activationPoint + 0.02]
          : [activationPoint - 0.02, activationPoint + 0.02, endPoint - 0.02, endPoint],
    mode === 'desktop' ? [0.97, 1] : isLastStep ? [0.97, 1] : [0.97, 1, 1, 0.97]
  );

  // Y movement for mobile (last step stays at y=0)
  const y = useTransform(
    scrollYProgress,
    isFirstStep
      ? [0, fullActivePoint, endPoint]
      : isLastStep
        ? [activationPoint, activationPoint + 0.02]
        : [activationPoint, fullActivePoint, endPoint],
    mode === 'mobile'
      ? isLastStep ? [10, 0] : [10, 0, -10]
      : [0, 0, 0]
  );

  // Glow intensity: peaks when step is "current", dims after (last step keeps glow on mobile)
  const glowIntensity = useTransform(
    scrollYProgress,
    isFirstStep
      ? [0, 0.05, endPoint]
      : isLastStep
        ? [activationPoint, fullActivePoint, 1]
        : [activationPoint, fullActivePoint, endPoint],
    mode === 'desktop' ? [0.5, 1, 0.3] : isLastStep ? [0, 1, 0.6] : [0, 1, 0]
  );

  return (
    <motion.div
      className={mode === 'mobile' ? "absolute inset-0 flex flex-col items-center justify-center text-center px-8" : "flex flex-col items-start text-center w-36 xl:w-40"}
      style={{ opacity, scale, y }}
    >
      {/* Icon container with glow */}
      <motion.div
        className="relative w-12 h-12 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-3 border border-zinc-700/50 mx-auto"
        style={{
          boxShadow: useTransform(
            glowIntensity,
            (v) => `0 0 ${20 * v}px ${glowColor}, 0 0 ${40 * v}px ${glowColor}, inset 0 0 ${10 * v}px ${glowColor.replace('0.6', '0.1')}`
          ),
        }}
      >
        <i className={`${iconClass} text-xl text-white`} />
      </motion.div>

      {/* Text container with fixed height */}
      <div className="flex flex-col items-center w-full">
        {/* Title */}
        <h3 className="text-sm font-semibold text-white mb-1.5">
          {t(`howItWorks.steps.${stepKey}.title`)}
        </h3>

        {/* Description */}
        <p className="text-xs text-zinc-400 leading-relaxed">
          {t(`howItWorks.steps.${stepKey}.description`)}
        </p>
      </div>
    </motion.div>
  );
}

interface ConnectorLineProps {
  index: number;
  scrollYProgress: MotionValue<number>;
  totalSteps: number;
}

function ConnectorLine({ index, scrollYProgress, totalSteps }: ConnectorLineProps) {
  const segmentSize = 1 / totalSteps;
  const lineStart = (index + 0.5) * segmentSize;
  const lineEnd = (index + 1) * segmentSize;

  // Line width grows from 0% to 100%
  const width = useTransform(
    scrollYProgress,
    [lineStart, lineEnd],
    ['0%', '100%']
  );

  // Line opacity
  const lineOpacity = useTransform(
    scrollYProgress,
    [lineStart - 0.01, lineStart + 0.02],
    [0, 1]
  );

  return (
    <motion.div
      className="relative h-px w-full overflow-hidden"
      style={{ opacity: lineOpacity }}
    >
      {/* Animated fill with fading edges */}
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
        style={{ width }}
      />
    </motion.div>
  );
}

export function HowItWorksSection() {
  const { t } = useTranslation('info');
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.85', 'end end'],
  });

  // Header opacity - visible when section enters viewport
  const headerOpacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative bg-zinc-900"
      style={{ height: '180vh' }}
    >
      {/* Subtle radial gradient for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800/30 via-transparent to-transparent pointer-events-none" />

      {/* Sticky container */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center px-6">
        {/* Header */}
        <motion.div
          className="absolute top-16 lg:top-24 left-0 right-0 text-center px-6"
          style={{ opacity: headerOpacity }}
        >
          <h2 className="text-xs lg:text-sm font-medium text-zinc-500 uppercase tracking-widest mb-3">
            {t('howItWorks.sectionTitle')}
          </h2>
          <h3 className="text-2xl lg:text-4xl font-bold text-white tracking-tight">
            {t('howItWorks.title')}
          </h3>
        </motion.div>

        {/* Desktop: Horizontal layout */}
        <div className="hidden lg:flex items-start justify-center w-full max-w-5xl">
          {stepKeys.map((key, index) => (
            <div key={key} className="flex items-start">
              <StepCard
                stepKey={key}
                iconClass={stepIcons[index]}
                glowColor={stepGlowColors[index]}
                index={index}
                total={stepKeys.length}
                scrollYProgress={scrollYProgress}
                mode="desktop"
              />
              {index < stepKeys.length - 1 && (
                <div className="w-8 xl:w-14 mx-1 mt-6 flex items-center">
                  <ConnectorLine
                    index={index}
                    scrollYProgress={scrollYProgress}
                    totalSteps={stepKeys.length}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: One step at a time (like ManifestSection) */}
        <div className="lg:hidden relative h-full w-full">
          {stepKeys.map((key, index) => (
            <StepCard
              key={key}
              stepKey={key}
              iconClass={stepIcons[index]}
              glowColor={stepGlowColors[index]}
              index={index}
              total={stepKeys.length}
              scrollYProgress={scrollYProgress}
              mode="mobile"
            />
          ))}
        </div>

        {/* Progress indicator at bottom */}
        <motion.div
          className="absolute bottom-12 lg:bottom-16 left-0 right-0 flex justify-center gap-2"
          style={{ opacity: headerOpacity }}
        >
          {stepKeys.map((_, index) => (
            <ProgressDot
              key={index}
              index={index}
              scrollYProgress={scrollYProgress}
              total={stepKeys.length}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

interface ProgressDotProps {
  index: number;
  scrollYProgress: MotionValue<number>;
  total: number;
}

function ProgressDot({ index, scrollYProgress, total }: ProgressDotProps) {
  const segmentSize = 1 / total;
  const start = index * segmentSize;
  const peak = start + segmentSize * 0.5;
  const end = start + segmentSize;

  const scale = useTransform(
    scrollYProgress,
    [start, peak, end],
    [1, 1.5, 1]
  );

  const opacity = useTransform(
    scrollYProgress,
    [start, start + segmentSize * 0.3, end - segmentSize * 0.3, end],
    [0.3, 1, 1, 0.3]
  );

  return (
    <motion.div
      className="w-1.5 h-1.5 rounded-full bg-white"
      style={{ scale, opacity }}
    />
  );
}
