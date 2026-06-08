/**
 * PageLoader — skeleton/spinner shown while lazy-loaded pages initialise.
 * Used as the React.Suspense fallback in App.jsx.
 */
export default function PageLoader() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-4"
      role="status"
      aria-label="Loading page content, please wait"
    >
      {/* Spinner */}
      <div
        aria-hidden="true"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '2px solid var(--clr-bg-elevated)',
          borderTopColor: 'var(--clr-primary)',
          animation: 'spin-slow 0.8s linear infinite',
        }}
      />

      {/* Skeleton content blocks mimicking a typical page */}
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          maxWidth: '480px',
        }}
      >
        <div className="skeleton" style={{ width: '60%', height: '14px' }} />
        <div className="skeleton" style={{ width: '80%', height: '10px' }} />
        <div className="skeleton" style={{ width: '70%', height: '10px' }} />
        <div className="skeleton" style={{ width: '50%', height: '10px', marginTop: '8px' }} />
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-faint)', margin: 0 }}>
        Loading…
      </p>
    </div>
  );
}
