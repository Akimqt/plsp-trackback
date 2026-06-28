"use client";

import { useReducedMotion } from "motion/react";

/**
 * Returns animation variants for orchestrated stagger reveals.
 * Collapses to instant, motion-free variants when the user has
 * prefers-reduced-motion enabled.
 */
export function useRevealVariants() {
  const shouldReduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const item = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
        },
      };

  return { container, item, shouldReduceMotion };
}
