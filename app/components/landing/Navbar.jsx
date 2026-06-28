"use client";

import Link from "next/link";
import { motion } from "motion/react";

export default function Navbar({ onLogin }) {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 border-b border-border bg-canvas/90 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-10 px-5 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/plsp-logo.jpg"
            alt="PLSP official seal"
            className="h-9 w-9 rounded-full border border-border-strong bg-surface object-contain p-0.5"
          />
          <span className="font-display text-[17px] font-bold tracking-tight text-ink">
            TrackBack
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-8 text-sm font-medium text-ink-muted sm:flex">
          <a href="#features" className="transition-colors hover:text-brand-600">
            Features
          </a>
          <a href="#how" className="transition-colors hover:text-brand-600">
            How it works
          </a>
          <a href="#about" className="transition-colors hover:text-brand-600">
            About
          </a>
        </nav>

        <button
          onClick={onLogin}
          className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-canvas transition-all hover:scale-[1.03] hover:bg-brand-700 active:scale-[0.98]"
        >
          Log in
        </button>
      </div>
    </motion.header>
  );
}
