import { useState } from 'react';
import {
  Mic, Globe, ShoppingCart, BookOpen, BarChart2, Users, Settings, Smartphone, Star
} from 'lucide-react';

const CATEGORIES = ['All', 'Navigation', 'Commerce', 'Content', 'Analytics'];

const SERVICES = [
  {
    icon: Mic,
    title: 'Voice Command Engine',
    category: 'Navigation',
    badge: 'Core',
    badgeColor: 'bg-blue-50 text-blue-600 border border-blue-100',
    rating: 5,
    desc: 'Real-time speech recognition using the Web Speech API, converting natural language into precise navigation actions with sub-100ms response time.',
    tags: ['Web Speech API', 'NLP', 'Real-time'],
  },
  {
    icon: Globe,
    title: 'Multi-Page Navigation',
    category: 'Navigation',
    badge: 'Popular',
    badgeColor: 'bg-violet-50 text-violet-600 border border-violet-100',
    rating: 5,
    desc: 'Hands-free traversal between all pages. Say "go to about", "go home", or "open contact" — TYCS handles the rest.',
    tags: ['React Router', 'SPA', 'Accessible'],
  },

  {
    icon: BookOpen,
    title: 'Voice-Assisted Reading',
    category: 'Content',
    badge: null,
    badgeColor: '',
    rating: 4,
    desc: 'Ask the assistant to "read this section", "summarise the article", or "find the next paragraph" on any content-rich page.',
    tags: ['Text-to-Speech', 'Reading Mode', 'Accessibility'],
  },
  {
    icon: BarChart2,
    title: 'Analytics Dashboard Control',
    category: 'Analytics',
    badge: 'Beta',
    badgeColor: 'bg-amber-50 text-amber-600 border border-amber-100',
    rating: 4,
    desc: 'Navigate complex data dashboards using commands like "show last 30 days" or "filter by category". Data exploration, hands-free.',
    tags: ['Dashboards', 'Filters', 'Data'],
  },
  {
    icon: Users,
    title: 'Voice Form Filling',
    category: 'Commerce',
    badge: null,
    badgeColor: '',
    rating: 5,
    desc: 'Fill in text inputs, select dropdowns, check checkboxes, and submit forms entirely via speech recognition.',
    tags: ['Forms', 'Input', 'Web Speech'],
  },
  {
    icon: Settings,
    title: 'Accessibility Preferences',
    category: 'Navigation',
    badge: null,
    badgeColor: '',
    rating: 4,
    desc: 'Voice-controlled theme switching, font size adjustments, high-contrast mode, and reduced motion toggling.',
    tags: ['A11y', 'Settings', 'UX'],
  },
  {
    icon: Smartphone,
    title: 'Mobile Voice Support',
    category: 'Navigation',
    badge: 'Mobile',
    badgeColor: 'bg-pink-50 text-pink-600 border border-pink-100',
    rating: 4,
    desc: 'Optimised for touchscreen devices, with the mic button designed for one-handed use and high-contrast mobile focus rings.',
    tags: ['Mobile', 'Responsive', 'Touch'],
  },
];

export default function Services() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? SERVICES
    : SERVICES.filter(s => s.category === activeCategory);

  /* Arrow-key navigation between category tabs */
  const handleTabKeyDown = (e, currentIndex) => {
    let next;
    if (e.key === 'ArrowRight') next = (currentIndex + 1) % CATEGORIES.length;
    else if (e.key === 'ArrowLeft') next = (currentIndex - 1 + CATEGORIES.length) % CATEGORIES.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = CATEGORIES.length - 1;
    else return;
    e.preventDefault();
    setActiveCategory(CATEGORIES[next]);
    document.getElementById(`tab-${CATEGORIES[next].toLowerCase()}`)?.focus();
  };

  return (
    <main id="main-content" tabIndex="-1" aria-label="TYCS services page">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="section pt-32 relative overflow-hidden" aria-labelledby="services-hero-heading">

        <div className="container text-center">
          <p className="text-xs font-semibold text-[var(--clr-primary)] uppercase tracking-widest mb-4" aria-hidden="true">Our Services</p>
          <h1 id="services-hero-heading" className="font-display text-4xl sm:text-5xl font-bold mb-6">
            Accessibility <span className="gradient-text">Solutions</span>
          </h1>
          <p className="text-lg text-[var(--clr-text-muted)] max-w-2xl mx-auto">
            From voice-powered navigation to full form control, TYCS provides a complete suite of tools
            that transform any web application into a voice-accessible experience.
          </p>
        </div>
      </section>

      {/* ── Filter tabs ─────────────────────────────────────────── */}
      <section className="section-sm" aria-label="Filter services by category">
        <div className="container">
          <div
            role="tablist"
            aria-label="Service categories"
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {CATEGORIES.map((cat, idx) => (
              <button
                key={cat}
                role="tab"
                id={`tab-${cat.toLowerCase()}`}
                aria-selected={activeCategory === cat}
                aria-controls="services-grid"
                tabIndex={activeCategory === cat ? 0 : -1}
                onClick={() => setActiveCategory(cat)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                aria-label={`Filter services by category: ${cat}${cat === 'All' ? ' (show all)' : ''}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  activeCategory === cat
                    ? 'bg-[var(--clr-primary)] text-white border-transparent shadow-sm'
                    : 'bg-[var(--clr-bg-card)] border-[var(--clr-border)] text-[var(--clr-text-muted)] hover:border-[var(--clr-primary)] hover:text-[var(--clr-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services grid ───────────────────────────────────────── */}
      <section className="section-sm pb-24" aria-labelledby="services-heading">
        <div className="container">
          <h2 id="services-heading" className="sr-only">
            {filtered.length} service{filtered.length !== 1 ? 's' : ''} in category: {activeCategory}
          </h2>
          <ul
            id="services-grid"
            role="tabpanel"
            aria-labelledby={`tab-${activeCategory.toLowerCase()}`}
            aria-live="polite"
            aria-atomic="false"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {filtered.map(({ icon: Icon, title, category, badge, badgeColor, rating, desc, tags }) => (
              <li
                key={title}
                className="card flex flex-col group"
                aria-label={`${title} — ${category} service, rated ${rating} out of 5 stars${badge ? `, ${badge}` : ''}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] text-[var(--clr-primary)] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  {badge && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
                      {badge}
                    </span>
                  )}
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-2" role="img" aria-label={`Rating: ${rating} out of 5 stars`}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={11}
                      className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-[var(--clr-text-faint)]'}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <h3 className="font-display text-sm font-bold text-[var(--clr-text)] mb-1">{title}</h3>
                <p className="text-xs text-[var(--clr-text-faint)] uppercase tracking-wide mb-3">{category}</p>
                <p className="text-sm text-[var(--clr-text-muted)] leading-relaxed mb-4 flex-1">{desc}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {tags.map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[var(--clr-bg-elevated)] text-[var(--clr-text-faint)] border border-[var(--clr-border)]">
                      {t}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
