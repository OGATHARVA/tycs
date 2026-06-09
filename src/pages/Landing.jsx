import { Link } from 'react-router-dom';
import { Mic, ArrowRight, Shield, Heart, Eye, Check, AlertCircle, Compass, Users, User } from 'lucide-react';
import { useState, useEffect } from 'react';

const STATS = [
  { value: 253, suffix: 'M', label: 'Visually impaired individuals globally', desc: 'Who face barriers accessing digital information daily.' },
  { value: 1.3, suffix: 'B', label: 'People with disabilities', desc: 'Representing a major segment of the global population underserved by current web standards.' },
  { value: 78, suffix: '%', label: 'Websites with accessibility flaws', desc: 'Failing basic WCAG guidelines on their homepages.' }
];

const SOLVED_GROUPS = [
  {
    icon: Eye,
    title: 'Blind & Visually Impaired',
    desc: 'TYCS provides fully-voiced navigation, reading back page content and labels to enable independent browsing without traditional screen reader complexity.'
  },
  {
    icon: Compass,
    title: 'Motor-Impaired Users',
    desc: 'Eliminates the need for a physical mouse or keyboard. Users with ALS, cerebral palsy, or severe arthritis can navigate standard web elements with simple verbal cues.'
  },
  {
    icon: Users,
    title: 'Elderly & Tech-Unfamiliar',
    desc: 'Reduces cognitive load by replacing dense navigation menus with simple speech commands, making digital services approachable for non-technical users.'
  },
  {
    icon: Heart,
    title: 'Hands-Free Multitaskers',
    desc: 'Empowers users with temporary injuries (like a broken wrist) or those multitasking to navigate pages completely hands-free.'
  }
];

const TESTIMONIALS = [
  {
    quote: "Standard screen readers are often too slow and talkative. Being able to just tell the webpage to 'Go to Services' or 'Scroll Down' changes everything. It feels like a natural conversation.",
    author: "Elena R.",
    role: "Visually Impaired Advocate",
    tag: "Blind / Low Vision"
  },
  {
    quote: "As someone living with ALS, typing can be exhausting. TYCS lets me browse my favorite platforms entirely hands-free. It has returned a level of independence I thought was gone.",
    author: "Marcus T.",
    role: "Retired software engineer",
    tag: "Motor-Impaired"
  },
  {
    quote: "My joints ache when using the mouse for too long. With this, I just speak what I see. It's incredibly straightforward and doesn't require complex keyboard shortcuts.",
    author: "Arthur L., 72",
    role: "Grandfather & avid reader",
    tag: "Elderly User"
  }
];

function StatsCounter({ value, suffix, duration = 1500 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    if (isNaN(end)) return;
    
    const increment = end / (duration / 16);
    let timer;

    const updateCount = () => {
      start += increment;
      if (start >= end) {
        setCount(end);
      } else {
        setCount(start);
        timer = requestAnimationFrame(updateCount);
      }
    };

    timer = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(timer);
  }, [value, duration]);

  return (
    <span className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl gradient-text-animated">
      {count % 1 !== 0 ? count.toFixed(1) : Math.floor(count)}
      {suffix}
    </span>
  );
}

