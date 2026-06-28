"use client";

import { motion } from "motion/react";
import { useRevealVariants } from "../../hooks/useRevealVariants";

// Custom-drawn glyphs, single stroke weight, no container box —
// intentionally larger and bolder than a typical icon-library glyph
// so they read as a designed mark, not a component pulled off a shelf.
const icons = {
  report: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6h12l6 6v20a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
      <path d="M24 6v6h6" />
      <path d="M14 21h12M14 26h8" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="18" r="10" />
      <path d="M25.5 25.5 33 33" />
    </svg>
  ),
  message: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 10h24a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H17l-7 6v-6h-2a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Z" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 5 33 10v9c0 9.5-6 15.5-13 18-7-2.5-13-8.5-13-18v-9Z" />
      <path d="M15 20l4 4 7-8" />
    </svg>
  ),
};

const capabilities = [
  { key: "report", title: "Report in seconds", description: "Log what you've lost or found with photos and details.", big: true },
  { key: "search", title: "Smart browsing", description: "Filter by category, status, and location to find your item fast." },
  { key: "message", title: "Secure messaging", description: "Coordinate returns privately without sharing personal contacts." },
  { key: "shield", title: "Verified claims", description: "Admins review every claim so items go back to the right owner." },
];

export default function Ledger() {
  const { container, item } = useRevealVariants();

  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="max-w-xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-brand-600">
          Features
        </p>
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Everything you need to find lost items
        </h2>
        <p className="mt-3 text-[15px] text-ink-soft">
          A complete toolkit for students, staff, and admins — built to
          maximize returns.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-10 grid gap-4 sm:grid-cols-2"
      >
        {capabilities.map((cap) => (
          <motion.div
            key={cap.key}
            variants={item}
            whileHover={{ y: -4 }}
            className={`group rounded-2xl border border-border bg-surface p-7 transition-shadow hover:border-brand-500/40 hover:shadow-[0_16px_40px_-16px_rgba(21,128,61,0.2)] ${
              cap.big ? "sm:col-span-2 sm:flex sm:items-center sm:gap-8" : ""
            }`}
          >
            <div className={`h-10 w-10 text-brand-600 transition-transform group-hover:scale-110 ${cap.big ? "shrink-0 sm:h-14 sm:w-14" : ""}`}>
              {icons[cap.key]}
            </div>
            <div className={cap.big ? "mt-4 sm:mt-0" : "mt-4"}>
              <h3 className={`font-display font-bold text-ink ${cap.big ? "text-xl" : "text-base"}`}>
                {cap.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                {cap.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
