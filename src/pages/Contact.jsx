import { useState, useRef, useEffect } from 'react';
import { Mail, MapPin, Phone, Send, Mic, CheckCircle } from 'lucide-react';

const CONTACT_INFO = [
  { icon: Mail,   label: 'Email',   value: 'hello@voicenav.app',   href: 'mailto:hello@voicenav.app', ariaLabel: 'Send email to hello@voicenav.app' },
  { icon: Phone,  label: 'Phone',   value: '+1 (800) VCE-VOICE',   href: 'tel:+18008238642',          ariaLabel: 'Call VoiceNav at +1 800 823 8642'  },
  { icon: MapPin, label: 'Address', value: 'San Francisco, CA USA', href: null,                        ariaLabel: null                                },
];

export default function Contact() {
  const [form, setForm]           = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors]       = useState({});
  const [submitted, setSubmitted] = useState(false);
  const successRef                = useRef(null);
  const firstErrorRef             = useRef(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Full name is required.';
    if (!form.email.trim())   e.email   = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address.';
    if (!form.subject.trim()) e.subject = 'Subject is required.';
    if (!form.message.trim()) e.message = 'Message is required.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      /* Move focus to first error field for screen readers */
      const firstErrField = Object.keys(errs)[0];
      document.getElementById(`contact-${firstErrField}`)?.focus();
      return;
    }
    setSubmitted(true);
    /* Focus success message after render */
    setTimeout(() => successRef.current?.focus(), 100);
  };

  /* Reset: return focus to first input */
  const handleReset = () => {
    setSubmitted(false);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => document.getElementById('contact-name')?.focus(), 100);
  };

  const inputClass = (field) =>
    `w-full bg-[var(--clr-bg-elevated)] border rounded-xl px-4 py-3 text-sm text-[var(--clr-text)] placeholder-[var(--clr-text-faint)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary)] ${
      errors[field]
        ? 'border-[var(--clr-error)] focus:ring-[var(--clr-error)]'
        : 'border-[var(--clr-border)] hover:border-[var(--clr-border-hover)]'
    }`;

  return (
    <main id="main-content" tabIndex="-1" aria-label="VoiceNav contact page">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="section pt-32 relative overflow-hidden" aria-labelledby="contact-hero-heading">
        <div className="absolute top-20 right-20 w-64 h-64 bg-sky-500/8 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="container text-center">
          <p className="text-xs font-semibold text-[var(--clr-accent)] uppercase tracking-widest mb-4" aria-hidden="true">Contact Us</p>
          <h1 id="contact-hero-heading" className="font-display text-4xl sm:text-5xl font-bold mb-6">
            Let's <span className="gradient-text">Connect</span>
          </h1>
          <p className="text-lg text-[var(--clr-text-muted)] max-w-xl mx-auto">
            Have a question, want a demo, or need support? Reach out — we reply within one business day.
          </p>
        </div>
      </section>

      {/* ── Form + Info ─────────────────────────────────────────── */}
      <section className="section-sm pb-24" aria-labelledby="contact-form-heading">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Contact info sidebar */}
            <aside aria-label="Contact information" className="lg:col-span-1">
              <div className="card mb-5">
                <h2 className="font-display text-lg font-bold text-[var(--clr-text)] mb-4">Get in Touch</h2>
                <ul className="space-y-5" role="list">
                {CONTACT_INFO.map(({ icon: Icon, label, value, href, ariaLabel }) => (
                  <li key={label} className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--clr-primary-dim)] to-[var(--clr-accent-dim)] flex items-center justify-center flex-shrink-0"
                      aria-hidden="true"
                    >
                      <Icon size={15} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--clr-text-faint)] uppercase tracking-wide mb-0.5" aria-hidden="true">{label}</p>
                      {href ? (
                        <a
                          href={href}
                          aria-label={ariaLabel || value}
                          className="text-sm text-[var(--clr-text)] hover:text-[var(--clr-primary)] transition-colors"
                        >
                          {value}
                        </a>
                      ) : (
                        <address className="text-sm text-[var(--clr-text)] not-italic">
                          <span className="sr-only">Address: </span>{value}
                        </address>
                      )}
                    </div>
                  </li>
                ))}
                </ul>
              </div>

              {/* Voice tip */}
              <div className="card border-[var(--clr-primary)]/20 bg-[var(--clr-primary)]/5">
                <div className="flex items-center gap-2 mb-2">
                  <Mic size={15} className="text-[var(--clr-primary)]" aria-hidden="true" />
                  <p className="text-xs font-semibold text-[var(--clr-primary)]">Voice Tip</p>
                </div>
                <p className="text-xs text-[var(--clr-text-muted)] leading-relaxed">
                  Press <kbd className="px-1.5 py-0.5 bg-[var(--clr-bg-elevated)] rounded font-mono">Alt+V</kbd> and say <strong className="text-[var(--clr-text)]">"Go to Contact"</strong> to navigate here by voice anytime.
                </p>
              </div>
            </aside>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 id="contact-form-heading" className="font-display text-lg font-bold text-[var(--clr-text)] mb-6">
                  Send a Message
                </h2>

                {submitted ? (
                  <div
                    ref={successRef}
                    role="alert"
                    aria-live="assertive"
                    tabIndex="-1"
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div
                      className="w-16 h-16 rounded-full bg-[var(--clr-success)]/20 flex items-center justify-center mb-4"
                      aria-hidden="true"
                    >
                      <CheckCircle size={32} className="text-[var(--clr-success)]" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-[var(--clr-text)] mb-2">Message Sent Successfully!</h3>
                    <p className="text-sm text-[var(--clr-text-muted)] max-w-xs">
                      Thanks for reaching out, <strong>{form.name}</strong>. We'll reply to{' '}
                      <strong>{form.email}</strong> within one business day.
                    </p>
                    <button
                      onClick={handleReset}
                      className="btn btn-outline mt-6 text-sm"
                      aria-label="Clear form and send another message"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    aria-label="Contact form — all fields marked with asterisk are required"
                  >
                    {/* Error summary for screen readers */}
                    {Object.keys(errors).length > 0 && (
                      <div
                        role="alert"
                        aria-live="assertive"
                        className="mb-4 p-3 rounded-xl border border-[var(--clr-error)] bg-[var(--clr-error)]/10 text-sm text-[var(--clr-error)]"
                      >
                        <p className="font-semibold mb-1">Please fix the following errors:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {Object.entries(errors).map(([field, msg]) => (
                            <li key={field}>
                              <a href={`#contact-${field}`} className="underline hover:opacity-80">
                                {msg}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <fieldset>
                      <legend className="sr-only">Contact details</legend>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {/* Name */}
                      <div>
                        <label htmlFor="contact-name" className="block text-xs font-semibold text-[var(--clr-text-muted)] uppercase tracking-wide mb-1.5">
                          Full Name <span aria-hidden="true" className="text-[var(--clr-error)]">*</span>
                          <span className="sr-only">(required)</span>
                        </label>
                        <input
                          type="text"
                          id="contact-name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Jane Doe"
                          autoComplete="name"
                          required
                          aria-required="true"
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? 'name-error' : undefined}
                          className={inputClass('name')}
                        />
                        {errors.name && (
                          <p id="name-error" role="alert" className="text-xs text-[var(--clr-error)] mt-1">{errors.name}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="contact-email" className="block text-xs font-semibold text-[var(--clr-text-muted)] uppercase tracking-wide mb-1.5">
                          Email Address <span aria-hidden="true" className="text-[var(--clr-error)]">*</span>
                          <span className="sr-only">(required)</span>
                        </label>
                        <input
                          type="email"
                          id="contact-email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="jane@example.com"
                          autoComplete="email"
                          required
                          aria-required="true"
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? 'email-error' : undefined}
                          className={inputClass('email')}
                        />
                        {errors.email && (
                          <p id="email-error" role="alert" className="text-xs text-[var(--clr-error)] mt-1">{errors.email}</p>
                        )}
                      </div>
                    </div>
                    </fieldset>

                    <fieldset>
                      <legend className="sr-only">Message details</legend>

                    {/* Subject */}
                    <div className="mb-4">
                      <label htmlFor="contact-subject" className="block text-xs font-semibold text-[var(--clr-text-muted)] uppercase tracking-wide mb-1.5">
                        Subject <span aria-hidden="true" className="text-[var(--clr-error)]">*</span>
                        <span className="sr-only">(required)</span>
                      </label>
                      <input
                        type="text"
                        id="contact-subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="How can we help?"
                        required
                        aria-required="true"
                        aria-invalid={!!errors.subject}
                        aria-describedby={errors.subject ? 'subject-error' : undefined}
                        className={inputClass('subject')}
                      />
                      {errors.subject && (
                        <p id="subject-error" role="alert" className="text-xs text-[var(--clr-error)] mt-1">{errors.subject}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="mb-6">
                      <label htmlFor="contact-message" className="block text-xs font-semibold text-[var(--clr-text-muted)] uppercase tracking-wide mb-1.5">
                        Message <span aria-hidden="true" className="text-[var(--clr-error)]">*</span>
                        <span className="sr-only">(required)</span>
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us more about your project or question…"
                        rows={5}
                        required
                        aria-required="true"
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                        className={`${inputClass('message')} resize-none`}
                      />
                      {errors.message && (
                        <p id="message-error" role="alert" className="text-xs text-[var(--clr-error)] mt-1">{errors.message}</p>
                      )}
                    </div>

                    </fieldset>

                    <button
                      type="submit"
                      id="contact-submit-btn"
                      aria-label="Submit your contact message"
                      className="btn btn-primary w-full sm:w-auto justify-center py-3 px-8"
                    >
                      <Send size={16} aria-hidden="true" />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
