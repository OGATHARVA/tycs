import { useState, useEffect } from 'react';
import { useVoice, STATUS_META } from '../contexts/VoiceContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Mic, Activity, Clock, Settings2, BarChart3, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';

export default function Dashboard() {
  const { status, interimText, finalText, confidence, history, isSpeaking } = useVoice();
  const { settings } = useAccessibility();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const meta = STATUS_META[status];
  const isListening = status === 'listening';

  // Calculate stats
  const totalCommands = history.length;
  const successfulCommands = history.filter(h => h.success).length;
  const successRate = totalCommands > 0 ? Math.round((successfulCommands / totalCommands) * 100) : 0;
  
  // High confidence commands (>80%)
  const highConfCommands = history.filter(h => h.confidence && h.confidence > 0.8).length;
  const highConfRate = totalCommands > 0 ? Math.round((highConfCommands / totalCommands) * 100) : 0;

  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <main id="main-content" tabIndex="-1" className="section pt-32 pb-24 outline-none">
      <div className="container max-w-6xl">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2">
              System <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-[var(--clr-text-muted)]">
              Real-time monitor for voice recognition and accessibility settings.
            </p>
          </div>
          
          {/* Global Status Badge */}
          <div 
            className="flex items-center gap-3 px-4 py-2 rounded-xl border shadow-sm transition-all duration-300"
            style={{ 
              borderColor: `${meta.color}40`, 
              backgroundColor: meta.bg 
            }}
          >
            <div className="relative flex items-center justify-center w-3 h-3">
              {isListening && (
                <span 
                  className="absolute inset-0 rounded-full animate-ping opacity-75" 
                  style={{ backgroundColor: meta.color }} 
                />
              )}
              <span 
                className="relative rounded-full w-2.5 h-2.5" 
                style={{ backgroundColor: meta.color }} 
              />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--clr-text-faint)] leading-none mb-1">
                Microphone Status
              </p>
              <p className="text-sm font-semibold leading-none" style={{ color: meta.color }}>
                {status.toUpperCase()}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (Live & Stats) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Live Recognition Card */}
            <section className="card p-6 border-t-4" style={{ borderTopColor: meta.color }}>
              <div className="flex items-center gap-2 mb-4">
                <Activity size={18} className="text-[var(--clr-primary)]" />
                <h2 className="font-bold text-lg">Live Recognition</h2>
              </div>
              
              <div className="min-h-[120px] bg-[var(--clr-bg-root)] rounded-xl border border-[var(--clr-border)] p-4 flex flex-col justify-center relative overflow-hidden">
                {(interimText || finalText) ? (
                  <div className="space-y-2 z-10">
                    {interimText && (
                      <p className="text-sm text-[var(--clr-text-muted)] italic font-mono animate-pulse">
                        {interimText}
                      </p>
                    )}
                    {finalText && !interimText && (
                      <p className="text-base font-mono font-medium text-[var(--clr-text)]">
                        "{finalText}"
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--clr-text-faint)] italic text-center z-10">
                    {isListening ? 'Waiting for speech…' : 'No input active'}
                  </p>
                )}

                {/* Background wave animation if listening */}
                {isListening && (
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-[0.03] flex items-end justify-around pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-4 bg-current rounded-t-full"
                        style={{
                          color: meta.color,
                          height: `${Math.random() * 100}%`,
                          animationName: 'wave',
                          animationDuration: `${0.5 + Math.random()}s`,
                          animationIterationCount: 'infinite',
                          animationDirection: 'alternate'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-[var(--clr-text-muted)] flex items-center gap-1.5">
                  <Mic size={14} /> 
                  {isSpeaking ? 'Speaking...' : meta.label}
                </span>
                {confidence !== null && (
                  <span className="font-mono text-[var(--clr-text-faint)]">
                    Confidence: {Math.round(confidence * 100)}%
                  </span>
                )}
              </div>
            </section>

            {/* Quick Stats Card */}
            <section className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-[var(--clr-accent)]" />
                <h2 className="font-bold text-lg">System Metrics</h2>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--clr-bg-root)] p-4 rounded-xl border border-[var(--clr-border)] flex flex-col items-center justify-center text-center h-24">
                    <div className="skeleton w-12 h-7 mb-2" />
                    <div className="skeleton w-16 h-3" />
                  </div>
                  <div className="bg-[var(--clr-bg-root)] p-4 rounded-xl border border-[var(--clr-border)] flex flex-col items-center justify-center text-center h-24">
                    <div className="skeleton w-12 h-7 mb-2" />
                    <div className="skeleton w-16 h-3" />
                  </div>
                  <div className="bg-[var(--clr-bg-root)] p-4 rounded-xl border border-[var(--clr-border)] flex flex-col items-center justify-center text-center col-span-2 h-20">
                    <div className="flex w-full justify-between items-center mb-2">
                      <div className="skeleton w-28 h-3" />
                      <div className="skeleton w-8 h-3" />
                    </div>
                    <div className="skeleton w-full h-2" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                  <div className="bg-[var(--clr-bg-root)] p-4 rounded-xl border border-[var(--clr-border)] flex flex-col items-center justify-center text-center">
                    <p className="text-3xl font-display font-bold text-[var(--clr-text)]">{totalCommands}</p>
                    <p className="text-xs text-[var(--clr-text-muted)] font-medium uppercase tracking-wider mt-1">Total Cmds</p>
                  </div>
                  
                  <div className="bg-[var(--clr-bg-root)] p-4 rounded-xl border border-[var(--clr-border)] flex flex-col items-center justify-center text-center">
                    <p className="text-3xl font-display font-bold text-[var(--clr-success)]">{successRate}%</p>
                    <p className="text-xs text-[var(--clr-text-muted)] font-medium uppercase tracking-wider mt-1">Success Rate</p>
                  </div>

                  <div className="bg-[var(--clr-bg-root)] p-4 rounded-xl border border-[var(--clr-border)] flex flex-col items-center justify-center text-center col-span-2">
                    <div className="flex w-full justify-between items-end mb-2">
                      <p className="text-xs text-[var(--clr-text-muted)] font-medium uppercase tracking-wider">High Confidence NLP</p>
                      <p className="text-sm font-bold text-[var(--clr-primary)]">{highConfRate}%</p>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--clr-border)] overflow-hidden">
                      <div 
                        className="h-full bg-[var(--clr-primary)] rounded-full transition-all duration-1000" 
                        style={{ width: `${highConfRate}%` }} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
            
            {/* Accessibility Overview Card */}
            <section className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 size={18} className="text-[var(--clr-warning)]" />
                <h2 className="font-bold text-lg">Active A11y Settings</h2>
              </div>
              
              <ul className="space-y-3">
                <li className="flex justify-between items-center text-sm border-b border-[var(--clr-border)] pb-2">
                  <span className="text-[var(--clr-text-muted)]">Font Size</span>
                  <span className="font-medium capitalize bg-[var(--clr-bg-root)] px-2 py-0.5 rounded text-xs">{settings.fontSize}</span>
                </li>
                <li className="flex justify-between items-center text-sm border-b border-[var(--clr-border)] pb-2">
                  <span className="text-[var(--clr-text-muted)]">High Contrast</span>
                  <span className="font-medium">
                    {settings.highContrast ? <CheckCircle2 size={16} className="text-[var(--clr-success)]" /> : <X size={16} className="text-[var(--clr-text-faint)]" />}
                  </span>
                </li>
                <li className="flex justify-between items-center text-sm border-b border-[var(--clr-border)] pb-2">
                  <span className="text-[var(--clr-text-muted)]">Reduced Motion</span>
                  <span className="font-medium">
                    {settings.reducedMotion ? <CheckCircle2 size={16} className="text-[var(--clr-success)]" /> : <X size={16} className="text-[var(--clr-text-faint)]" />}
                  </span>
                </li>
                <li className="flex justify-between items-center text-sm border-b border-[var(--clr-border)] pb-2">
                  <span className="text-[var(--clr-text-muted)]">Text Spacing</span>
                  <span className="font-medium">
                    {settings.textSpacing ? <CheckCircle2 size={16} className="text-[var(--clr-success)]" /> : <X size={16} className="text-[var(--clr-text-faint)]" />}
                  </span>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span className="text-[var(--clr-text-muted)]">Focus Indicators</span>
                  <span className="font-medium capitalize bg-[var(--clr-bg-root)] px-2 py-0.5 rounded text-xs">{settings.focusIndicators}</span>
                </li>
              </ul>
            </section>

          </div>

          {/* Right Column (History) */}
          <div className="lg:col-span-2">
            <section className="card p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#a855f7]" />
                  <h2 className="font-bold text-lg">Command History</h2>
                </div>
                <div className="text-xs px-3 py-1 bg-[var(--clr-bg-root)] rounded-full border border-[var(--clr-border)] text-[var(--clr-text-muted)] font-medium">
                  Showing last {history.length}
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-4 items-center py-3 border-b border-[var(--clr-border)]">
                      <div className="skeleton w-16 h-4" />
                      <div className="skeleton flex-1 h-4" />
                      <div className="skeleton w-24 h-4" />
                      <div className="skeleton w-16 h-4" />
                    </div>
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-[var(--clr-border)] rounded-2xl bg-slate-900/20 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-slate-900/60 flex items-center justify-center text-[var(--clr-text-faint)] border border-[var(--clr-border)] mb-4 mic-btn-idle" aria-hidden="true">
                    <Mic size={24} className="text-[var(--clr-primary)]" />
                  </div>
                  <h3 className="font-bold text-base text-[var(--clr-text)] mb-2">No Voice Commands Yet</h3>
                  <p className="text-xs text-[var(--clr-text-muted)] max-w-sm leading-relaxed mb-6">
                    Your voice command analytics and history will appear here in real-time once you start talking.
                  </p>
                  <div className="flex flex-col gap-2 w-full max-w-xs text-left">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--clr-text-faint)] text-center mb-1">Suggested commands to test:</span>
                    <code className="text-xs px-3 py-1.5 rounded-lg bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] text-[var(--clr-primary)] font-mono text-center">"Go to Services"</code>
                    <code className="text-xs px-3 py-1.5 rounded-lg bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] text-[var(--clr-primary)] font-mono text-center">"Scroll down"</code>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[var(--clr-border)] text-xs uppercase tracking-wider text-[var(--clr-text-muted)]">
                        <th className="pb-3 px-4 font-semibold">Time</th>
                        <th className="pb-3 px-4 font-semibold">Transcript</th>
                        <th className="pb-3 px-4 font-semibold">Action</th>
                        <th className="pb-3 px-4 font-semibold text-center">NLU Method</th>
                        <th className="pb-3 px-4 font-semibold text-right">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((entry) => (
                        <tr 
                          key={entry.id} 
                          className="border-b border-[var(--clr-border)] hover:bg-[var(--clr-bg-root)] transition-colors group"
                        >
                          <td className="py-3 px-4 text-xs font-mono text-[var(--clr-text-faint)] whitespace-nowrap">
                            {formatTime(entry.timestamp)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-medium">"{entry.text}"</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span aria-hidden="true">{entry.icon}</span>
                              <span className={`text-sm ${entry.success ? 'text-[var(--clr-text)]' : 'text-[var(--clr-error)]'}`}>
                                {entry.label}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wide ${
                              entry.method === 'phrase' ? 'bg-[var(--clr-success)]/10 text-[var(--clr-success)]' :
                              entry.method === 'keyword' ? 'bg-[var(--clr-primary)]/10 text-[var(--clr-primary)]' :
                              entry.method === 'intent' ? 'bg-[#a855f7]/10 text-[#a855f7]' :
                              'bg-[var(--clr-error)]/10 text-[var(--clr-error)]'
                            }`}>
                              {entry.method}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {entry.success ? (
                                <CheckCircle2 size={14} className="text-[var(--clr-success)] opacity-0 group-hover:opacity-100 transition-opacity" />
                              ) : (
                                <AlertCircle size={14} className="text-[var(--clr-error)] opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                              {entry.confidence != null ? (
                                <span className={`text-sm font-mono ${
                                  entry.confidence > 0.75 ? 'text-[var(--clr-success)]' : 
                                  entry.confidence > 0.5 ? 'text-[var(--clr-warning)]' : 
                                  'text-[var(--clr-error)]'
                                }`}>
                                  {Math.round(entry.confidence * 100)}%
                                </span>
                              ) : (
                                <span className="text-sm font-mono text-[var(--clr-text-faint)]">--</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

        </div>
      </div>
    </main>
  );
}
