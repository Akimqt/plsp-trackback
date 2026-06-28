"use client";

import { motion } from "motion/react";
import { useRevealVariants } from "../../hooks/useRevealVariants";

const entries = [
  { item: "Black backpack", where: "Library", status: "Lost" },
  { item: "iPhone 14", where: "Gym", status: "Found" },
  { item: "Blue water bottle", where: "Cafeteria", status: "Found" },
  { item: "Calculus textbook", where: "Room 204", status: "Returned" },
];

const statusStyles = {
  Lost: "bg-danger-soft text-danger",
  Found: "bg-brand-soft text-brand-700",
  Returned: "bg-surface-sunken text-ink-muted",
};

export default function Hero({ onGetStarted }) {
  const { container, item } = useRevealVariants();

  return (
    <section className="relative overflow-hidden">
      {/* Ambient gradient signature — one bold moment, not wallpaper */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full opacity-[0.35] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, #4ADE80 0%, #15803D 55%, transparent 75%)",
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto grid max-w-6xl gap-16 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-28"
      >
        <div>
          <motion.span
            variants={item}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-3.5 py-1.5 text-xs font-semibold text-brand-700"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            PLSP · Campus Lost &amp; Found
          </motion.span>

          <motion.h1
            variants={item}
            className="font-display text-[2.75rem] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-[3.6rem]"
          >
            Lost something
            <br />
            at PLSP?{" "}
            <span className="bg-gradient-to-r from-brand-700 to-brand-600 bg-clip-text text-transparent">
              Get it back, fast.
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-soft"
          >
            TrackBack is the official lost-and-found platform for PLSP —
            connecting students, faculty, and staff to reunite lost items
            with their owners.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onGetStarted}
              className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-7 text-[15px] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(21,128,61,0.5)] transition-shadow hover:shadow-[0_12px_28px_-6px_rgba(21,128,61,0.6)]"
            >
              Get started — free
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border-strong bg-surface px-7 text-[15px] font-semibold text-ink transition-colors hover:border-brand-500 hover:text-brand-700"
            >
              See what it does
            </motion.a>
          </motion.div>

          <motion.dl variants={item} className="mt-12 flex gap-8 border-t border-border pt-6 text-sm">
            <div>
              <dd className="font-display text-2xl font-bold text-ink">128</dd>
              <dd className="text-ink-muted">Lost reports</dd>
            </div>
            <div>
              <dd className="font-display text-2xl font-bold text-ink">94</dd>
              <dd className="text-ink-muted">Found items</dd>
            </div>
            <div>
              <dd className="font-display text-2xl font-bold text-ink">71</dd>
              <dd className="text-ink-muted">Returned</dd>
            </div>
          </motion.dl>
        </div>

        {/* Status panel — flat, no fake browser chrome */}
        <motion.div
          variants={item}
          className="relative rounded-2xl border border-border-strong bg-surface p-2 shadow-[0_20px_60px_-20px_rgba(21,128,61,0.25)]"
        >
          <div className="rounded-xl bg-gradient-to-r from-brand-700 to-brand-600 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Live activity
            </p>
            <p className="font-display text-lg font-bold text-white">Today&rsquo;s reports</p>
          </div>
          <ul className="divide-y divide-border px-1">
            {entries.map((entry) => (
              <li
                key={entry.item}
                className="flex items-center justify-between gap-4 px-4 py-3.5 text-sm"
              >
                <div>
                  <p className="font-semibold text-ink">{entry.item}</p>
                  <p className="text-ink-muted">{entry.where}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[entry.status]}`}
                >
                  {entry.status}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </section>
  );
}
