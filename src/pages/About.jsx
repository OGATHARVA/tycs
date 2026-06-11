import { Users, Target, Award, Lightbulb, CheckCircle } from 'lucide-react';

const VALUES = [
  {
    icon: Target,
    title: 'Mission',
    desc: 'To remove every barrier between people and the web, enabling full participation through accessible, voice-powered interfaces.',
  },
  {
    icon: Users,
    title: 'Inclusion',
    desc: 'We design for the widest possible range of people — including those with motor, visual, auditory, and cognitive differences.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    desc: 'We push the boundaries of what browsers can do, leveraging modern APIs to create experiences once thought impossible.',
  },
  {
    icon: Award,
    title: 'Standards',
    desc: 'WCAG 2.1 AA compliance is our baseline, not our ceiling. We strive to exceed every guideline we encounter.',
  },
];

const PRINCIPLES = [
  { label: 'Perceivable', detail: 'Information is presentable in multiple formats so all users can access it' },
  { label: 'Operable',    detail: 'All functionality is keyboard and voice accessible — no mouse required' },
  { label: 'Understandable', detail: 'Content and UI are clear, predictable, and free of unnecessary complexity' },
  { label: 'Robust',     detail: 'Compatible with current and future assistive technologies' },
];

const TEAM = [
  { name: 'Atharva Bhosle', role: 'Frontend UI/UX Designer, Speech Recognition', initials: 'AB', description: 'Designs and builds the voice navigation interfaces and Speech API integrations.' },
  { name: 'Omkar', role: 'Backend Engineer', initials: 'O', description: 'Engineers robust server systems, services, and backend integration.' }
];


export default function About() {
  return (
    <main
      id="main-content"
      tabIndex="-1"
      aria-label="About TYCS page"
    >

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        className="section pt-32 relative overflow-hidden"
        aria-labelledby="about-heading"
      >

        <div className="container max-w-3xl">
          <p className="text-xs font-semibold text-[var(--clr-accent)] uppercase tracking-widest mb-4" aria-hidden="true">
            About TYCS
          </p>
          <h1
            id="about-heading"
            className="font-display text-4xl sm:text-5xl font-bold mb-6"
          >
            The Web Belongs to <span className="gradient-text">Everyone</span>
          </h1>
          <p className="text-lg text-[var(--clr-text-muted)] leading-relaxed mb-4">
            TYCS was founded on a simple belief: digital experiences should adapt to people, not
            the other way around. Whether you navigate with your hands, your eyes, or your voice —
            the web should be fully within reach.
          </p>
          <p className="text-[var(--clr-text-muted)] leading-relaxed">
            We combine the power of the Web Speech API, semantic HTML, and thoughtful UX design to
            create a browsing experience that genuinely works for everyone — not just those without
            disabilities.
          </p>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────── */}
      <section
        className="section bg-[var(--clr-bg-card)]"
        aria-labelledby="values-heading"
      >
        <div className="container">
          <h2
            id="values-heading"
            className="font-display text-3xl font-bold mb-10 text-center"
          >
            Our <span className="gradient-text">Values</span>
          </h2>
          <ul
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            aria-label="TYCS core values"
          >
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="card flex gap-4">
                <div
                  className="w-10 h-10 rounded-lg bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] text-[var(--clr-primary)] flex items-center justify-center flex-shrink-0"
                  aria-hidden="true"
                >
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[var(--clr-text)] mb-1">{title}</h3>
                  <p className="text-sm text-[var(--clr-text-muted)] leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── WCAG Principles ──────────────────────────────────────── */}
      <section
        className="section"
        aria-labelledby="wcag-heading"
      >
        <div className="container max-w-3xl">
          <h2
            id="wcag-heading"
            className="font-display text-3xl font-bold mb-4"
          >
            WCAG <span className="gradient-text">Principles</span>
          </h2>
          <p className="text-[var(--clr-text-muted)] mb-8">
            Every design decision we make is anchored to the four principles of the Web Content
            Accessibility Guidelines (WCAG 2.1). These form the foundation of our product.
          </p>
          <ul
            className="space-y-4"
            aria-label="The four WCAG 2.1 principles"
          >
            {PRINCIPLES.map(({ label, detail }) => (
              <li
                key={label}
                className="flex items-start gap-3 p-4 rounded-xl bg-[var(--clr-bg-card)] border border-[var(--clr-border)]"
                aria-label={`${label}: ${detail}`}
              >
                <CheckCircle
                  size={18}
                  className="text-[var(--clr-success)] flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <strong className="text-sm font-semibold text-[var(--clr-text)]">{label}</strong>
                  <span className="text-sm text-[var(--clr-text-muted)]"> — {detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────── */}
      <section
        className="section bg-[var(--clr-bg-card)]"
        aria-labelledby="team-heading"
      >
        <div className="container">
          <h2
            id="team-heading"
            className="font-display text-3xl font-bold mb-10 text-center"
          >
            Meet the <span className="gradient-text">Team</span>
          </h2>
          <ul
            className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto"
            aria-label="TYCS team members"
          >
            {TEAM.map(({ name, role, initials, color, description }) => (
              <li key={name} className="card text-center group">
                {/* Avatar with initials — screen readers get the name */}
                <div
                  className="w-14 h-14 rounded-full bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] text-[var(--clr-primary)] flex items-center justify-center font-bold text-lg mx-auto mb-3 transition-transform duration-300 group-hover:scale-105"
                  role="img"
                  aria-label={`Avatar for ${name}`}
                >
                  <span aria-hidden="true">{initials}</span>
                </div>
                <h3 className="font-display text-sm font-bold text-[var(--clr-text)]">{name}</h3>
                <p className="text-xs text-[var(--clr-text-muted)] mt-0.5">{role}</p>
                <p className="sr-only">{description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
