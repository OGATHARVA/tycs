import { useState, useEffect, useRef } from 'react';
import { useVoice, COMMANDS, STATUS, STATUS_META } from '../contexts/VoiceContext';
import { LANGUAGE_OPTIONS } from '../contexts/AccessibilityContext';
import MicPermissionModal from './MicPermissionModal';
import BrowserQuickAccess from './BrowserQuickAccess';
import {
  Mic, MicOff, X, ChevronUp, ChevronDown,
  Volume2, Navigation, ArrowDownUp,
  CheckCircle2, AlertCircle, Clock, Trash2, Zap, BookOpen, Globe, LayoutDashboard
} from 'lucide-react';

/* ─── MicButton Sub-Component ───────────────────────────────────── */
function MicButton({ micBtnRef, onClick, status, isListening, isProcessing, isRequesting, isSuccess, isError }) {
  const micBtnClass = isListening
    ? 'bg-[var(--clr-error)] shadow-[0_0_32px_rgba(248,113,113,0.6)] mic-btn-listening scale-110'
    : isProcessing
    ? 'bg-amber-500 shadow-[0_0_24px_rgba(245,158,11,0.5)]'
    : isRequesting
    ? 'bg-[var(--clr-warning)] shadow-[0_0_20px_rgba(251,191,36,0.4)]'
    : isSuccess
    ? 'bg-[var(--clr-success)] shadow-[0_0_24px_rgba(52,211,153,0.5)]'
    : isError
    ? 'bg-[var(--clr-error)] shadow-md'
    : 'bg-gradient-to-br from-[var(--clr-primary-dim)] to-[var(--clr-accent-dim)] shadow-[var(--shadow-glow-primary)] mic-btn-idle';

  return (
    <button
      ref={micBtnRef}
      id="voice-mic-btn"
      onClick={onClick}
      aria-label={isListening ? 'Stop listening (Alt+V)' : 'Start voice recognition (Alt+V)'}
      aria-pressed={isListening}
      aria-busy={isProcessing || isRequesting}
      aria-describedby="voice-status-label"
      className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-300 outline-none hover:scale-105 ${micBtnClass}`}
    >
      {isListening ? (
        <span className="flex items-end gap-0.5 h-6" aria-hidden="true">
          {[...Array(7)].map((_, i) => <span key={i} className="wave-bar" />)}
        </span>
      ) : isProcessing ? (
        <span
          className="w-6 h-6 border-[3px] border-white border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
          style={{ animationDuration: '0.7s' }}
        />
      ) : isRequesting ? (
        <span
          className="w-6 h-6 border-[3px] border-white/40 border-t-white rounded-full animate-spin"
          aria-hidden="true"
          style={{ animationDuration: '1.2s' }}
        />
      ) : isSuccess ? (
        <CheckCircle2 size={26} aria-hidden="true" />
      ) : isError ? (
        <MicOff size={24} aria-hidden="true" />
      ) : (
        <Mic size={24} aria-hidden="true" />
      )}
      {isListening && (
        <span
          className="absolute inset-0 rounded-full border-2 border-[var(--clr-error)] animate-ping opacity-60"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

/* ─── CommandHistory Sub-Component ──────────────────────────────── */
function CommandHistory({ history, dispatchHistory }) {
  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <section aria-labelledby="history-heading" className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 id="history-heading" className="text-[10px] font-bold uppercase tracking-widest text-[var(--clr-text-faint)] flex items-center gap-1.5">
          <Clock size={10} aria-hidden="true" />
          Recent Commands
        </h3>
        <button
          onClick={() => dispatchHistory({ type: 'CLEAR' })}
          className="text-[10px] text-[var(--clr-text-faint)] hover:text-[var(--clr-error)] transition-colors flex items-center gap-1"
          aria-label="Clear speech command history"
        >
          <Trash2 size={10} aria-hidden="true" />
          Clear
        </button>
      </div>
      <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
        {history.slice(0, 10).map((entry) => (
          <li
            key={entry.id}
            className={`flex items-start gap-2 px-2.5 py-2 rounded-lg text-xs border ${
              entry.success
                ? 'bg-[var(--clr-success)]/5 border-[var(--clr-success)]/15'
                : 'bg-[var(--clr-error)]/5 border-[var(--clr-error)]/15'
            }`}
          >
            <span aria-hidden="true">{entry.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold truncate ${entry.success ? 'text-[var(--clr-text)]' : 'text-[var(--clr-error)]'}`}>
                {entry.label}
              </p>
              <p className="text-[var(--clr-text-faint)] font-mono text-[10px] truncate">
                "{entry.text}"
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[var(--clr-text-faint)] text-[10px]">{formatTime(entry.timestamp)}</p>
              {entry.confidence != null && (
                <p
                  className="text-[10px] font-semibold"
                  style={{
                    color:
                      entry.confidence > 0.75
                        ? 'var(--clr-success)'
                        : entry.confidence > 0.5
                        ? 'var(--clr-warning)'
                        : 'var(--clr-error)',
                  }}
                >
                  {Math.round(entry.confidence * 100)}%
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ─── VoicePanel Sub-Component ──────────────────────────────────── */
function VoicePanel({
  panelRef,
  onClose,
  activeLang,
  continuous,
  setContinuous,
  ttsEnabled,
  setTtsEnabled,
  stopSpeaking,
  status,
  meta,
  isListening,
  confPct,
  interimText,
  finalText,
  isSpeaking,
  processCommand,
  history,
  dispatchHistory,
  setHelpOpen,
  SpeechRec,
  showToast,
}) {
  const [activeTab, setActiveTab] = useState('commands'); // 'commands' | 'browser'
  return (
    <aside
      ref={panelRef}
      id="voice-panel"
      role="complementary"
      aria-label="Voice recognition status and history"
      className="fixed bottom-28 right-6 z-50 w-80 bg-[var(--clr-bg-card)] border border-[var(--clr-border)] rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:w-full max-sm:rounded-t-2xl max-sm:border-t max-sm:border-b-0 max-sm:border-x-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--clr-border)] bg-gradient-to-r from-sky-500/5 to-violet-500/5">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: meta.color,
              boxShadow: isListening ? `0 0 8px ${meta.color}` : 'none',
            }}
            aria-hidden="true"
          />
          <h2 className="text-sm font-bold text-[var(--clr-text)]">Voice Control</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            aria-label={`Speech language: ${activeLang.label}`}
            title={`Language: ${activeLang.native} — change in Accessibility Settings`}
            className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] text-[var(--clr-text-muted)] cursor-default"
          >
            <span aria-hidden="true">{activeLang.flag}</span>
            {activeLang.code.toUpperCase()}
          </span>
          <button
            onClick={() => setContinuous(c => !c)}
            aria-pressed={continuous}
            aria-label={`Continuous listening: ${continuous ? 'active' : 'inactive'}`}
            title="Toggle continuous listening"
            className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all ${
              continuous
                ? 'bg-[var(--clr-primary)]/20 border-[var(--clr-primary)] text-[var(--clr-primary)]'
                : 'bg-[var(--clr-bg-elevated)] border-[var(--clr-border)] text-[var(--clr-text-muted)]'
            }`}
          >
            <Zap size={10} aria-hidden="true" />
            Loop
          </button>
          <button
            onClick={() => {
              setTtsEnabled(t => !t);
              if (ttsEnabled) stopSpeaking();
            }}
            aria-pressed={ttsEnabled}
            aria-label={`Speech output: ${ttsEnabled ? 'enabled' : 'disabled'}`}
            title="Toggle speech feedback"
            className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all ${
              ttsEnabled
                ? 'bg-[var(--clr-success)]/20 border-[var(--clr-success)] text-[var(--clr-success)]'
                : 'bg-[var(--clr-bg-elevated)] border-[var(--clr-border)] text-[var(--clr-text-muted)]'
            }`}
          >
            TTS
          </button>
          <button
            onClick={onClose}
            aria-label="Close voice status drawer"
            className="w-6 h-6 rounded-full bg-[var(--clr-bg-elevated)] text-[var(--clr-text-muted)] hover:text-[var(--clr-text)] flex items-center justify-center transition-colors ml-1"
          >
            <X size={13} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-[var(--clr-border)]" role="tablist" aria-label="Voice panel sections">
        <button
          role="tab"
          aria-selected={activeTab === 'commands'}
          aria-controls="tab-panel-commands"
          id="tab-commands"
          onClick={() => setActiveTab('commands')}
          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all border-b-2 ${
            activeTab === 'commands'
              ? 'border-[var(--clr-primary)] text-[var(--clr-primary)]'
              : 'border-transparent text-[var(--clr-text-faint)] hover:text-[var(--clr-text-muted)]'
          }`}
        >
          <Mic size={9} aria-hidden="true" /> Commands
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'browser'}
          aria-controls="tab-panel-browser"
          id="tab-browser"
          onClick={() => setActiveTab('browser')}
          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all border-b-2 ${
            activeTab === 'browser'
              ? 'border-[var(--clr-accent)] text-[var(--clr-accent)]'
              : 'border-transparent text-[var(--clr-text-faint)] hover:text-[var(--clr-text-muted)]'
          }`}
        >
          <Globe size={9} aria-hidden="true" /> Browser
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* ── COMMANDS TAB ───────────────────────────────────────── */}
        {activeTab === 'commands' && (
          <div id="tab-panel-commands" role="tabpanel" aria-labelledby="tab-commands" className="space-y-4">

            {/* Live status panel */}
            <section aria-labelledby="voice-live-heading">
              <h3 id="voice-live-heading" className="text-[10px] font-bold uppercase tracking-widest text-[var(--clr-text-faint)] mb-2 flex items-center gap-1.5">
                <Volume2 size={10} aria-hidden="true" />
                Live Recognition
              </h3>
              <div
                className="relative rounded-xl border min-h-[56px] flex flex-col justify-center px-3 py-2.5 transition-all duration-300"
                style={{ borderColor: `${meta.color}40`, background: meta.bg }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: meta.color, animation: isListening ? 'pulse 1s ease-in-out infinite' : 'none' }}
                    aria-hidden="true"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>
                    {status}
                  </span>
                  {confPct !== null && (
                    <span className="ml-auto text-[10px] text-[var(--clr-text-muted)] font-medium">
                      {confPct}% confidence
                    </span>
                  )}
                </div>
                <div aria-live="polite" aria-atomic="false">
                  {interimText || finalText ? (
                    <div className="space-y-0.5">
                      {interimText && <p className="text-xs text-[var(--clr-text-muted)] italic font-mono truncate">{interimText}</p>}
                      {finalText && !interimText && <p className="text-xs font-mono font-medium text-[var(--clr-text)] truncate">"{finalText}"</p>}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--clr-text-faint)] italic">
                      {isListening ? 'Waiting for speech…' : status === STATUS.idle ? 'No input yet' : meta.label}
                    </p>
                  )}
                </div>
                {confPct !== null && (
                  <div className="mt-2" aria-hidden="true">
                    <div className="w-full h-1 rounded-full bg-[var(--clr-bg-elevated)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${confPct}%`, background: confPct > 75 ? 'var(--clr-success)' : confPct > 50 ? 'var(--clr-warning)' : 'var(--clr-error)' }}
                      />
                    </div>
                  </div>
                )}
                {isListening && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-end gap-0.5 h-5 opacity-60" aria-hidden="true">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="w-0.5 rounded-full bg-current animate-pulse"
                        style={{ color: meta.color, animationName: 'wave', animationDuration: '0.8s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite', animationDelay: `${i * 0.1}s`, height: '6px' }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* API Support warning */}
            {!SpeechRec && (
              <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-[var(--clr-warning)]/10 border border-[var(--clr-warning)]/30 text-xs text-[var(--clr-warning)]">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>Web Speech API not supported. Please use Chrome, Edge, or Safari.</span>
              </div>
            )}

            {/* Active TTS Indicator */}
            {isSpeaking && (
              <div role="status" className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--clr-accent)]/10 border border-[var(--clr-accent)]/30 animate-fade-in">
                <div className="flex items-center gap-2">
                  <BookOpen size={12} className="text-[var(--clr-accent)] flex-shrink-0" aria-hidden="true" />
                  <span className="text-xs font-semibold text-[var(--clr-accent)]">Speaking page…</span>
                  <span className="flex items-end gap-px h-3" aria-hidden="true">
                    {[...Array(4)].map((_, i) => (
                      <span key={i} className="w-0.5 rounded-full bg-[var(--clr-accent)]"
                        style={{ animationName: 'wave', animationDuration: '0.6s', animationIterationCount: 'infinite', animationDelay: `${i * 0.12}s`, height: '4px' }}
                      />
                    ))}
                  </span>
                </div>
                <button onClick={stopSpeaking}
                  className="text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--clr-accent)]/20 text-[var(--clr-accent)] hover:bg-[var(--clr-accent)]/30 transition-colors font-bold"
                >Stop</button>
              </div>
            )}

            {/* Simulator / Quick Commands */}
            <section aria-labelledby="quick-cmds-heading">
              <div className="flex items-center justify-between mb-2">
                <h3 id="quick-cmds-heading" className="text-[10px] font-bold uppercase tracking-widest text-[var(--clr-text-faint)] flex items-center gap-1.5">
                  <Zap size={10} aria-hidden="true" /> Simulator
                </h3>
                <button onClick={() => setHelpOpen(true)}
                  className="text-[10px] font-semibold text-[var(--clr-accent)] hover:text-[var(--clr-primary)] transition-colors"
                >All Commands</button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: '🏠 Home',       cmd: 'open home' },
                  { label: '👥 About',      cmd: 'open about' },
                  { label: '⚙️ Services',   cmd: 'open services' },
                  { label: '✉️ Contact',    cmd: 'open contact' },
                  { label: '📊 Dashboard',  cmd: 'open dashboard' },
                  { label: '↩️ Go Back',    cmd: 'go back' },
                  { label: '⬇️ Scroll ↓',  cmd: 'scroll down' },
                  { label: '📖 Read Page', cmd: 'read page' },
                ].map(({ label, cmd }) => (
                  <button key={cmd} onClick={() => processCommand(cmd)}
                    className="text-xs px-2.5 py-2 rounded-lg bg-[var(--clr-bg-elevated)] text-[var(--clr-text-muted)] hover:bg-[var(--clr-border)] hover:text-[var(--clr-primary)] transition-all text-left border border-transparent hover:border-[var(--clr-border-hover)] font-medium"
                  >{label}</button>
                ))}
              </div>
            </section>

            {/* History */}
            {history.length > 0 && (
              <CommandHistory history={history} dispatchHistory={dispatchHistory} />
            )}
          </div>
        )}

        {/* ── BROWSER TAB ────────────────────────────────────────── */}
        {activeTab === 'browser' && (
          <div id="tab-panel-browser" role="tabpanel" aria-labelledby="tab-browser">
            <BrowserQuickAccess
              onSiteOpen={(site) => {
                showToast?.(`📂 Opened ${site.label} in a new tab`, 'success', 3000);
              }}
            />
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="px-4 py-2.5 border-t border-[var(--clr-border)] bg-[var(--clr-bg-elevated)]/40 flex items-center justify-between">
        <span className="text-[10px] text-[var(--clr-text-faint)]">
          Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] font-mono text-[9px]">Alt+V</kbd> to toggle mic
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isListening ? 'text-[var(--clr-error)] border-[var(--clr-error)]/30 bg-[var(--clr-error)]/10' : 'text-[var(--clr-text-faint)] border-[var(--clr-border)]'}`}>
          {isListening ? '● REC' : '○ IDLE'}
        </span>
      </div>
    </aside>
  );
}

/* ─── Main VoiceController Component ────────────────────────────── */
export default function VoiceController({ onListeningChange }) {
  const {
    status, interimText, finalText, confidence, history, dispatchHistory,
    continuous, setContinuous, ttsEnabled, setTtsEnabled, isSpeaking,
    langCode, startListening, stopListening, processCommand, stopSpeaking,
    micPermission, setMicPermission, showMicModal, setShowMicModal, requestMicAccess,
    toast, setToast,
  } = useVoice();

  // Lightweight toast helper to pass into sub-components
  const toastRef = useRef(null);
  const showToast = (msg, type = 'info', duration = 3500) => {
    if (setToast) { setToast({ msg, type, id: Date.now() }); }
  };

  const activeLang = LANGUAGE_OPTIONS.find(l => l.bcp47 === langCode) || LANGUAGE_OPTIONS[0];

  const [panelOpen, setPanelOpen] = useState(false);
  const [helpOpen, setHelpOpen]   = useState(false);

  const panelRef  = useRef(null);
  const micBtnRef = useRef(null);
  const helpRef   = useRef(null);

  useEffect(() => {
    onListeningChange?.(status === STATUS.listening);
  }, [status, onListeningChange]);

  useEffect(() => {
    const handleHelpEvent = () => setHelpOpen(true);
    window.addEventListener('voicenav:help', handleHelpEvent);
    return () => window.removeEventListener('voicenav:help', handleHelpEvent);
  }, []);

  // Keyboard navigation logic
  useEffect(() => {
    if (!helpOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') { setHelpOpen(false); micBtnRef.current?.focus(); }
    };
    document.addEventListener('keydown', handler);
    helpRef.current?.querySelector('button')?.focus();
    return () => document.removeEventListener('keydown', handler);
  }, [helpOpen]);

  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') { setPanelOpen(false); micBtnRef.current?.focus(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [panelOpen]);

  const isListening   = status === STATUS.listening;
  const isProcessing  = status === STATUS.processing;
  const isRequesting  = status === STATUS.requesting;
  const isSuccess     = status === STATUS.success;
  const isError       = status === STATUS.error;

  const meta = STATUS_META[status];
  const confPct = confidence != null ? Math.round(confidence * 100) : null;
  const SpeechRec = (typeof window !== 'undefined') ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

  return (
    <>
      {/* Floating control widget */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 max-sm:bottom-4 max-sm:right-4"
        role="region"
        aria-label="Voice control floating button"
      >
        <button
          onClick={() => setPanelOpen(p => !p)}
          aria-expanded={panelOpen}
          aria-controls="voice-panel"
          aria-label={panelOpen ? 'Close voice status panel' : 'Open voice status panel'}
          className="w-8 h-8 rounded-full bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] text-[var(--clr-text-muted)] hover:text-[var(--clr-primary)] hover:border-[var(--clr-primary)] flex items-center justify-center transition-all duration-200 outline-none focus-visible:scale-105"
        >
          {panelOpen ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronUp size={15} aria-hidden="true" />}
        </button>

        <MicButton
          micBtnRef={micBtnRef}
          onClick={startListening}
          status={status}
          isListening={isListening}
          isProcessing={isProcessing}
          isRequesting={isRequesting}
          isSuccess={isSuccess}
          isError={isError}
        />

        <div
          id="voice-status-label"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-center text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap transition-all duration-300 border shadow-md"
          style={{ color: meta.color, background: meta.bg, borderColor: `${meta.color}30` }}
        >
          {isListening && <span aria-hidden="true">🎤 </span>}
          {isProcessing && <span aria-hidden="true">⚙ </span>}
          {isSuccess && <span aria-hidden="true">✓ </span>}
          {isError && <span aria-hidden="true">✗ </span>}
          {meta.label}
        </div>
      </div>

      {/* Main Drawer Status Panel */}
      {panelOpen && (
        <VoicePanel
          panelRef={panelRef}
          onClose={() => setPanelOpen(false)}
          activeLang={activeLang}
          continuous={continuous}
          setContinuous={setContinuous}
          ttsEnabled={ttsEnabled}
          setTtsEnabled={setTtsEnabled}
          stopSpeaking={stopSpeaking}
          status={status}
          meta={meta}
          isListening={isListening}
          confPct={confPct}
          interimText={interimText}
          finalText={finalText}
          isSpeaking={isSpeaking}
          processCommand={processCommand}
          history={history}
          dispatchHistory={dispatchHistory}
          setHelpOpen={setHelpOpen}
          SpeechRec={SpeechRec}
          showToast={showToast}
        />
      )}

      {/* Help Command modal */}
      {helpOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="help-dialog-title" className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setHelpOpen(false)} aria-hidden="true" />
          <div ref={helpRef} className="relative bg-[var(--clr-bg-card)] border border-[var(--clr-border)] rounded-2xl shadow-2xl p-6 w-full max-w-lg animate-fade-in max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-5 flex-shrink-0">
              <h2 id="help-dialog-title" className="font-display text-lg font-bold text-[var(--clr-text)]">
                <span className="gradient-text">Voice</span> Commands
              </h2>
              <button onClick={() => { setHelpOpen(false); micBtnRef.current?.focus(); }} className="w-8 h-8 rounded-full bg-[var(--clr-bg-elevated)] text-[var(--clr-text-muted)] hover:text-[var(--clr-text)] flex items-center justify-center transition-colors">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              {['Navigation', 'Scroll', 'Utility', 'Universal', 'Browser'].map(cat => {
                const catCmds = COMMANDS.filter(c => c.category === cat);
                return (
                  <section key={cat} aria-labelledby={`cat-${cat}`}>
                    <h3 id={`cat-${cat}`} className="text-[10px] font-bold uppercase tracking-widest text-[var(--clr-text-faint)] mb-2 flex items-center gap-2">
                      {cat === 'Navigation' && <Navigation size={10} aria-hidden="true" />}
                      {cat === 'Scroll' && <ArrowDownUp size={10} aria-hidden="true" />}
                      {cat === 'Utility' && <Zap size={10} aria-hidden="true" />}
                      {cat === 'Universal' && <Mic size={10} aria-hidden="true" />}
                      {cat === 'Browser' && <Globe size={10} aria-hidden="true" />}
                      {cat}
                    </h3>
                    <ul className="space-y-1.5">
                      {catCmds.map(({ label, phrases, icon }) => (
                        <li key={label} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--clr-bg-elevated)] transition-colors cursor-default">
                          <span className="text-base leading-none mt-0.5" aria-hidden="true">{icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[var(--clr-text)]">{label}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {phrases.map(p => (
                                <span key={p} className="text-[10px] px-1.5 py-0.5 bg-[var(--clr-bg-elevated)] text-[var(--clr-text-muted)] rounded font-mono border border-[var(--clr-border)]">"{p}"</span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              let runPhrase = phrases[0];
                              if (runPhrase.includes('[button name]')) runPhrase = 'click services';
                              else if (runPhrase.includes('[text]')) runPhrase = 'type hello';
                              else if (runPhrase.includes('[query]')) runPhrase = 'search features';
                              else if (runPhrase.includes('[any website]')) runPhrase = 'open netflix';
                              processCommand(runPhrase);
                              setHelpOpen(false);
                            }}
                            className="text-[10px] px-2 py-1 rounded-lg bg-[var(--clr-primary)]/10 text-[var(--clr-primary)] hover:bg-[var(--clr-primary)]/20 transition-colors flex-shrink-0 mt-0.5"
                          >
                            Try
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-[var(--clr-text-faint)] text-center flex-shrink-0 pt-3 border-t border-[var(--clr-border)]">
              Press <kbd className="px-1.5 py-0.5 bg-[var(--clr-bg-elevated)] rounded font-mono border border-[var(--clr-border)]">Alt + V</kbd> to toggle microphone
            </p>
          </div>
        </div>
      )}

      {/* Mic Permission Helper Modal */}
      {showMicModal && (
        <MicPermissionModal
          onAllow={requestMicAccess}
          onSkip={() => {
            setShowMicModal(false);
            setMicPermission('skipped');
          }}
          denied={micPermission === 'denied'}
        />
      )}
    </>
  );
}
