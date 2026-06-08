import { useState, useEffect, useRef, useMemo } from 'react';
import { COMMANDS } from '../contexts/VoiceContext';
import { getFeaturedWebsites } from '../utils/websiteDatabase';
import { Search, Command, Globe, Mic, ArrowRight, X, Keyboard } from 'lucide-react';

/**
 * CommandPalette — Ctrl+K global command search overlay.
 * Lets users type to search all voice commands AND open websites.
 * Runs the selected action through VoiceContext.processCommand,
 * keeping parity with actual voice commands.
 *
 * Architecture note: No separate command registry — it re-uses COMMANDS and
 * websiteDatabase, so voice and keyboard paths always stay in sync.
 */

const CATEGORY_ORDER = ['Navigation', 'Scroll', 'Universal', 'Browser', 'Utility'];
const CAT_ICONS = {
  Navigation: '🧭',
  Scroll:     '↕️',
  Universal:  '🖱️',
  Browser:    '🌐',
  Utility:    '⚡',
};

function buildItems() {
  const items = [];

  // Voice commands
  for (const cmd of COMMANDS) {
    // Use first non-example phrase as the runnable phrase
    const runPhrase = (() => {
      const p = cmd.phrases[0];
      if (p.includes('[button name]')) return 'click services';
      if (p.includes('[text]'))        return 'type hello';
      if (p.includes('[query]'))       return 'search features';
      if (p.includes('[any website]')) return 'open youtube';
      return p;
    })();

    items.push({
      id:       cmd.label,
      icon:     cmd.icon,
      label:    cmd.label,
      subtitle: cmd.phrases.slice(0, 3).join(' · '),
      category: cmd.category,
      kind:     'command',
      run:      runPhrase,
    });
  }

  // Featured websites
  for (const site of getFeaturedWebsites()) {
    items.push({
      id:       `site-${site.label}`,
      icon:     site.icon,
      label:    site.label,
      subtitle: site.url.replace('https://', ''),
      category: 'Websites',
      kind:     'website',
      run:      `open ${site.names[0]}`,
    });
  }

  return items;
}

const ALL_ITEMS = buildItems();

