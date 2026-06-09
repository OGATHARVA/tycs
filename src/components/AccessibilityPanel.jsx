import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Settings2, X, Type, Sun, Minus, Plus, RotateCcw,
  ZoomIn, Focus, Eye, Zap, Globe,
} from 'lucide-react';
import { useAccessibility, LANGUAGE_OPTIONS } from '../contexts/AccessibilityContext';

const FONT_OPTIONS = [
  { value: 'sm',   label: 'Small',     px: '14px' },
  { value: 'base', label: 'Default',   px: '16px' },
  { value: 'lg',   label: 'Large',     px: '18px' },
  { value: 'xl',   label: 'X-Large',   px: '20px' },
  { value: '2xl',  label: 'XX-Large',  px: '23px' },
];
const FONT_ORDER = FONT_OPTIONS.map(f => f.value);

const FOCUS_OPTIONS = [
  { value: 'default',  label: 'Standard' },
  { value: 'enhanced', label: 'Enhanced' },
  { value: 'high',     label: 'Maximum'  },
];
const Toggle = ({ label, checked, onChange, id, description }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-[var(--clr-border)] last:border-0">
    <div>
      <label htmlFor={id} className="text-sm font-medium text-[var(--clr-text)] cursor-pointer">
        {label}
      </label>
      {description && (
        <p id={`${id}-desc`} className="text-xs text-[var(--clr-text-muted)] mt-0.5">{description}</p>
      )}
    </div>
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      aria-describedby={description ? `${id}-desc` : undefined}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[var(--clr-primary)] flex-shrink-0 ml-3 ${
        checked ? 'bg-[var(--clr-primary)]' : 'bg-[var(--clr-bg-elevated)]'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
        aria-hidden="true"
      />
      <span className="sr-only">{checked ? 'enabled' : 'disabled'}</span>
    </button>
  </div>
);

export default function AccessibilityPanel() {
  const { settings, update, reset } = useAccessibility();
  const [open, setOpen] = useState(false);
  const panelRef   = useRef(null);
  const triggerRef = useRef(null);

  /* Close on Escape; trap focus inside panel */
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
      if (e.key === 'Tab') {
        const focusable = panelRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    /* focus first element when opening */
    setTimeout(() => panelRef.current?.querySelector('button')?.focus(), 50);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  /* Click outside to close */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!panelRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const fontIdx  = FONT_ORDER.indexOf(settings.fontSize);
  const decrease = useCallback(() => { if (fontIdx > 0) update('fontSize', FONT_ORDER[fontIdx - 1]); }, [fontIdx, update]);
  const increase = useCallback(() => { if (fontIdx < FONT_ORDER.length - 1) update('fontSize', FONT_ORDER[fontIdx + 1]); }, [fontIdx, update]);

  return (
    <>
      {/* ── Trigger button ────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        id="a11y-panel-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Open accessibility settings"
        title="Accessibility Settings"
        className={`fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border ${
          open
            ? 'bg-[var(--clr-primary)] text-white border-[var(--clr-primary)] shadow-sm'
            : 'bg-[var(--clr-bg-card)] border-[var(--clr-border)] text-[var(--clr-text-muted)] hover:text-[var(--clr-primary)] hover:border-[var(--clr-primary)]'
        }`}
      >
        {open ? <X size={18} aria-hidden="true" /> : <Settings2 size={18} aria-hidden="true" />}
      </button>

      {/* ── Panel ─────────────────────────────────────────────────── */}
      {open && (
        <aside
          ref={panelRef}
          id="a11y-panel"
          role="dialog"
          aria-modal="false"
          aria-label="Accessibility settings panel"
          className="fixed bottom-20 left-6 z-50 w-80 bg-[var(--clr-bg-card)] border border-[var(--clr-border)] rounded-xl shadow-lg animate-fade-in overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--clr-border)] bg-[var(--clr-bg-elevated)]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--clr-primary)] flex items-center justify-center">
                <Eye size={14} className="text-white" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--clr-text)]">Accessibility</h2>
                <p className="text-[10px] text-[var(--clr-text-muted)]">WCAG 2.1 AA Controls</p>
              </div>
            </div>
            <button
              onClick={() => { setOpen(false); triggerRef.current?.focus(); }}
              aria-label="Close accessibility panel"
              className="w-7 h-7 rounded-full bg-[var(--clr-bg-elevated)] text-[var(--clr-text-muted)] hover:text-[var(--clr-text)] flex items-center justify-center transition-colors"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>

          <div className="px-5 py-4 space-y-5 max-h-[70vh] overflow-y-auto">

            {/* ── Font Size ─────────────────────────────────────────── */}
            <section aria-labelledby="font-size-label">
              <div className="flex items-center gap-2 mb-3">
                <Type size={14} className="text-[var(--clr-primary)]" aria-hidden="true" />
                <h3 id="font-size-label" className="text-xs font-semibold uppercase tracking-widest text-[var(--clr-text-faint)]">
                  Text Size
                </h3>
              </div>

              {/* Decrease / label / Increase */}
              <div className="flex items-center gap-2 mb-3" role="group" aria-labelledby="font-size-label">
                <button
                  onClick={decrease}
                  disabled={fontIdx === 0}
                  aria-label="Decrease font size"
                  className="w-9 h-9 rounded-lg bg-[var(--clr-bg-elevated)] flex items-center justify-center text-[var(--clr-text-muted)] hover:text-[var(--clr-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus size={15} aria-hidden="true" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-sm font-semibold text-[var(--clr-text)]" aria-live="polite" aria-atomic="true">
                    {FONT_OPTIONS[fontIdx]?.label}
                  </span>
                  <p className="text-xs text-[var(--clr-text-muted)]">{FONT_OPTIONS[fontIdx]?.px}</p>
                </div>
                <button
                  onClick={increase}
                  disabled={fontIdx === FONT_ORDER.length - 1}
                  aria-label="Increase font size"
                  className="w-9 h-9 rounded-lg bg-[var(--clr-bg-elevated)] flex items-center justify-center text-[var(--clr-text-muted)] hover:text-[var(--clr-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={15} aria-hidden="true" />
                </button>
              </div>

              {/* Font size pills */}
              <div className="flex gap-1.5" role="radiogroup" aria-label="Select font size">
                {FONT_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    role="radio"
                    aria-checked={settings.fontSize === value}
                    onClick={() => update('fontSize', value)}
                    aria-label={`Font size: ${label}`}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      settings.fontSize === value
                        ? 'bg-[var(--clr-primary)] text-white'
                        : 'bg-[var(--clr-bg-elevated)] text-[var(--clr-text-muted)] hover:text-[var(--clr-primary)]'
                    }`}
                  >
                    {label.charAt(0)}
                  </button>
                ))}
              </div>
            </section>

            {/* ── Visual toggles ────────────────────────────────────── */}
            <section aria-labelledby="visual-label">
              <div className="flex items-center gap-2 mb-1">
                <Sun size={14} className="text-[var(--clr-primary)]" aria-hidden="true" />
                <h3 id="visual-label" className="text-xs font-semibold uppercase tracking-widest text-[var(--clr-text-faint)]">
                  Visual
                </h3>
              </div>
              <Toggle
                id="a11y-high-contrast"
                label="High Contrast"
                description="Stronger color contrast ratios"
                checked={settings.highContrast}
                onChange={v => update('highContrast', v)}
              />
              <Toggle
                id="a11y-underline-links"
                label="Underline Links"
                description="Makes links easier to identify"
                checked={settings.underlineLinks}
                onChange={v => update('underlineLinks', v)}
              />
              <Toggle
                id="a11y-text-spacing"
                label="Text Spacing"
                description="Increased line height & letter spacing (WCAG 1.4.12)"
                checked={settings.textSpacing}
                onChange={v => update('textSpacing', v)}
              />
            </section>

            {/* ── Motion ───────────────────────────────────────────── */}
            <section aria-labelledby="motion-label">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-[var(--clr-primary)]" aria-hidden="true" />
                <h3 id="motion-label" className="text-xs font-semibold uppercase tracking-widest text-[var(--clr-text-faint)]">
                  Motion
                </h3>
              </div>
              <Toggle
                id="a11y-reduced-motion"
                label="Reduce Motion"
                description="Disables animations and transitions"
                checked={settings.reducedMotion}
                onChange={v => update('reducedMotion', v)}
              />
            </section>

            {/* ── Focus Indicators ─────────────────────────────────── */}
            <section aria-labelledby="focus-label">
              <div className="flex items-center gap-2 mb-3">
                <Focus size={14} className="text-[var(--clr-primary)]" aria-hidden="true" />
                <h3 id="focus-label" className="text-xs font-semibold uppercase tracking-widest text-[var(--clr-text-faint)]">
                  Focus Indicators
                </h3>
              </div>
              <div className="flex gap-2" role="radiogroup" aria-labelledby="focus-label">
                {FOCUS_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    role="radio"
                    aria-checked={settings.focusIndicators === value}
                    onClick={() => update('focusIndicators', value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                      settings.focusIndicators === value
                        ? 'bg-[var(--clr-primary)]/20 border-[var(--clr-primary)] text-[var(--clr-primary)]'
                        : 'bg-[var(--clr-bg-elevated)] border-transparent text-[var(--clr-text-muted)] hover:border-[var(--clr-border-hover)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>

            {/* ── Voice Language ────────────────────────────────────────── */}
            <section aria-labelledby="lang-label">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={14} className="text-[var(--clr-primary)]" aria-hidden="true" />
                <h3 id="lang-label" className="text-xs font-semibold uppercase tracking-widest text-[var(--clr-text-faint)]">
                  Voice Language
                </h3>
              </div>
              <div className="flex flex-col gap-1.5" role="radiogroup" aria-labelledby="lang-label">
                {LANGUAGE_OPTIONS.map(({ code, native, flag, label }) => (
                  <button
                    key={code}
                    role="radio"
                    aria-checked={settings.language === code}
                    onClick={() => update('language', code)}
                    aria-label={`Set voice language to ${label}`}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                      settings.language === code
                        ? 'bg-[var(--clr-primary)]/15 border-[var(--clr-primary)] text-[var(--clr-primary)]'
                        : 'bg-[var(--clr-bg-elevated)] border-transparent text-[var(--clr-text-muted)] hover:border-[var(--clr-border-hover)] hover:text-[var(--clr-text)]'
                    }`}
                  >
                    <span className="text-base" aria-hidden="true">{flag}</span>
                    <span>{native}</span>
                    {settings.language === code && (
                      <span className="ml-auto text-[10px] font-bold bg-[var(--clr-primary)]/20 text-[var(--clr-primary)] px-1.5 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-[var(--clr-text-faint)] leading-relaxed">
                Speech recognition &amp; responses will use this language. Requires Chrome or Edge.
              </p>
            </section>

            {/* ── Quick keyboard reference ──────────────────────────── */}
            <section aria-labelledby="kbd-label">
              <div className="flex items-center gap-2 mb-2">
                <ZoomIn size={14} className="text-[var(--clr-primary)]" aria-hidden="true" />
                <h3 id="kbd-label" className="text-xs font-semibold uppercase tracking-widest text-[var(--clr-text-faint)]">
                  Keyboard Shortcuts
                </h3>
              </div>
              <ul className="space-y-1.5" role="list">
                {[
                  ['Alt + V',   'Toggle voice recognition'],
                  ['Escape',    'Close panels / menus'],
                  ['Tab',       'Navigate forward'],
                  ['Shift+Tab', 'Navigate backward'],
                  ['Enter / Space', 'Activate element'],
                ].map(([key, desc]) => (
                  <li key={key} className="flex items-center justify-between">
                    <span className="text-xs text-[var(--clr-text-muted)]">{desc}</span>
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--clr-bg-elevated)] text-[var(--clr-text-faint)] border border-[var(--clr-border)] font-mono whitespace-nowrap ml-2">
                      {key}
                    </kbd>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Footer: Reset + WCAG badge */}
          <div className="px-5 py-3 border-t border-[var(--clr-border)] flex items-center justify-between bg-[var(--clr-bg-elevated)]/40">
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-xs text-[var(--clr-text-muted)] hover:text-[var(--clr-error)] transition-colors"
              aria-label="Reset all accessibility settings to defaults"
            >
              <RotateCcw size={12} aria-hidden="true" />
              Reset defaults
            </button>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--clr-success)]/10 text-[var(--clr-success)] border border-[var(--clr-success)]/20 font-medium">
              WCAG 2.1 AA
            </span>
          </div>
        </aside>
      )}
    </>
  );
}
