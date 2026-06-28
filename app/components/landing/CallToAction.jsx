"use client";

import { motion } from "motion/react";

export default function CallToAction({ onGetStarted }) {
  return (
    <section id="about" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-600 px-8 py-16 text-center sm:px-16"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white opacity-10 blur-3xl"
        />
        <h2 className="relative font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Ready to find what you lost?
        </h2>
        <p className="relative mt-3 text-[15px] text-white/95">
          Join hundreds of students using TrackBack every week.
        </p>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onGetStarted}
          className="relative mt-8 inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-[15px] font-semibold text-brand-700 shadow-lg transition-shadow hover:shadow-xl"
        >
          Log in now
        </motion.button>
      </motion.div>
    </section>
  );
}
