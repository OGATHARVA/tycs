import { useState, useMemo } from 'react';
import { getFeaturedWebsites, getWebsites } from '../utils/websiteDatabase';
import { Globe, ExternalLink, Search, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * BrowserQuickAccess — A polished panel showing quick-access website shortcuts.
 * Users can click any site card to open it in a new tab, or search for more.
 * Architecture note: mirrors the site database that domExecutor + VoiceContext use,
 * ensuring UI and voice commands stay in sync.
 */
export default function BrowserQuickAccess({ onSiteOpen }) {
  const [query, setQuery]       = useState('');
  const [expanded, setExpanded] = useState(false);
  const [recentSites, setRecentSites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tycs:recentSites') || '[]'); }
    catch { return []; }
  });

  const featured = useMemo(() => getFeaturedWebsites(), []);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return getWebsites().filter(s =>
      s.names.some(n => n.includes(q)) || s.label.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const openSite = (site) => {
    window.open(site.url, '_blank', 'noopener,noreferrer');
    onSiteOpen?.(site);

    // Track recents (max 4, no duplicates)
    setRecentSites(prev => {
      const next = [site, ...prev.filter(s => s.url !== site.url)].slice(0, 4);
      try { localStorage.setItem('tycs:recentSites', JSON.stringify(next)); } catch { /* ignore storage errors */ }
      return next;
    });
  };

  const displaySites = query.trim() ? searchResults : (expanded ? getWebsites().slice(0, 24) : featured);

  return (
    <section aria-labelledby="browser-heading" className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3
          id="browser-heading"
          className="text-[10px] font-bold uppercase tracking-widest text-[var(--clr-text-faint)] flex items-center gap-1.5"
        >
          <Globe size={10} aria-hidden="true" />
          Browser Shortcuts
        </h3>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-[10px] text-[var(--clr-text-faint)] hover:text-[var(--clr-primary)] transition-colors flex items-center gap-0.5"
          aria-expanded={expanded}
          aria-label={expanded ? 'Show fewer websites' : 'Show more websites'}
        >
          {expanded ? <ChevronUp size={10} aria-hidden="true" /> : <ChevronDown size={10} aria-hidden="true" />}
          {expanded ? 'Less' : 'More'}
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search
          size={11}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--clr-text-faint)] pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search websites…"
          aria-label="Search websites to open"
          className="w-full pl-7 pr-2 py-1.5 text-xs bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] rounded-lg text-[var(--clr-text)] placeholder:text-[var(--clr-text-faint)] focus:outline-none focus:border-[var(--clr-primary)] transition-colors"
        />
      </div>

      {/* Recently opened */}
      {recentSites.length > 0 && !query.trim() && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--clr-text-faint)] mb-1.5">Recent</p>
          <div className="flex gap-1.5 flex-wrap">
            {recentSites.map(site => (
              <button
                key={site.url}
                onClick={() => openSite(site)}
                title={`Open ${site.label}`}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-[var(--clr-primary)]/10 border border-[var(--clr-primary)]/20 text-[var(--clr-primary)] hover:bg-[var(--clr-primary)]/20 transition-all font-medium"
              >
                <span aria-hidden="true">{site.icon}</span>
                {site.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Site grid */}
      {displaySites.length > 0 ? (
        <div className="grid grid-cols-3 gap-1.5">
          {displaySites.map(site => (
            <button
              key={site.url}
              onClick={() => openSite(site)}
              title={`Open ${site.label} — ${site.url}`}
              aria-label={`Open ${site.label} in new tab`}
              className="flex flex-col items-center gap-1 px-1.5 py-2 rounded-xl bg-[var(--clr-bg-elevated)] border border-[var(--clr-border)] hover:bg-[var(--clr-border)] hover:border-[var(--clr-primary)]/40 hover:scale-105 transition-all duration-200 group outline-none focus-visible:ring-2 focus-visible:ring-[var(--clr-primary)]"
            >
              <span className="text-lg leading-none group-hover:scale-110 transition-transform" aria-hidden="true">
                {site.icon}
              </span>
              <span className="text-[9px] text-[var(--clr-text-muted)] font-medium truncate w-full text-center leading-tight">
                {site.label}
              </span>
            </button>
          ))}
        </div>
      ) : query.trim() ? (
        <div className="text-center py-4">
          <p className="text-[10px] text-[var(--clr-text-faint)] mb-1">No match found</p>
          <button
            onClick={() => {
              window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
              onSiteOpen?.({ label: `Google: "${query}"`, icon: '🔍', url: '' });
            }}
            className="text-[10px] px-2.5 py-1 rounded-lg bg-[var(--clr-primary)]/10 text-[var(--clr-primary)] hover:bg-[var(--clr-primary)]/20 transition-colors font-medium flex items-center gap-1 mx-auto"
          >
            <ExternalLink size={9} aria-hidden="true" />
            Search Google for "{query}"
          </button>
        </div>
      ) : null}

      {/* Voice tip */}
      <p className="text-[9px] text-[var(--clr-text-faint)] text-center leading-tight pt-1 border-t border-[var(--clr-border)]">
        🎤 Say <span className="text-[var(--clr-primary)] font-mono">"Open YouTube"</span> or any site name
      </p>
    </section>
  );
}
