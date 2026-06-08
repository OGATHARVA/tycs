import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';

const ICONS = {
  success: CheckCircle2,
  error:   AlertCircle,
  info:    Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: { bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)',  text: '#34d399', live: 'polite'    },
  error:   { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', text: '#f87171', live: 'assertive' },
  info:    { bg: 'rgba(56,189,248,0.10)',  border: 'rgba(56,189,248,0.25)', text: '#38bdf8', live: 'polite'    },
  warning: { bg: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.25)', text: '#fbbf24', live: 'polite'    },
};

function ToastItem({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);
  const { msg, type = 'info', duration = 3500 } = toast;
  const c = COLORS[type] || COLORS.info;
  const Icon = ICONS[type] || Info;

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 200);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    const t = setTimeout(dismiss, duration);
    return () => clearTimeout(t);
  }, [dismiss, duration]);

  return (
    <div
      role="status"
      aria-live={c.live}
      aria-atomic="true"
      className={exiting ? 'animate-toast-out' : 'animate-toast-in'}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 14px',
        borderRadius: '12px',
        border: `1px solid ${c.border}`,
        background: `color-mix(in srgb, var(--clr-bg-card) 85%, transparent)`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'auto',
        position: 'relative',
      }}
    >
      {/* Colored left accent */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0, top: '12px', bottom: '12px',
          width: '3px',
          background: c.text,
          borderRadius: '0 3px 3px 0',
        }}
      />

      <div
        aria-hidden="true"
        style={{
          marginLeft: '8px',
          flexShrink: 0,
          width: '18px',
          height: '18px',
          color: c.text,
          marginTop: '1px',
        }}
      >
        <Icon size={18} />
      </div>

      <p
        style={{
          flex: 1,
          fontSize: '0.85rem',
          lineHeight: '1.45',
          color: 'var(--clr-text)',
          margin: 0,
          paddingRight: '4px',
          wordBreak: 'break-word',
        }}
      >
        {msg}
      </p>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notification"
        style={{
          flexShrink: 0,
          width: '22px',
          height: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--clr-text-faint)',
          borderRadius: '4px',
          padding: 0,
          transition: 'color 150ms ease',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--clr-text-faint)'}
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function Toast() {
  const { toast, setToast } = useVoice();
  const [toasts, setToasts] = useState([]);

  // Convert incoming single toast to stacked list
  useEffect(() => {
    if (!toast) return;
    const entry = { ...toast, id: toast.id ?? Date.now() };
    setToasts(prev => {
      const deduped = prev.filter(t => t.msg !== entry.msg);
      return [...deduped.slice(-2), entry]; // max 3
    });
    setToast(null);
  }, [toast, setToast]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      style={{
        position: 'fixed',
        bottom: '5.5rem',
        right: '1.25rem',
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
        maxWidth: '380px',
        width: 'calc(100vw - 2.5rem)',
      }}
    >
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}
