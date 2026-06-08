import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/* ── Language options ────────────────────────────────────────────── */
export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English', native: 'English', bcp47: 'en-US', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi',   native: 'हिंदी',   bcp47: 'hi-IN', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', native: 'मराठी',   bcp47: 'mr-IN', flag: '🇮🇳' },
];

/* ── Defaults ──────────────────────────────────────────────────────── */
const DEFAULTS = {
  fontSize:        'base',   // 'sm' | 'base' | 'lg' | 'xl' | '2xl'
  highContrast:    false,
  reducedMotion:   false,
  textSpacing:     false,
  underlineLinks:  false,
  focusIndicators: 'default', // 'default' | 'enhanced' | 'high'
  language:        'en',      // 'en' | 'hi' | 'mr'
};

const FONT_SIZE_MAP = {
  sm:  '14px',
  base:'16px',
  lg:  '18px',
  xl:  '20px',
  '2xl': '23px',
};

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('voicenav-a11y');
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch { return DEFAULTS; }
  });

  /* Persist to localStorage */
  useEffect(() => {
    try { localStorage.setItem('voicenav-a11y', JSON.stringify(settings)); }
    catch { /* ignore */ }
  }, [settings]);

  /* Apply classes/styles to <html> element */
  useEffect(() => {
    const root = document.documentElement;

    /* Font size */
    root.style.setProperty('--a11y-font-size', FONT_SIZE_MAP[settings.fontSize]);
    root.style.fontSize = FONT_SIZE_MAP[settings.fontSize];

    /* High contrast */
    root.classList.toggle('hc-mode', settings.highContrast);

    /* Reduced motion */
    root.classList.toggle('reduce-motion', settings.reducedMotion);

    /* Text spacing (WCAG 1.4.12) */
    root.classList.toggle('text-spacing', settings.textSpacing);

    /* Underline links */
    root.classList.toggle('underline-links', settings.underlineLinks);

    /* Enhanced focus */
    root.dataset.focus = settings.focusIndicators;
  }, [settings]);

  const update = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setSettings(DEFAULTS), []);

  return (
    <AccessibilityContext.Provider value={{ settings, update, reset, FONT_SIZE_MAP }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used inside AccessibilityProvider');
  return ctx;
}
