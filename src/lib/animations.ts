import type { Variants, Transition } from 'framer-motion'

// Subtelne presety animacji

// Fade in
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2, ease: 'easeOut' } as Transition,
}

// Fade in z przesunięciem w górę
export const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25, ease: 'easeOut' } as Transition,
}

// Scale in
export const scaleIn = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.2, ease: 'easeOut' } as Transition,
}

// Hover - delikatne powiększenie
export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.15 } as Transition,
}

// Hover - uniesienie
export const hoverLift = {
  whileHover: { y: -4 },
  transition: { duration: 0.2, ease: 'easeOut' } as Transition,
}

// Staggered children - kontener
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

// Staggered children - element
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25 },
  },
}

// Page transitions
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: 'easeInOut' } as Transition,
}

// Scroll reveal (do użycia z whileInView)
export const scrollReveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.4, ease: 'easeOut' } as Transition,
}

// Dropdown menu animation
export const dropdownAnimation: Variants = {
  initial: { opacity: 0, scale: 0.95, y: -5 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -5,
    transition: { duration: 0.1, ease: 'easeIn' },
  },
}

// Tab content animation
export const tabContentAnimation: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
}

// Card hover
export const cardHover = {
  whileHover: {
    y: -2,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
}

// Image hover (wewnątrz kart) - bardziej delikatne i wolniejsze
export const imageHover = {
  whileHover: {
    scale: 1.02,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

// CSS class do użycia z group-hover dla skalowania obrazka
// Użyj: className="group" na kontenerze
// oraz: className="transition-transform duration-500 ease-out group-hover:scale-[1.02]" na obrazku
export const imageHoverClass = 'transition-transform duration-500 ease-out group-hover:scale-[1.02]'
