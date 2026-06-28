"use client";

import { useEffect } from "react";

/**
 * Adds the `.in` class to any element with `.reveal` once it scrolls
 * into view. Mirrors the original landing.js IntersectionObserver behavior.
 * Respects prefers-reduced-motion via CSS (see globals.css).
 */
export function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in");
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
