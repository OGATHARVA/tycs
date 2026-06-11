import { Link } from 'react-router-dom';
import { Radio, ExternalLink, Share2, Globe, Heart, ArrowUp, ShieldCheck, Cpu, Award } from 'lucide-react';
import Logo from './Logo';

const FOOTER_LINKS = {
  Navigation: [
    { to: '/',         label: 'Home'     },
    { to: '/about',    label: 'About'    },
    { to: '/services', label: 'Services' },
    { to: '/contact',  label: 'Contact'  },
  ],
  'Voice Commands': [
    { label: '"Go to Home"' },
    { label: '"Go to About"' },
    { label: '"Go to Services"' },
    { label: '"Scroll Down"' },
  ],
  Accessibility: [
    { label: 'WCAG 2.1 AA' },
    { label: 'Screen Reader Ready' },
    { label: 'Keyboard Navigation' },
    { label: 'Reduced Motion' },
  ],
};

const SOCIALS = [
  { icon: ExternalLink, href: '#', label: 'GitHub' },
  { icon: Share2,       href: '#', label: 'Twitter / X' },
  { icon: Globe,        href: '#', label: 'LinkedIn' },
];

const COMPLIANCE_BADGES = [
  { icon: ShieldCheck, title: 'WCAG 2.1 AA', desc: 'Standard Compliant' },
  { icon: Cpu,         title: 'Local Processing', desc: 'Web Speech API' },
  { icon: Award,       title: 'Vetted UX', desc: 'A11y Compliant' },
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer role="contentinfo" className="border-t border-[var(--clr-border)] bg-[var(--clr-bg-card)] pt-12 pb-6">
      <div className="container">
        {/* ── Top Section: Stats & Badges ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10 border-b border-[var(--clr-border)] mb-10 items-center">
          {/* Stats Bar */}
          <div className="lg:col-span-2 flex flex-wrap gap-6 sm:gap-10">
            <div className="flex flex-col gap-1">
              <span className="text-xl sm:text-2xl font-bold font-display text-[var(--clr-primary)]">5,000+</span>
              <span className="text-xs text-[var(--clr-text-muted)] font-semibold uppercase tracking-wider">Voice commands processed</span>
            </div>
            <div className="w-px h-10 bg-[var(--clr-border)] hidden sm:block" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <span className="text-xl sm:text-2xl font-bold font-display text-[var(--clr-success)]">70%</span>
              <span className="text-xs text-[var(--clr-text-muted)] font-semibold uppercase tracking-wider">NLU Command accuracy</span>
            </div>
            <div className="w-px h-10 bg-[var(--clr-border)] hidden sm:block" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <span className="text-xl sm:text-2xl font-bold font-display text-[var(--clr-accent)]">100%</span>
              <span className="text-xs text-[var(--clr-text-muted)] font-semibold uppercase tracking-wider">Privacy & client-side security</span>
            </div>
          </div>

          {/* Compliance Icons */}
          <div className="flex items-center gap-4 justify-start lg:justify-end">
            {COMPLIANCE_BADGES.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div
                  key={idx}
                  title={`${badge.title}: ${badge.desc}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)]"
                >
                  <Icon size={14} className="text-[var(--clr-primary)]" aria-hidden="true" />
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-[var(--clr-text)] leading-none">{badge.title}</p>
                    <p className="text-[8px] text-[var(--clr-text-muted)] leading-none mt-0.5">{badge.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Mid Section: Brand and Navigation Columns ───────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" aria-label="Tejyash Cyber Solutions Home" className="flex items-center gap-2.5 mb-4 w-fit">
              <Logo size="md" showSlogan={true} />
            </Link>
            <p className="text-sm text-[var(--clr-text-muted)] leading-relaxed mb-5">
              Making the web accessible to everyone through intuitive, natural voice navigation. Tejyash Cyber Solutions — Tech to the Rescue.
            </p>
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--clr-bg-elevated)] text-[var(--clr-text-muted)] hover:text-[var(--clr-primary)] hover:bg-[var(--clr-border)] transition-all duration-200"
                >
                  <Icon size={15} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, items]) => {
            const headingId = `footer-${title.toLowerCase().replace(/\s+/g, '-')}`;
            return (
              <nav key={title} aria-labelledby={headingId}>
                <h3
                  id={headingId}
                  className="text-xs font-semibold uppercase tracking-wider text-[var(--clr-text-faint)] mb-4"
                >
                  {title}
                </h3>
                <ul className="space-y-2.5 font-medium" role="list">
                  {items.map(({ to, label }) => (
                    <li key={label}>
                      {to ? (
                        <Link
                          to={to}
                          className="text-sm text-[var(--clr-text-muted)] hover:text-[var(--clr-primary)] transition-colors"
                        >
                          {label}
                        </Link>
                      ) : (
                        <span
                          className="text-xs text-[var(--clr-text-muted)] font-mono bg-[var(--clr-bg-elevated)] px-2 py-0.5 rounded border border-[var(--clr-border)]"
                          aria-label={`Voice command shortcut: ${label.replace(/"/g, '')}`}
                        >
                          {label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            );
          })}
        </div>

        {/* ── Bottom Section: Copyright & Back to Top ───────────────── */}
        <div className="pt-6 border-t border-[var(--clr-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--clr-text-faint)]">
          <p>© {new Date().getFullYear()} Tejyash Cyber Solutions. All rights reserved.</p>
          
          <div className="flex items-center gap-6">
            <p className="flex items-center gap-1.5">
              <span>Built with </span>
              <Heart size={11} className="text-[var(--clr-error)] animate-pulse" aria-hidden="true" />
              <span className="sr-only">love</span>
              <span>for digital accessibility</span>
            </p>

            <button
              type="button"
              onClick={scrollToTop}
              className="btn btn-outline py-1.5 px-3 flex items-center gap-1.5 text-xs text-[var(--clr-text-muted)] hover:text-[var(--clr-primary)]"
              aria-label="Scroll back to top of the page"
            >
              <ArrowUp size={13} aria-hidden="true" />
              Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
