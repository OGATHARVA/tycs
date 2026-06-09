import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bot, Send, Mic, MicOff, X, Volume2, VolumeX, Sparkles, RotateCcw,
} from 'lucide-react';
import { useVoice } from '../contexts/VoiceContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { queryAssistant } from '../utils/assistantNLP';

export default function AccessibilityAssistant() {
  const navigate = useNavigate();
  const location = useLocation();

  const { speak, stopSpeaking, ttsEnabled, setTtsEnabled } = useVoice();
  const { settings, update, reset } = useAccessibility();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: "Hello! I am your Accessibility Assistant. I'm here to help you navigate the site, explain voice commands, summarize page content, or adjust your accessibility settings. What can I help you with?",
      timestamp: new Date(),
      suggestions: ["Summarize this page", "What voice commands can I say?", "Enable High Contrast", "Guided Tour of website"]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatListening, setChatListening] = useState(false);

  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatMicRef = useRef(null);
  const recognitionRef = useRef(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Global hotkey Alt+A to toggle assistant
  useEffect(() => {
    const handleHotkey = (e) => {
      if (e.key === 'a' && e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    document.addEventListener('keydown', handleHotkey);
    return () => document.removeEventListener('keydown', handleHotkey);
  }, []);

  // Keyboard accessibility: Escape to close and focus trap
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
      if (e.key === 'Tab') {
        const focusable = panelRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    // Focus close button or first suggestion
    setTimeout(() => {
      panelRef.current?.querySelector('button[aria-label="Close assistant panel"]')?.focus();
    }, 100);

    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e) => {
      if (!panelRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  // Fetch page DOM details dynamically to pass to NLP engine
  const getPageContext = useCallback(() => {
    const mainEl = document.getElementById('main-content') || document.querySelector('main');
    let headings = [];
    let text = '';
    
    if (mainEl) {
      mainEl.querySelectorAll('h1, h2, h3').forEach(h => {
        if (h.textContent) headings.push(h.textContent.trim());
      });
      const clone = mainEl.cloneNode(true);
      clone.querySelectorAll('[aria-hidden="true"], script, style, .sr-only, nav').forEach(el => el.remove());
      text = clone.textContent?.replace(/\s+/g, ' ').trim() || '';
    }

    return {
      pathname: location.pathname,
      docText: text,
      docHeadings: headings,
      a11ySettings: settings
    };
  }, [location, settings]);

  // Handle setting updates triggered by assistant actions
  const executeAssistantAction = useCallback((action) => {
    if (!action) return;
    if (action.type === 'setting') {
      update(action.key, action.value);
    } else if (action.type === 'reset') {
      reset();
    } else if (action.type === 'navigate') {
      navigate(action.route);
    }
  }, [update, reset, navigate]);

  // Submit query function
  const handleSend = useCallback((textToSend) => {
    const queryText = textToSend || query;
    if (!queryText.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    // Stop speaking user speech if any
    stopSpeaking();

    // Process after short timeout for typing realism
    setTimeout(() => {
      const context = getPageContext();
      const response = queryAssistant(queryText, context);
      
      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date(),
        suggestions: response.suggestions,
        action: response.action
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);

      // Speak response aloud if TTS is active
      if (ttsEnabled) {
        speak(response.text);
      }

      // Execute settings updates/routing automatically if present
      if (response.action) {
        executeAssistantAction(response.action);
      }
    }, 750);
  }, [query, getPageContext, ttsEnabled, speak, stopSpeaking, executeAssistantAction]);

  // Voice Typing logic
  const handleVoiceInput = useCallback(() => {
    if (chatListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setChatListening(true);
      stopSpeaking();
    };

    rec.onresult = (e) => {
      const resultText = e.results[0][0].transcript;
      if (resultText) {
        handleSend(resultText);
      }
    };

    rec.onerror = () => {
      setChatListening(false);
    };

    rec.onend = () => {
      setChatListening(false);
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      setChatListening(false);
    }
  }, [chatListening, handleSend, stopSpeaking]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return (
    <>
      {/* Floating Button Trigger */}
      <button
        ref={triggerRef}
        id="a11y-assistant-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Open AI accessibility assistant (Alt+A)"
        title="AI Accessibility Assistant"
        className={`fixed bottom-6 left-20 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border ${
          open
            ? 'bg-[var(--clr-primary)] text-white border-[var(--clr-primary)] shadow-sm'
            : 'bg-[var(--clr-bg-card)] border-[var(--clr-border)] text-[var(--clr-text-muted)] hover:text-[var(--clr-primary)] hover:border-[var(--clr-primary)]'
        }`}
      >
        {open ? <X size={18} aria-hidden="true" /> : <Bot size={18} aria-hidden="true" />}
      </button>

      {/* Drawer */}
      {open && (
        <aside
          ref={panelRef}
          id="a11y-assistant-drawer"
          role="dialog"
          aria-modal="false"
          aria-label="AI accessibility assistant panel"
          className="fixed top-0 left-0 h-screen w-[380px] z-50 bg-[var(--clr-bg-card)] border-r border-[var(--clr-border)] shadow-lg flex flex-col animate-slide-in-left overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--clr-border)] bg-[var(--clr-bg-elevated)] flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--clr-primary)] flex items-center justify-center">
                <Bot size={16} className="text-white" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--clr-text)]">Accessibility Assistant</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--clr-success)] animate-pulse" aria-hidden="true" />
                  <span className="text-[10px] font-medium text-[var(--clr-text-muted)]">AI Support Online</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { setTtsEnabled(t => !t); if (ttsEnabled) stopSpeaking(); }}
                aria-pressed={ttsEnabled}
                aria-label={`Assistant voice feedback: ${ttsEnabled ? 'on — click to mute' : 'off — click to enable'}`}
                title="Toggle Assistant voice feedback"
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                  ttsEnabled
                    ? 'bg-[var(--clr-success)]/10 border-[var(--clr-success)]/30 text-[var(--clr-success)] hover:bg-[var(--clr-success)]/20'
                    : 'bg-[var(--clr-bg-elevated)] border-[var(--clr-border)] text-[var(--clr-text-faint)]'
                }`}
              >
                {ttsEnabled ? <Volume2 size={13} aria-hidden="true" /> : <VolumeX size={13} aria-hidden="true" />}
              </button>
              
              <button
                onClick={() => { setOpen(false); triggerRef.current?.focus(); }}
                aria-label="Close assistant panel"
                className="w-7 h-7 rounded-full bg-[var(--clr-bg-elevated)] text-[var(--clr-text-muted)] hover:text-[var(--clr-text)] flex items-center justify-center transition-colors border border-transparent hover:border-[var(--clr-border)]"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Conversation History Area */}
          <div 
            className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scroll-smooth" 
            role="log" 
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map(msg => (
              <div 
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto items-end animate-fade-in' : 'mr-auto items-start animate-fade-in'
                }`}
              >
                {/* Message Bubble */}
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed border transition-all ${
                    msg.sender === 'user'
                      ? 'bg-[var(--clr-primary)]/10 border-[var(--clr-primary)]/20 text-[var(--clr-text)] rounded-tr-none'
                      : 'bg-[var(--clr-bg-elevated)] border-[var(--clr-border)] text-[var(--clr-text)] rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  
                  {/* Action Link triggers */}
                  {msg.action && (
                    <div className="mt-2.5 pt-2 border-t border-[var(--clr-border)] flex flex-wrap gap-2">
                      {msg.action.type === 'navigate' && (
                        <button
                          onClick={() => executeAssistantAction(msg.action)}
                          className="px-2.5 py-1 rounded bg-[var(--clr-primary)]/10 text-[var(--clr-primary)] hover:bg-[var(--clr-primary)]/20 transition-all font-semibold flex items-center gap-1"
                        >
                          <Sparkles size={10} aria-hidden="true" />
                          Go to Page
                        </button>
                      )}
                      {msg.action.type === 'setting' && (
                        <button
                          onClick={() => executeAssistantAction(msg.action)}
                          className="px-2.5 py-1 rounded bg-[var(--clr-success)]/10 text-[var(--clr-success)] hover:bg-[var(--clr-success)]/20 transition-all font-semibold flex items-center gap-1"
                        >
                          <Sparkles size={10} aria-hidden="true" />
                          Apply Setting
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Suggestions / Prompt Chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 max-w-full">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(sug)}
                        className="text-[10px] px-2.5 py-1.5 rounded-full bg-[var(--clr-bg-elevated)] hover:bg-[var(--clr-border)] text-[var(--clr-text-muted)] hover:text-[var(--clr-primary)] border border-[var(--clr-border)] hover:border-[var(--clr-border-hover)] transition-all font-medium text-left"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-start max-w-[80%] mr-auto animate-pulse">
                <div className="bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] p-3 rounded-xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[var(--clr-text-faint)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[var(--clr-text-faint)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[var(--clr-text-faint)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Compliance Settings Box */}
          <div className="px-5 py-2.5 border-t border-[var(--clr-border)] bg-[var(--clr-bg-elevated)]/20 flex-shrink-0 flex items-center justify-between">
            <span className="text-[10px] text-[var(--clr-text-faint)] font-medium">Quick A11y Actions</span>
            <button
              onClick={reset}
              className="text-[9px] font-semibold text-[var(--clr-text-faint)] hover:text-[var(--clr-error)] flex items-center gap-1 transition-all"
            >
              <RotateCcw size={10} aria-hidden="true" />
              Reset defaults
            </button>
          </div>

          {/* Assistant input field */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-3 border-t border-[var(--clr-border)] bg-[var(--clr-bg-card)] flex-shrink-0 flex items-center gap-2"
          >
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask accessibility assistant..."
                className="w-full text-xs py-2.5 pl-3.5 pr-10 rounded-xl bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] focus:outline-none focus:border-[var(--clr-primary)] text-[var(--clr-text)] placeholder-[var(--clr-text-faint)]"
              />
              
              <button
                ref={chatMicRef}
                type="button"
                onClick={handleVoiceInput}
                aria-label={chatListening ? "Stop voice input" : "Input question using voice"}
                aria-pressed={chatListening}
                className={`absolute right-2.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  chatListening
                    ? 'bg-[var(--clr-error)] text-white shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse'
                    : 'text-[var(--clr-text-faint)] hover:text-[var(--clr-primary)]'
                }`}
              >
                {chatListening ? <MicOff size={13} aria-hidden="true" /> : <Mic size={13} aria-hidden="true" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={!query.trim()}
              aria-label="Send message to assistant"
              className="w-9 h-9 rounded-xl bg-[var(--clr-primary)] text-white hover:bg-[var(--clr-primary-dim)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-sm transition-all flex-shrink-0"
            >
              <Send size={13} aria-hidden="true" />
            </button>
          </form>
          
          <div className="px-5 py-2.5 border-t border-[var(--clr-border)] bg-[var(--clr-bg-elevated)]/40 flex items-center justify-between flex-shrink-0">
            <span className="text-[9px] text-[var(--clr-text-faint)]">
              Press <kbd className="px-1 py-0.5 rounded bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] font-mono">Alt+A</kbd> to toggle panel
            </span>
            <span className="text-[9px] px-1.5 py-0.5 bg-[var(--clr-success)]/10 text-[var(--clr-success)] border border-[var(--clr-success)]/20 font-bold rounded-full uppercase tracking-wider">
              A11y Agent
            </span>
          </div>
        </aside>
      )}
    </>
  );
}
