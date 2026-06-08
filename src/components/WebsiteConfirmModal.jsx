import { useEffect, useRef } from 'react';
import { useVoice } from '../contexts/VoiceContext';
import { Globe, X, Check, Search, AlertCircle } from 'lucide-react';

export default function WebsiteConfirmModal() {
  const {
    pendingAction,
    confirmPendingAction,
    cancelPendingAction,
    searchGoogleFallback
  } = useVoice();

  const modalRef = useRef(null);
  const firstFocusRef = useRef(null);

  // Esc key listener and focus trap
  useEffect(() => {
    if (!pendingAction) return;

    // Focus first button on load
    setTimeout(() => {
      firstFocusRef.current?.focus();
    }, 100);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelPendingAction();
        return;
      }
      if (e.key !== 'Tab') return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusable = modal.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pendingAction, cancelPendingAction]);

  // Lock body scroll when open
  useEffect(() => {
    if (!pendingAction) return;
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [pendingAction]);

  if (!pendingAction) return null;

  const { type, site, query, timeLeft } = pendingAction;

  // Circular progress calculations for the 3s countdown
  const radius = 24;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // timeLeft goes from 3 down to 0
  const progressFraction = timeLeft != null ? timeLeft / 3 : 1;
  const strokeDashoffset = circumference - progressFraction * circumference;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[600] flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={cancelPendingAction}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-sm overflow-hidden p-6 rounded-2xl border border-[var(--clr-border)] bg-[var(--clr-bg-card)] shadow-2xl animate-scale-up"
        style={{
          background: 'linear-gradient(135deg, rgba(13,21,38,0.95), rgba(26,37,64,0.95))',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Top Gradient Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{
            background: type === 'confirm_open' ? 'var(--grad-success)' : 'var(--grad-primary)',
          }}
        />

        {/* Close Button */}
        <button
          onClick={cancelPendingAction}
          className="absolute top-4 right-4 text-[var(--clr-text-muted)] hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all"
          aria-label="Cancel navigation"
        >
          <X size={16} />
        </button>

        {/* Main Content */}
        <div className="flex flex-col items-center text-center mt-2">
          {/* Web Icon/Favicon Indicator */}
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4 text-3xl shadow-inner">
            {site?.icon || <Globe className="text-[var(--clr-primary)]" size={32} />}
            {type === 'confirm_open' && (
              <div className="absolute -bottom-2 -right-2 bg-[var(--clr-success)] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-[var(--clr-bg-card)] shadow">
                ✓
              </div>
            )}
            {type === 'disambiguate' && (
              <div className="absolute -bottom-2 -right-2 bg-[var(--clr-warning)] text-[var(--clr-bg)] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-[var(--clr-bg-card)] shadow">
                ?
              </div>
            )}
          </div>

          <h2
            id="confirm-modal-title"
            className="text-lg font-bold font-display text-[var(--clr-text)] mb-1"
          >
            {type === 'confirm_open' ? `Opening ${site?.label}` : `Did you mean ${site?.label}?`}
          </h2>
          
          <p className="text-xs text-[var(--clr-text-muted)] font-mono bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg mb-6 max-w-xs truncate">
            {site?.url?.replace(/^https?:\/\//, '')}
          </p>

          {/* Conditional Layouts based on verification mode */}
          {type === 'confirm_open' ? (
            <div className="w-full flex flex-col items-center">
              {/* Circular Countdown Loader */}
              <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
                <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                  <circle
                    stroke="rgba(255, 255, 255, 0.05)"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                  <circle
                    stroke="var(--clr-success)"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s linear' }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                </svg>
                <span className="absolute text-sm font-bold font-mono text-[var(--clr-success)]">
                  {timeLeft}s
                </span>
              </div>

              {/* Action Buttons */}
              <div className="w-full grid grid-cols-2 gap-3">
                <button
                  ref={firstFocusRef}
                  onClick={confirmPendingAction}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[var(--clr-success)] text-white hover:bg-[var(--clr-success)]/90 hover:scale-[1.02] transition-all shadow-lg shadow-[var(--clr-success)]/10"
                >
                  <Check size={14} />
                  Open Now
                </button>
                <button
                  onClick={cancelPendingAction}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-[var(--clr-text-muted)] hover:text-white hover:bg-white/10 hover:scale-[1.02] transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <p className="text-xs text-[var(--clr-text-muted)] mb-6 text-center max-w-xs">
                We resolved this from your search: <strong className="text-[var(--clr-text)]">"{query}"</strong>. 
                Say <strong className="text-[var(--clr-success)]">"yes"</strong> to open, or <strong className="text-[var(--clr-error)]">"no"</strong> to search Google instead.
              </p>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2.5">
                <button
                  ref={firstFocusRef}
                  onClick={confirmPendingAction}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[var(--clr-primary)] text-[#0a0f1e] hover:bg-[var(--clr-primary)]/90 hover:scale-[1.02] transition-all shadow-lg shadow-[var(--clr-primary)]/10"
                >
                  <Check size={14} />
                  Yes, Open Website
                </button>
                <button
                  onClick={searchGoogleFallback}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-[var(--clr-text)] hover:text-white hover:bg-white/10 hover:scale-[1.02] transition-all"
                >
                  <Search size={14} />
                  No, Search Google
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
