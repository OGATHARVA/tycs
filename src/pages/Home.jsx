import { Link } from 'react-router-dom';
import { Mic, Zap, Shield, Globe, ArrowRight, Volume2, Keyboard, Eye } from 'lucide-react';

const FEATURES = [
  {
    icon: Mic,
    title: 'Voice Navigation',
    desc: 'Navigate every page, click every link, and fill every form — all with natural voice commands.',
    color: 'from-sky-500 to-blue-600',
    ariaLabel: 'Voice Navigation feature',
  },
  {
    icon: Keyboard,
    title: 'Keyboard First',
    desc: 'Every element is reachable via keyboard with clear, visible focus indicators.',
    color: 'from-violet-500 to-purple-600',
    ariaLabel: 'Keyboard-first navigation feature',
  },
  {
    icon: Eye,
    title: 'Screen Reader Ready',
    desc: 'Semantic HTML and comprehensive ARIA attributes ensure screen readers work flawlessly.',
    color: 'from-emerald-500 to-teal-600',
    ariaLabel: 'Screen reader compatibility feature',
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    desc: 'Voice recognition supports 30+ languages, making the web inclusive worldwide.',
    color: 'from-orange-500 to-amber-600',
    ariaLabel: 'Multi-language support feature',
  },
  {
    icon: Shield,
    title: 'WCAG 2.1 AA',
    desc: 'Built from the ground up to meet and exceed web content accessibility guidelines.',
    color: 'from-pink-500 to-rose-600',
    ariaLabel: 'WCAG 2.1 AA compliance feature',
  },
  {
    icon: Zap,
    title: 'Instant Response',
    desc: 'Sub-100ms command processing delivers a seamless, frustration-free experience.',
    color: 'from-yellow-500 to-orange-500',
    ariaLabel: 'Instant response performance feature',
  },
];

const STEPS = [
  { step: '01', title: 'Click the mic button', desc: 'Press the floating mic button (bottom right) or press Alt+V on your keyboard.' },
  { step: '02', title: 'Grant microphone access', desc: 'Allow the browser to access your microphone when prompted.' },
  { step: '03', title: 'Speak a command', desc: 'Say commands like "Go to About", "Scroll Down", or "Show Commands".' },
  { step: '04', title: 'Navigate freely', desc: 'The page responds immediately. Use the simulator buttons to test without a mic.' },
];

export default function Home() {
  return (
    <main id="main-content" tabIndex="-1" aria-label="VoiceNav home page">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Decorative blobs — hidden from assistive tech */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container relative text-center">
          {/* Compliance badge */}
          <p
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] text-xs text-[var(--clr-text-muted)] mb-8 animate-fade-in"
            aria-label="Compliance: WCAG 2.1 AA certified and Web Speech API powered"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--clr-success)] animate-pulse" aria-hidden="true" />
            WCAG 2.1 AA Compliant · Web Speech API Powered
          </p>

          <h1
            id="hero-heading"
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in"
          >
            Navigate the Web
            <br />
            <span className="gradient-text">With Your Voice</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-[var(--clr-text-muted)] mb-10 leading-relaxed animate-fade-in">
            VoiceNav makes the internet accessible to everyone — whether you have mobility limitations,
            visual impairments, or simply want a hands-free browsing experience.
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
            role="group"
            aria-label="Primary actions"
          >
            <Link
              to="/services"
              className="btn btn-primary text-base py-3 px-6"
              aria-label="Explore our accessibility services"
            >
              <Mic size={18} aria-hidden="true" />
              Explore Services
            </Link>
            <Link
              to="/about"
              className="btn btn-outline text-base py-3 px-6"
              aria-label="Learn more about VoiceNav"
            >
              Learn More
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>

          {/* Decorative animated orb — purely visual */}
          <div
            className="mt-16 flex items-center justify-center animate-float"
            aria-hidden="true"
            role="presentation"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-500/20 to-violet-500/20 flex items-center justify-center border border-sky-500/20">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500/30 to-violet-500/30 flex items-center justify-center border border-sky-500/30">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center shadow-[var(--shadow-glow-primary)]">
                    <Volume2 size={18} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 rounded-full border border-sky-400/20 animate-spin-slow" />
            </div>
          </div>
        </div>
      </section>

      {/* ── How it Works ─────────────────────────────────────────── */}
      <section
        className="section bg-[var(--clr-bg-card)]"
        aria-labelledby="how-it-works-heading"
      >
        <div className="container">
          <div className="text-center mb-14">
            <h2
              id="how-it-works-heading"
              className="font-display text-3xl sm:text-4xl font-bold mb-4"
            >
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-[var(--clr-text-muted)] max-w-xl mx-auto">
              Get started in four simple steps. No installations, no accounts — just your voice.
            </p>
          </div>

          <ol
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            aria-label="Step-by-step guide to using VoiceNav"
          >
            {STEPS.map(({ step, title, desc }) => (
              <li
                key={step}
                className="card relative"
                aria-label={`Step ${step}: ${title}`}
              >
                <span
                  className="font-display text-5xl font-bold text-[var(--clr-border)] absolute top-4 right-4"
                  aria-hidden="true"
                >
                  {step}
                </span>
                <p className="text-xs font-semibold text-[var(--clr-primary)] uppercase tracking-wider mb-2">
                  Step {step}
                </p>
                <h3 className="font-display text-lg font-bold text-[var(--clr-text)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--clr-text-muted)] leading-relaxed">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section
        className="section"
        aria-labelledby="features-heading"
      >
        <div className="container">
          <div className="text-center mb-14">
            <h2
              id="features-heading"
              className="font-display text-3xl sm:text-4xl font-bold mb-4"
            >
              Built for <span className="gradient-text">Accessibility</span>
            </h2>
            <p className="text-[var(--clr-text-muted)] max-w-xl mx-auto">
              Every feature is designed with inclusivity at the core.
            </p>
          </div>

          <ul
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            aria-label="VoiceNav accessibility features"
          >
            {FEATURES.map(({ icon: Icon, title, desc, color, ariaLabel }) => (
              <li
                key={title}
                className="card group cursor-default"
                aria-label={ariaLabel}
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
                  aria-hidden="true"
                >
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-display text-base font-bold text-[var(--clr-text)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--clr-text-muted)] leading-relaxed">{desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section
        className="section-sm"
        aria-labelledby="cta-heading"
      >
        <div className="container">
          <div className="card text-center py-16 relative overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-violet-500/5 pointer-events-none"
              aria-hidden="true"
            />
            <h2
              id="cta-heading"
              className="font-display text-3xl sm:text-4xl font-bold mb-4"
            >
              Ready to Navigate <span className="gradient-text">Hands-Free?</span>
            </h2>
            <p className="text-[var(--clr-text-muted)] max-w-md mx-auto mb-8">
              Click the mic button in the bottom-right corner and say{' '}
              <strong className="text-[var(--clr-primary)]">"Go to Services"</strong> to begin,
              or try our accessibility settings panel on the bottom-left.
            </p>
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              role="group"
              aria-label="Call to action buttons"
            >
              <Link
                to="/contact"
                className="btn btn-primary text-base py-3 px-8"
                aria-label="Navigate to the contact page to get in touch"
              >
                <Mic size={18} aria-hidden="true" />
                Get in Touch
              </Link>
              <Link
                to="/services"
                className="btn btn-outline text-base py-3 px-8"
                aria-label="View all available accessibility services"
              >
                View Services
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
