"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AuthModal({ open, onClose }) {
  const supabase = createClient();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const emailRef = useRef(null);

  useEffect(() => {
    if (open) {
      setError("");
      const t = setTimeout(() => emailRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const switchMode = (m) => {
    setMode(m);
    setError("");
  };

  const handleSubmit = async () => {
    if (!email || !email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (pass.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    setError("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { name: name.trim() } },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      window.location.href = "/app";
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }
      window.location.href = "/app";
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" aria-hidden="false">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalTitle"
            className="relative w-full max-w-[420px] rounded-2xl border border-border bg-surface p-9 shadow-2xl"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-sunken hover:text-brand-600"
            >
              <X size={17} aria-hidden="true" />
            </button>

            <img
              src="/plsp-logo.jpg"
              alt="PLSP official seal"
              className="mb-4 h-12 w-12 rounded-full border border-border-strong bg-surface object-contain p-0.5"
            />

            <h2 id="modalTitle" className="font-display text-2xl font-bold text-ink">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-1 mb-6 text-sm text-ink-soft">
              {mode === "signup" ? "Join TrackBack in seconds." : "Log in to your TrackBack account."}
            </p>

            <div className="mb-5 flex gap-1 rounded-full border border-border bg-surface-sunken p-1">
              <button
                onClick={() => switchMode("login")}
                className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors ${
                  mode === "login" ? "bg-surface text-brand-700 shadow-sm" : "text-ink-muted"
                }`}
              >
                Log in
              </button>
              <button
                onClick={() => switchMode("signup")}
                className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors ${
                  mode === "signup" ? "bg-surface text-brand-700 shadow-sm" : "text-ink-muted"
                }`}
              >
                Sign up
              </button>
            </div>

            <div
              className="flex flex-col gap-3.5"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            >
              {mode === "signup" && (
                <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft">
                  Full name
                  <input
                    type="text"
                    placeholder="Jane Dela Cruz"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border-strong px-3.5 text-sm text-ink outline-none transition-colors focus:border-brand-600"
                  />
                </label>
              )}

              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft">
                Email
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="you@plsp.edu.ph"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border-strong px-3.5 text-sm text-ink outline-none transition-colors focus:border-brand-600"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft">
                Password
                <div className="relative flex items-center">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    minLength={4}
                    autoComplete="current-password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border-strong px-3.5 pr-11 text-sm text-ink outline-none transition-colors focus:border-brand-600"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 flex items-center text-ink-muted transition-colors hover:text-brand-600"
                  >
                    {showPass ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                  </button>
                </div>
              </label>

              {error && (
                <p role="alert" className="rounded-xl border border-danger/25 bg-danger-soft px-3 py-2 text-[12.5px] font-medium text-danger">
                  {error}
                </p>
              )}

              {mode === "login" && (
                <div className="flex items-center justify-between text-[13px]">
                  <label className="flex items-center gap-2 font-normal text-ink-soft">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-border-strong accent-brand-600"
                    />
                    Remember me
                  </label>
                  <span role="button" tabIndex={0} className="cursor-pointer font-semibold text-brand-600 hover:opacity-75">
                    Forgot password?
                  </span>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="mt-1 h-12 w-full rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(21,128,61,0.5)] transition-shadow hover:shadow-[0_10px_24px_-6px_rgba(21,128,61,0.6)] disabled:opacity-60"
              >
                {loading ? "Loading…" : mode === "signup" ? "Create account" : "Log in"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
