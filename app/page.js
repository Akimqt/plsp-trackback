'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { categoryIcons, actionIcons } from '@/lib/icons';

export default function Landing() {
  const supabase = createClient();

  // ── Auth redirect ───────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) window.location.href = '/app';
    });
  }, []);

  // ── Modal state ─────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode]           = useState('login');

  // ── Form state ──────────────────────────────────────────────
  const [email,    setEmail]    = useState('');
  const [pass,     setPass]     = useState('');
  const [name,     setName]     = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [remember, setRemember] = useState(false);

  const emailRef = useRef(null);

  // ── Open / close modal ──────────────────────────────────────
  const openModal = () => {
    setModalOpen(true);
    setError('');
    setTimeout(() => emailRef.current?.focus(), 50);
  };
  const closeModal = () => {
    setModalOpen(false);
    setError('');
  };

  // ── Switch tab ──────────────────────────────────────────────
  const switchMode = (m) => { setMode(m); setError(''); };

  // ── Keyboard handling ────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && modalOpen) closeModal(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [modalOpen]);

  // ── Hero load-in sequence ─────────────────────────────────────
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── Scroll reveal (staggers direct children for an orchestrated feel) ──
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const target = en.target;
        target.classList.add('in');
        target.querySelectorAll('.stagger').forEach((child, i) => {
          child.style.transitionDelay = `${i * 70}ms`;
        });
        io.unobserve(target);
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (pass.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    setError('');

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { name: name.trim() } },
      });
      if (error) { setError(error.message); setLoading(false); return; }
      window.location.href = '/app';
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) { setError('Invalid email or password.'); setLoading(false); return; }
      window.location.href = '/app';
    }
  };

  // ── Eye icons ─────────────────────────────────────────────────
  const eyeOpenIcon = (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
  const eyeOffIcon = (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="/landing.css" />

      {/* ── Header ── */}
      <header className="nav">
        <div className="nav-inner">
          <Link className="logo" href="/">
            <img src="/plsp-logo.jpg" alt="PLSP Logo" className="logo-mark-img" />
            <span>
              <b>TrackBack</b>
              <small className="logo-sub">Pamantasan ng Lungsod ng San Pablo</small>
            </span>
          </Link>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#about">About</a>
          </nav>
          <button className="btn btn-primary" onClick={openModal}>Log in →</button>
        </div>
      </header>

      {/* ── Main ── */}
      <main>
        {/* ── Hero ── */}
        <section className={`hero${loaded ? ' loaded' : ''}`}>
          <div className="hero-inner">
            <div className="hero-text">
              <span className="eyebrow">Pamantasan ng Lungsod ng San Pablo · Campus Lost &amp; Found</span>
              <h1>Lost something<br />at PLSP?<br /><span className="accent">Get it back, fast.</span></h1>
              <p className="lead">
                TrackBack is the official Lost &amp; Found platform for PLSP, connecting students,
                faculty, and staff so lost items find their way back to their owners.
              </p>
              <div className="cta-row">
                <button className="btn btn-primary btn-lg" onClick={openModal}>Get started, it&apos;s free</button>
                <a href="#features" className="btn btn-ghost btn-lg">Learn more</a>
              </div>
              <div className="trust">
                <div><strong>128</strong><span>Lost reports</span></div>
                <div><strong>94</strong><span>Found items</span></div>
                <div><strong>71</strong><span>Returned</span></div>
              </div>
            </div>
            <div className="hero-card">
              <div className="hero-card-head">
                <span className="dot" /><span className="dot" /><span className="dot" />
                <span className="title">trackback.plsp.edu.ph</span>
              </div>
              <div className="hero-card-body">
                <div className="mini-item"><span className="mini-icon">{categoryIcons.Accessories}</span><div><b>Black Backpack</b><small><span className="status-dot status-lost" />Library · Lost</small></div></div>
                <div className="mini-item"><span className="mini-icon">{categoryIcons.Electronics}</span><div><b>iPhone 14</b><small><span className="status-dot status-found" />Gym · Found</small></div></div>
                <div className="mini-item"><span className="mini-icon">{categoryIcons.Accessories}</span><div><b>Blue Water Bottle</b><small><span className="status-dot status-found" />Cafeteria · Found</small></div></div>
                <div className="mini-item"><span className="mini-icon">{categoryIcons.Books}</span><div><b>Calculus Textbook</b><small><span className="status-dot status-returned" />Room 204 · Returned</small></div></div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="features reveal" id="features">
          <h2>Everything you need to find lost items</h2>
          <p className="section-sub">A complete toolkit for students, staff, and admins, built to maximize returns.</p>
          <div className="feature-grid">
            <div className="feature stagger">
              <div className="f-icon">{actionIcons.reportPlus}</div>
              <h3>Report in seconds</h3>
              <p>Log what you&apos;ve lost or found with photos and details.</p>
            </div>
            <div className="feature stagger">
              <div className="f-icon">{actionIcons.search}</div>
              <h3>Smart browsing</h3>
              <p>Filter by category, status, and location to find your item fast.</p>
            </div>
            <div className="feature stagger">
              <div className="f-icon">{actionIcons.message}</div>
              <h3>Secure messaging</h3>
              <p>Coordinate returns privately without sharing personal contacts.</p>
            </div>
            <div className="feature stagger">
              <div className="f-icon">{actionIcons.shield}</div>
              <h3>Verified claims</h3>
              <p>Admins review every claim so items go back to the right owner.</p>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="how reveal" id="how">
          <h2>How it works</h2>
          <p className="section-sub">Three simple steps from lost to found.</p>
          <div className="steps">
            <div className="step stagger">
              <span className="step-num">1</span>
              <h3>Sign in</h3>
              <p>Use your campus account to access TrackBack securely.</p>
            </div>
            <div className="step stagger">
              <span className="step-num">2</span>
              <h3>Report or browse</h3>
              <p>Submit a lost or found report, or search what&apos;s already listed.</p>
            </div>
            <div className="step stagger">
              <span className="step-num">3</span>
              <h3>Reunite</h3>
              <p>Message the finder, verify the item, and pick it up.</p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta reveal" id="about">
          <div className="cta-inner">
            <h2>Ready to find what you lost?</h2>
            <p>Join hundreds of students using TrackBack every week.</p>
            <button className="btn btn-primary btn-lg" onClick={openModal}>Log in now →</button>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <div>© 2026 TrackBack, Pamantasan ng Lungsod ng San Pablo</div>
      </footer>

      {/* ── Login Modal ── */}
      {modalOpen && (
        <div className="modal open" aria-hidden="false">
          <div className="modal-backdrop" onClick={closeModal} />
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <button className="modal-close" onClick={closeModal} aria-label="Close">×</button>
            <img src="/plsp-logo.jpg" alt="PLSP Logo" className="login-logo-img" />

            <h2 id="modalTitle">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
            <p className="muted" id="modalSub">
              {mode === 'signup' ? 'Join TrackBack in seconds.' : 'Log in to your TrackBack account.'}
            </p>

            <div className="tabs">
              <button className={`tab${mode === 'login' ? ' active' : ''}`} onClick={() => switchMode('login')}>Log in</button>
              <button className={`tab${mode === 'signup' ? ' active' : ''}`} onClick={() => switchMode('signup')}>Sign up</button>
            </div>

            <div className="form" onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}>
              {mode === 'signup' && (
                <label style={{ display: 'flex', flexDirection: 'column' }}>
                  Full name
                  <input
                    type="text"
                    placeholder="Jane Dela Cruz"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              )}

              <label>
                Email
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="you@plsp.edu.ph"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label>
                Password
                <div className="password-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    minLength={4}
                    autoComplete="current-password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                  />
                  <button
                    type="button"
                    className="show-pass"
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPass((v) => !v)}
                  >
                    {showPass ? eyeOffIcon : eyeOpenIcon}
                  </button>
                </div>
              </label>

              {error && <p className="error" role="alert">{error}</p>}

              {mode === 'login' && (
                <div className="form-row-between">
                  <label className="row">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    {' '}Remember me
                  </label>
                  <span className="link" role="button" tabIndex={0}>Forgot password?</span>
                </div>
              )}

              <button
                className="btn btn-primary btn-lg"
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? 'Loading…' : mode === 'signup' ? 'Create account' : 'Log in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}