export default function CommandPalette({ processCommand }) {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef  = useRef(null);
  const listRef   = useRef(null);

  // Global Ctrl+K / Cmd+K toggle
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
        setQuery('');
        setSelected(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Also listen for the custom event from voice "open palette" command
  useEffect(() => {
    const handler = () => { setOpen(true); setQuery(''); setSelected(0); };
    window.addEventListener('voicenav:palette', handler);
    return () => window.removeEventListener('voicenav:palette', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_ITEMS;
    const q = query.toLowerCase();
    return ALL_ITEMS.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }, [query]);

  // Group by category
  const grouped = useMemo(() => {
    const map = {};
    for (const item of filtered) {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    }
    // Sort by category order
    const result = [];
    const allCats = [...CATEGORY_ORDER, 'Websites', ...Object.keys(map).filter(c => !CATEGORY_ORDER.includes(c) && c !== 'Websites')];
    for (const cat of allCats) {
      if (map[cat]?.length) result.push({ cat, items: map[cat] });
    }
    return result;
  }, [filtered]);

  // Flat index for keyboard nav
  const flatItems = useMemo(() => filtered, [filtered]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runItem(flatItems[selected]);
    }
  };

  const runItem = (item) => {
    if (!item) return;
    setOpen(false);
    setQuery('');
    setTimeout(() => processCommand?.(item.run), 100);
  };

  // Keep selected item in view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selected}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  if (!open) {
    // Show a hint badge
    return (
      <button
        onClick={() => { setOpen(true); setQuery(''); setSelected(0); }}
        aria-label="Open command palette (Ctrl+K)"
        title="Command Palette (Ctrl+K)"
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--clr-bg-card)] border border-[var(--clr-border)] text-[var(--clr-text-faint)] hover:text-[var(--clr-primary)] hover:border-[var(--clr-primary)]/40 transition-all duration-200 shadow-lg text-xs font-medium max-sm:hidden"
      >
        <Command size={12} aria-hidden="true" />
        <span>Command Palette</span>
        <kbd className="ml-1 px-1.5 py-0.5 rounded bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] font-mono text-[9px] text-[var(--clr-text-faint)]">
          Ctrl+K
        </kbd>
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[70] flex items-start justify-center pt-[10vh] px-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Palette */}
      <div className="relative w-full max-w-xl bg-[var(--clr-bg-card)] border border-[var(--clr-border)] rounded-2xl shadow-2xl overflow-hidden animate-fade-in">

        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--clr-border)] bg-gradient-to-r from-sky-500/5 to-violet-500/5">
          <Search size={16} className="text-[var(--clr-text-faint)] flex-shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, pages, or websites…"
            aria-label="Search voice commands"
            aria-autocomplete="list"
            aria-controls="palette-listbox"
            aria-activedescendant={flatItems[selected] ? `palette-item-${selected}` : undefined}
            className="flex-1 bg-transparent text-sm text-[var(--clr-text)] placeholder:text-[var(--clr-text-faint)] outline-none"
          />
          <button
            onClick={() => setOpen(false)}
            aria-label="Close command palette"
            className="w-6 h-6 rounded-lg bg-[var(--clr-bg-elevated)] text-[var(--clr-text-faint)] hover:text-[var(--clr-text)] flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          id="palette-listbox"
          role="listbox"
          aria-label="Command results"
          className="overflow-y-auto max-h-[55vh] py-2"
        >
          {grouped.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-[var(--clr-text-faint)]">No commands found for "{query}"</p>
              <p className="text-xs text-[var(--clr-text-faint)] mt-1">Try "scroll", "home", "youtube", "click"…</p>
            </div>
          ) : (
            grouped.map(({ cat, items }) => (
              <div key={cat}>
                {/* Category heading */}
                <div className="flex items-center gap-2 px-4 py-1.5 sticky top-0 bg-[var(--clr-bg-card)] z-10">
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--clr-text-faint)]">
                    {CAT_ICONS[cat] || '📁'} {cat}
                  </span>
                  <div className="flex-1 h-px bg-[var(--clr-border)]" aria-hidden="true" />
                </div>

                {/* Items */}
                {items.map((item) => {
                  const globalIdx = flatItems.indexOf(item);
                  const isActive  = globalIdx === selected;
                  return (
                    <button
                      key={item.id}
                      id={`palette-item-${globalIdx}`}
                      data-idx={globalIdx}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => runItem(item)}
                      onMouseEnter={() => setSelected(globalIdx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isActive
                          ? 'bg-[var(--clr-primary)]/10 text-[var(--clr-primary)]'
                          : 'text-[var(--clr-text-muted)] hover:bg-[var(--clr-bg-elevated)]'
                      }`}
                    >
                      <span className="text-base w-6 flex-shrink-0 text-center" aria-hidden="true">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isActive ? 'text-[var(--clr-primary)]' : 'text-[var(--clr-text)]'}`}>
                          {item.label}
                        </p>
                        <p className="text-[10px] text-[var(--clr-text-faint)] truncate font-mono">{item.subtitle}</p>
                      </div>
                      {item.kind === 'website' && (
                        <Globe size={11} className="flex-shrink-0 text-[var(--clr-text-faint)]" aria-hidden="true" />
                      )}
                      {item.kind === 'command' && (
                        <Mic size={11} className="flex-shrink-0 text-[var(--clr-text-faint)]" aria-hidden="true" />
                      )}
                      {isActive && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--clr-primary)]/20 text-[var(--clr-primary)] font-bold flex-shrink-0">
                          ↵ Run
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="px-4 py-2.5 border-t border-[var(--clr-border)] bg-[var(--clr-bg-elevated)]/40 flex items-center gap-4 text-[9px] text-[var(--clr-text-faint)]">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] font-mono">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] font-mono">↵</kbd>
            Execute
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] font-mono">Esc</kbd>
            Close
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Keyboard size={9} aria-hidden="true" />
            {flatItems.length} commands
          </span>
        </div>
      </div>
    </div>
  );
}