export default function Landing() {
  return (
    <main id="main-content" tabIndex="-1" className="page-transition min-h-screen" aria-label="TYCS landing page">
      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20"
        aria-labelledby="hero-heading"
      >


        <div className="container relative z-10 text-center">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--clr-bg-card)] border border-[var(--clr-border)] text-xs text-[var(--clr-text-muted)] mb-8 animate-fade-in shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--clr-primary)] animate-pulse" aria-hidden="true" />
            Empowering Accessible Web Browsing
          </div>

          {/* Heading */}
          <h1
            id="hero-heading"
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight animate-fade-in"
          >
            The Web, Finally
            <br />
            <span className="gradient-text-animated">For Everyone</span>
          </h1>

          {/* Paragraph */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[var(--clr-text-muted)] mb-10 leading-relaxed animate-fade-in">
            TYCS bridges the digital divide, allowing visually and motor-impaired users to navigate websites completely hands-free using natural spoken commands.
          </p>

          {/* CTA Group */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
            role="group"
            aria-label="Hero actions"
          >
            <Link
              to="/demo"
              className="btn btn-primary text-base py-3.5 px-8 flex items-center gap-2 group shadow-lg"
              aria-label="Launch the live voice navigation demo"
            >
              <Mic size={18} aria-hidden="true" />
              Launch Live Demo
              <ArrowRight size={18} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/about"
              className="btn btn-outline text-base py-3.5 px-8"
              aria-label="Learn about our vision and features"
            >
              Read Our Story
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 pt-10 border-t border-[var(--clr-border)]">
            <h2 className="sr-only">Accessibility Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
              {STATS.map((stat, idx) => (
                <div key={idx} className="flex flex-col gap-2 p-6 bg-[var(--clr-bg-card)] rounded-xl border border-[var(--clr-border)] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-baseline gap-1">
                    <StatsCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <h3 className="font-semibold text-sm text-[var(--clr-text)] mt-1">{stat.label}</h3>
                  <p className="text-xs text-[var(--clr-text-muted)] leading-relaxed">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem vs Solution ─────────────────────────────────── */}
      <section
        className="section bg-[var(--clr-bg-card)] border-t border-b border-[var(--clr-border)]"
        aria-labelledby="problem-heading"
      >
        <div className="container">
          <div className="text-center mb-16">
            <h2
              id="problem-heading"
              className="font-display text-3xl sm:text-4xl font-bold mb-4"
            >
              The Web is <span className="text-[var(--clr-error)]">Broken</span> for Millions
            </h2>
            <p className="text-[var(--clr-text-muted)] max-w-xl mx-auto">
              How TYCS compares to traditional browsing interfaces for individuals with motor or visual limitations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Old Way */}
            <div className="p-8 rounded-xl border border-red-200 bg-red-50/30 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold mb-6">
                  <AlertCircle size={14} /> Traditional Browsing
                </div>
                <h3 className="text-xl font-bold mb-4 text-[var(--clr-text)]">A Hostile Digital Environment</h3>
                <ul className="flex flex-col gap-4">
                  <li className="flex items-start gap-3 text-sm text-[var(--clr-text-muted)]">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">×</span>
                    <span><strong>Keyboard Fatigue:</strong> Blind users must press tab hundreds of times to find a single link.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[var(--clr-text-muted)]">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">×</span>
                    <span><strong>Mouse Dependency:</strong> Motor-impaired users find clicking small links or filling forms exhausting or impossible.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[var(--clr-text-muted)]">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">×</span>
                    <span><strong>Screen Reader Clutter:</strong> Heavy text-to-speech output creates overwhelming auditory clutter.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-red-200 text-xs text-red-600/80">
                Resulting in high bounce rates and complete digital exclusion.
              </div>
            </div>

            {/* The TYCS Way */}
            <div className="p-8 rounded-xl border border-emerald-200 bg-emerald-50/30 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-xs font-semibold mb-6">
                  <Shield size={14} className="text-emerald-600" /> TYCS Empowered
                </div>
                <h3 className="text-xl font-bold mb-4 text-[var(--clr-text)]">Natural, Interactive Browsing</h3>
                <ul className="flex flex-col gap-4">
                  <li className="flex items-start gap-3 text-sm text-[var(--clr-text-muted)]">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Natural Commands:</strong> Just say what you want: "Go to about", "scroll down", "show panel".</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[var(--clr-text-muted)]">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Interactive Feedback:</strong> Auditory status reports read active components out loud dynamically.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[var(--clr-text-muted)]">
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Accessibility Panel:</strong> Integrated controls allow users to toggle contrast, font sizes, and spacing instantly.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-emerald-200 text-xs text-emerald-700/80">
                Opening the web to independent navigation with zero setups.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Showcase ────────────────────────────────────── */}
      <section className="section" aria-labelledby="features-heading">
        <div className="container">
          <div className="text-center mb-16">
            <h2
              id="features-heading"
              className="font-display text-3xl sm:text-4xl font-bold mb-4"
            >
              Everything You Need to <span className="gradient-text-animated">Navigate by Voice</span>
            </h2>
            <p className="text-[var(--clr-text-muted)] max-w-xl mx-auto">
              Every feature is designed with inclusivity and power at the core.
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-label="TYCS feature list">
            {/* Feature 1 — Smart NLP */}
            <li className="card p-6 bg-[var(--clr-bg-card)] border border-[var(--clr-border)] hover:border-[var(--clr-primary)] transition-all group">
              <div className="w-10 h-10 rounded-lg bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] flex items-center justify-center text-xl mb-4" aria-hidden="true">🧠</div>
              <h3 className="font-bold text-base mb-2 text-[var(--clr-text)]">3-Tier NLP Engine</h3>
              <p className="text-sm text-[var(--clr-text-muted)] leading-relaxed mb-3">Phrase matching → keyword intent → fuzzy token scoring. Understands casual speech, not just rigid commands.</p>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {['"go home"', '"take me back"', '"scroll further"'].map(p => (
                  <span key={p} className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-600">{p}</span>
                ))}
              </div>
            </li>

            {/* Feature 2 — Browser Navigation */}
            <li className="card p-6 bg-[var(--clr-bg-card)] border border-[var(--clr-border)] hover:border-[var(--clr-primary)] transition-all group">
              <div className="w-10 h-10 rounded-lg bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] flex items-center justify-center text-xl mb-4" aria-hidden="true">🌐</div>
              <h3 className="font-bold text-base mb-2 text-[var(--clr-text)]">Browser Shortcuts</h3>
              <p className="text-sm text-[var(--clr-text-muted)] leading-relaxed mb-3">50+ popular websites in a searchable grid. Say a site name and it opens in a new tab instantly. Google search fallback for anything not in the list.</p>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {['"open YouTube"', '"open Gmail"', '"open GitHub"'].map(p => (
                  <span key={p} className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-50 border border-violet-100 text-violet-600">{p}</span>
                ))}
              </div>
            </li>

            {/* Feature 3 — DOM Interaction */}
            <li className="card p-6 bg-[var(--clr-bg-card)] border border-[var(--clr-border)] hover:border-[var(--clr-primary)] transition-all group">
              <div className="w-10 h-10 rounded-lg bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] flex items-center justify-center text-xl mb-4" aria-hidden="true">🖱️</div>
              <h3 className="font-bold text-base mb-2 text-[var(--clr-text)]">Universal DOM Control</h3>
              <p className="text-sm text-[var(--clr-text-muted)] leading-relaxed mb-3">Click buttons, focus inputs, type text, submit forms — all hands-free. Fuzzy matching finds the right element even with vague names.</p>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {['"click login"', '"type hello"', '"submit form"'].map(p => (
                  <span key={p} className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-600">{p}</span>
                ))}
              </div>
            </li>

            {/* Feature 4 — Command Palette */}
            <li className="card p-6 bg-[var(--clr-bg-card)] border border-[var(--clr-border)] hover:border-[var(--clr-primary)] transition-all group">
              <div className="w-10 h-10 rounded-lg bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] flex items-center justify-center text-xl mb-4" aria-hidden="true">⌘</div>
              <h3 className="font-bold text-base mb-2 text-[var(--clr-text)]">Command Palette</h3>
              <p className="text-sm text-[var(--clr-text-muted)] leading-relaxed mb-3">Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] font-mono text-xs">Ctrl+K</kbd> or say "open palette" to search and run any command instantly — keyboard and voice stay in sync.</p>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {['Ctrl+K shortcut', 'Full command search', '50+ site shortcuts'].map(p => (
                  <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-amber-50 border border-amber-100 text-amber-600">{p}</span>
                ))}
              </div>
            </li>

            {/* Feature 5 — Multilingual */}
            <li className="card p-6 bg-[var(--clr-bg-card)] border border-[var(--clr-border)] hover:border-[var(--clr-primary)] transition-all group">
              <div className="w-10 h-10 rounded-lg bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] flex items-center justify-center text-xl mb-4" aria-hidden="true">🗣️</div>
              <h3 className="font-bold text-base mb-2 text-[var(--clr-text)]">Multilingual Support</h3>
              <p className="text-sm text-[var(--clr-text-muted)] leading-relaxed mb-3">Commands in English, Hindi, and Marathi with TTS feedback in the active language. Switch instantly via the Accessibility Panel.</p>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {['🇺🇸 English', '🇮🇳 हिंदी', '🇮🇳 मराठी'].map(p => (
                  <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-pink-50 border border-pink-100 text-pink-600">{p}</span>
                ))}
              </div>
            </li>

            {/* Feature 6 — Extension Ready */}
            <li className="card p-6 bg-[var(--clr-bg-card)] border border-[var(--clr-border)] hover:border-[var(--clr-primary)] transition-all group">
              <div className="w-10 h-10 rounded-lg bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] flex items-center justify-center text-xl mb-4" aria-hidden="true">🔌</div>
              <h3 className="font-bold text-base mb-2 text-[var(--clr-text)]">Extension-Ready Architecture</h3>
              <p className="text-sm text-[var(--clr-text-muted)] leading-relaxed mb-3">Built on <code className="text-xs font-mono text-blue-600">CustomEvent</code> message-passing — the same pattern used by browser extension content scripts. Portable by design.</p>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {['tycs:action', 'tycs:help', 'tycs:palette'].map(p => (
                  <span key={p} className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-50 border border-cyan-100 text-cyan-600">{p}</span>
                ))}
              </div>
            </li>
          </ul>
        </div>
      </section>


      {/* ── Who We Empower ──────────────────────────────────────── */}
      <section
        className="section"
        aria-labelledby="empower-heading"
      >
        <div className="container">
          <div className="text-center mb-16">
            <h2
              id="empower-heading"
              className="font-display text-3xl sm:text-4xl font-bold mb-4"
            >
              Who We <span className="gradient-text-animated">Empower</span>
            </h2>
            <p className="text-[var(--clr-text-muted)] max-w-xl mx-auto">
              Designing interfaces that adapt to human needs, not the other way around.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {SOLVED_GROUPS.map((group, index) => {
              const Icon = group.icon;
              return (
                <div
                  key={index}
                  className="card p-8 flex flex-col gap-4 border border-[var(--clr-border)] bg-[var(--clr-bg-card)]"
                >
                  <div className="w-12 h-12 rounded-lg bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] flex items-center justify-center text-[var(--clr-primary)]" aria-hidden="true">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--clr-text)]">{group.title}</h3>
                  <p className="text-sm text-[var(--clr-text-muted)] leading-relaxed">{group.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials / User Personas ────────────────────────── */}
      <section
        className="section bg-[var(--clr-bg-elevated)] border-t border-b border-[var(--clr-border)]"
        aria-labelledby="social-proof-heading"
      >
        <div className="container">
          <div className="text-center mb-16">
            <h2
              id="social-proof-heading"
              className="font-display text-3xl sm:text-4xl font-bold mb-4"
            >
              What Users <span className="gradient-text-animated">Experience</span>
            </h2>
            <p className="text-[var(--clr-text-muted)] max-w-xl mx-auto">
              Simulated user experiences highlighting the personal impact of hands-free web control.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="card p-8 flex flex-col justify-between bg-[var(--clr-bg-card)] border border-[var(--clr-border)]">
                <div>
                  <span className="inline-block px-2.5 py-1 rounded bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] text-xs font-semibold text-[var(--clr-primary)] mb-6">
                    {t.tag}
                  </span>
                  <p className="text-[var(--clr-text-muted)] text-sm italic leading-relaxed mb-6">
                    "{t.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-6 border-t border-[var(--clr-border)]">
                  <div className="w-10 h-10 rounded-full bg-[var(--clr-bg-card)] border border-[var(--clr-border)] flex items-center justify-center text-[var(--clr-primary)] font-bold text-sm" aria-hidden="true">
                    <User size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--clr-text)]">{t.author}</h4>
                    <p className="text-xs text-[var(--clr-text-muted)]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ready to Try CTA ────────────────────────────────────── */}
      <section
        className="section"
        aria-labelledby="cta-heading"
      >
        <div className="container">
          <div className="card text-center py-20 relative overflow-hidden bg-[var(--clr-bg-card)]">
            
            <h2
              id="cta-heading"
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            >
              Experience the Future of <span className="gradient-text-animated">Inclusive Web</span>
            </h2>
            <p className="text-[var(--clr-text-muted)] max-w-xl mx-auto mb-10 leading-relaxed">
              Launch our voice simulator and experience navigating pages, filling dynamic inputs, and interacting with features entirely using your voice.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/demo"
                className="btn btn-primary text-base py-3.5 px-8 flex items-center gap-2 group"
                aria-label="Try the voice controller interactive demo"
              >
                <Mic size={18} aria-hidden="true" />
                Launch Interactive Demo
                <ArrowRight size={18} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/services"
                className="btn btn-outline text-base py-3.5 px-8"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
