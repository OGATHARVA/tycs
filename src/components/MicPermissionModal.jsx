import { useEffect, useRef } from 'react';
import { Mic, Shield, X, Check, AlertCircle } from 'lucide-react';

const WILL_DO    = ['Listen only when you click the mic button', 'Process your voice locally in the browser', 'Forget audio after the command runs'];
const WONT_DO    = ['Store or transmit your voice data', 'Record without your explicit action', 'Share data with any third party'];

export default function MicPermissionModal({ onAllow, onSkip, denied = false }) {
  const firstFocusRef  = useRef(null);
  const triggerRef     = useRef(null);
  const overlayRef     = useRef(null);

  /* Focus the primary button when modal opens */
  useEffect(() => { firstFocusRef.current?.focus(); }, []);

  /* Focus trap */
  useEffect(() => {
    const modal = overlayRef.current;
    if (!modal) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') { onSkip(); return; }
      if (e.key !== 'Tab') return;
      const focusable = modal.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onSkip]);

  /* Lock body scroll */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="mic-modal-title"
      aria-describedby="mic-modal-desc"
      ref={overlayRef}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        aria-hidden="true"
        onClick={onSkip}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-md animate-fade-in"
        style={{
          background: 'var(--clr-bg-card)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Top accent bar */}
        <div
          aria-hidden="true"
          style={{
            height: '4px',
            background: denied
              ? 'linear-gradient(90deg,#f87171,#fbbf24)'
              : 'var(--grad-primary)',
          }}
        />

        <div style={{ padding: '1.75rem' }}>
          {/* Icon + title */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
            <div
              aria-hidden="true"
              style={{
                width: '52px', height: '52px', flexShrink: 0,
                borderRadius: 'var(--radius-md)',
                background: denied ? 'rgba(248,113,113,0.15)' : 'rgba(56,189,248,0.12)',
                border: `1px solid ${denied ? 'rgba(248,113,113,0.3)' : 'rgba(56,189,248,0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: denied ? 'var(--clr-error)' : 'var(--clr-primary)',
              }}
            >
              {denied ? <AlertCircle size={24} /> : <Mic size={24} />}
            </div>

            <div style={{ flex: 1 }}>
              <h2
                id="mic-modal-title"
                style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '0.35rem', color: 'var(--clr-text)' }}
              >
                {denied ? 'Microphone Access Blocked' : 'Enable Voice Control'}
              </h2>
              <p
                id="mic-modal-desc"
                style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', lineHeight: 1.5, margin: 0 }}
              >
                {denied
                  ? 'Your browser has blocked microphone access. You can still use the Quick Commands buttons.'
                  : 'VoiceNav needs microphone access to understand your voice commands. Your privacy is our priority.'}
              </p>
            </div>

            <button
              type="button"
              onClick={onSkip}
              aria-label="Close and continue without microphone"
              ref={denied ? firstFocusRef : undefined}
              style={{
                width: '30px', height: '30px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--clr-text-faint)', borderRadius: 'var(--radius-sm)',
                transition: 'color 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--clr-text-faint)'}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {!denied && (
            <>
              {/* Privacy promise */}
              <div
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.18)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--clr-success)', marginBottom: '0.5rem' }}>
                    We will
                  </p>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {WILL_DO.map(item => (
                      <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.78rem', color: 'var(--clr-text-muted)', lineHeight: 1.4 }}>
                        <Check size={12} aria-hidden="true" style={{ color: 'var(--clr-success)', marginTop: '2px', flexShrink: 0 }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--clr-error)', marginBottom: '0.5rem' }}>
                    We won't
                  </p>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {WONT_DO.map(item => (
                      <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.78rem', color: 'var(--clr-text-muted)', lineHeight: 1.4 }}>
                        <X size={12} aria-hidden="true" style={{ color: 'var(--clr-error)', marginTop: '2px', flexShrink: 0 }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Shield size={13} aria-hidden="true" style={{ color: 'var(--clr-primary)', flexShrink: 0 }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-faint)', margin: 0 }}>
                  Audio is processed by your browser's Web Speech API and is never stored on our servers.
                </p>
              </div>
            </>
          )}

          {denied && (
            <div style={{ marginBottom: '1.5rem', padding: '0.875rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: '0.83rem', color: 'var(--clr-text-muted)', margin: 0, lineHeight: 1.6 }}>
                To re-enable microphone access:<br />
                <strong style={{ color: 'var(--clr-text)' }}>Chrome / Edge</strong> → Click the lock icon in the address bar → Set Microphone to "Allow" → Refresh the page.
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {!denied && (
              <button
                type="button"
                ref={firstFocusRef}
                onClick={onAllow}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center', minWidth: '140px' }}
                aria-label="Allow microphone access and enable voice commands"
              >
                <Mic size={16} aria-hidden="true" />
                Allow Microphone
              </button>
            )}
            <button
              type="button"
              onClick={onSkip}
              className="btn btn-outline"
              style={{ flex: 1, justifyContent: 'center' }}
              aria-label={denied ? 'Continue using Quick Commands without microphone' : 'Skip microphone and use Quick Commands instead'}
            >
              {denied ? 'Use Quick Commands' : 'Not Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
