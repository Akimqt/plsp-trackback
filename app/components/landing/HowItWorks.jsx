"use client";

import { motion } from "motion/react";
import { useRevealVariants } from "../../hooks/useRevealVariants";

const steps = [
  { number: "01", title: "Sign in", description: "Use your campus account to access TrackBack securely." },
  { number: "02", title: "Report or browse", description: "Submit a lost or found report — or search what's already listed." },
  { number: "03", title: "Reunite", description: "Message the finder, verify the item, and pick it up." },
];

export default function HowItWorks() {
  const { container, item } = useRevealVariants();

  return (
    <section id="how" className="bg-surface-sunken">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-brand-600">
            How it works
          </p>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Three steps from lost to found
          </h2>
        </div>

        <motion.ol
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-10 grid gap-6 sm:grid-cols-3"
        >
          {steps.map((step, i) => (
            <motion.li
              key={step.number}
              variants={item}
              className="relative rounded-2xl bg-surface p-7"
            >
              <span
                className="font-display text-4xl font-extrabold text-transparent"
                style={{ WebkitTextStroke: "1.5px #22a552" }}
              >
                {step.number}
              </span>
              <h3 className="mt-3 text-base font-bold text-ink">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                {step.description}
              </p>
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute right-[-13px] top-1/2 hidden h-px w-6 -translate-y-1/2 bg-gradient-to-r from-brand-500 to-transparent sm:block"
                />
              )}
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
