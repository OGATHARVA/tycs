/**
 * TYCS Website Database — Configurable registry of popular websites.
 * Maps spoken names / aliases to external URLs.
 * Extensible: just add more entries to WEBSITES.
 *
 * Architecture note: This module is designed to be loadable by a future
 * browser extension content script with zero changes.
 */

const WEBSITES = [
  // ── Search & AI ─────────────────────────────────────────────────
  { category: 'Search & AI',  names: ['google', 'search engine', 'google search'],  url: 'https://www.google.com',       label: 'Google',       icon: '🔍' },
  { category: 'Search & AI',  names: ['bing', 'microsoft search'],                   url: 'https://www.bing.com',         label: 'Bing',         icon: '🔍' },
  { category: 'Search & AI',  names: ['duckduckgo', 'duck duck go', 'ddg'],           url: 'https://duckduckgo.com',       label: 'DuckDuckGo',   icon: '🦆' },
  { category: 'Search & AI',  names: ['chatgpt', 'openai', 'chat gpt', 'gpt'],        url: 'https://chatgpt.com',          label: 'ChatGPT',      icon: '🤖' },
  { category: 'Search & AI',  names: ['gemini', 'google gemini', 'bard'],             url: 'https://gemini.google.com',   label: 'Gemini',       icon: '✨' },
  { category: 'Search & AI',  names: ['perplexity', 'perplexity ai'],                 url: 'https://www.perplexity.ai',   label: 'Perplexity',   icon: '🔮' },
  { category: 'Search & AI',  names: ['claude', 'anthropic'],                          url: 'https://claude.ai',           label: 'Claude',       icon: '🧠' },

  // ── Social Media ─────────────────────────────────────────────────
  { category: 'Social Media', names: ['youtube', 'yt', 'you tube'],                   url: 'https://www.youtube.com',     label: 'YouTube',      icon: '📺' },
  { category: 'Social Media', names: ['twitter', 'x', 'twitter x', 'x dot com'],      url: 'https://x.com',               label: 'X (Twitter)',  icon: '🐦' },
  { category: 'Social Media', names: ['facebook', 'fb'],                               url: 'https://www.facebook.com',    label: 'Facebook',     icon: '👤' },
  { category: 'Social Media', names: ['instagram', 'insta', 'ig'],                     url: 'https://www.instagram.com',   label: 'Instagram',    icon: '📸' },
  { category: 'Social Media', names: ['linkedin', 'linked in'],                        url: 'https://www.linkedin.com',    label: 'LinkedIn',     icon: '💼' },
  { category: 'Social Media', names: ['reddit', 'subreddit'],                          url: 'https://www.reddit.com',      label: 'Reddit',       icon: '🤓' },
  { category: 'Social Media', names: ['tiktok', 'tik tok'],                            url: 'https://www.tiktok.com',      label: 'TikTok',       icon: '🎵' },
  { category: 'Social Media', names: ['snapchat', 'snap chat'],                        url: 'https://www.snapchat.com',    label: 'Snapchat',     icon: '👻' },
  { category: 'Social Media', names: ['pinterest'],                                     url: 'https://www.pinterest.com',   label: 'Pinterest',    icon: '📌' },
  { category: 'Social Media', names: ['discord'],                                       url: 'https://discord.com',         label: 'Discord',      icon: '🎮' },
  { category: 'Social Media', names: ['twitch'],                                        url: 'https://www.twitch.tv',       label: 'Twitch',       icon: '🎮' },

  // ── Productivity & Email ──────────────────────────────────────────
  { category: 'Productivity', names: ['gmail', 'google mail', 'my email'],             url: 'https://mail.google.com',     label: 'Gmail',        icon: '📧' },
  { category: 'Productivity', names: ['outlook', 'hotmail', 'microsoft mail'],         url: 'https://outlook.live.com',    label: 'Outlook',      icon: '📧' },
  { category: 'Productivity', names: ['google drive', 'gdrive', 'drive'],              url: 'https://drive.google.com',    label: 'Google Drive', icon: '☁️' },
  { category: 'Productivity', names: ['google docs', 'docs'],                          url: 'https://docs.google.com',     label: 'Google Docs',  icon: '📝' },
  { category: 'Productivity', names: ['google sheets', 'sheets'],                      url: 'https://sheets.google.com',   label: 'Google Sheets',icon: '📊' },
  { category: 'Productivity', names: ['google slides', 'slides'],                      url: 'https://slides.google.com',   label: 'Google Slides',icon: '📑' },
  { category: 'Productivity', names: ['notion'],                                        url: 'https://www.notion.so',       label: 'Notion',       icon: '📓' },
  { category: 'Productivity', names: ['trello'],                                        url: 'https://trello.com',          label: 'Trello',       icon: '📋' },
  { category: 'Productivity', names: ['slack'],                                         url: 'https://slack.com',           label: 'Slack',        icon: '💬' },
  { category: 'Productivity', names: ['zoom'],                                          url: 'https://zoom.us',             label: 'Zoom',         icon: '📹' },
  { category: 'Productivity', names: ['google meet', 'meet'],                          url: 'https://meet.google.com',     label: 'Google Meet',  icon: '📹' },
  { category: 'Productivity', names: ['microsoft teams', 'teams'],                     url: 'https://teams.microsoft.com', label: 'MS Teams',     icon: '📹' },

  // ── Shopping & Finance ────────────────────────────────────────────
  { category: 'Shopping',     names: ['amazon', 'shopping'],                           url: 'https://www.amazon.com',      label: 'Amazon',       icon: '🛒' },
  { category: 'Shopping',     names: ['flipkart'],                                      url: 'https://www.flipkart.com',    label: 'Flipkart',     icon: '🛒' },
  { category: 'Shopping',     names: ['ebay', 'e bay'],                                url: 'https://www.ebay.com',        label: 'eBay',         icon: '🛒' },
  { category: 'Shopping',     names: ['netflix'],                                       url: 'https://www.netflix.com',     label: 'Netflix',      icon: '🎬' },
  { category: 'Shopping',     names: ['spotify'],                                       url: 'https://open.spotify.com',    label: 'Spotify',      icon: '🎵' },
  { category: 'Shopping',     names: ['paypal'],                                        url: 'https://www.paypal.com',      label: 'PayPal',       icon: '💳' },

  // ── Technology & Dev ─────────────────────────────────────────────
  { category: 'Technology',   names: ['github', 'git hub'],                            url: 'https://github.com',          label: 'GitHub',       icon: '💻' },
  { category: 'Technology',   names: ['stack overflow', 'stackoverflow'],               url: 'https://stackoverflow.com',   label: 'Stack Overflow',icon: '💻' },
  { category: 'Technology',   names: ['codepen', 'code pen'],                          url: 'https://codepen.io',          label: 'CodePen',      icon: '✏️' },
  { category: 'Technology',   names: ['vercel'],                                        url: 'https://vercel.com',          label: 'Vercel',       icon: '▲' },
  { category: 'Technology',   names: ['netlify'],                                       url: 'https://netlify.com',         label: 'Netlify',      icon: '🌐' },
  { category: 'Technology',   names: ['npm', 'npm js', 'node package manager'],        url: 'https://www.npmjs.com',       label: 'npm',          icon: '📦' },

  // ── Maps & Travel ─────────────────────────────────────────────────
  { category: 'Maps',         names: ['google maps', 'maps', 'google map'],            url: 'https://maps.google.com',     label: 'Google Maps',  icon: '🗺️' },
  { category: 'Maps',         names: ['wikipedia', 'wiki'],                             url: 'https://www.wikipedia.org',   label: 'Wikipedia',    icon: '📚' },
  { category: 'Maps',         names: ['weather', 'weather forecast'],                  url: 'https://weather.com',         label: 'Weather',      icon: '⛅' },

  // ── News ─────────────────────────────────────────────────────────
  { category: 'News',         names: ['bbc', 'bbc news'],                              url: 'https://www.bbc.com/news',    label: 'BBC News',     icon: '📰' },
  { category: 'News',         names: ['cnn'],                                           url: 'https://www.cnn.com',         label: 'CNN',          icon: '📰' },
  { category: 'News',         names: ['the guardian', 'guardian'],                     url: 'https://www.theguardian.com', label: 'The Guardian', icon: '📰' },
];

/**
 * Helper to calculate Levenshtein distance between two strings.
 */
function getLevenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Helper to calculate normalized similarity [0, 1] between two strings.
 */
function getSimilarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  return (longer.length - getLevenshteinDistance(longer, shorter)) / longer.length;
}

/**
 * Normalize a string for phonetic/fuzzy matching.
 * Converts to lowercase and removes all non-alphanumeric characters.
 */
function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Find matched website from the database.
 * Supports exact name matching, alias checking, substring checking, and Levenshtein fuzzy matching.
 * @param {string} spokenName - The spoken/typed query
 * @returns {{ site: { url: string, label: string, icon: string, category: string }, confidence: number } | null}
 */
export function findWebsite(spokenName) {
  if (!spokenName) return null;
  
  const cleanInput = spokenName.toLowerCase().trim();
  const normalizedInput = normalizeString(cleanInput);

  if (!normalizedInput) return null;

  // Pass 1: Exact match on normalized strings
  for (const site of WEBSITES) {
    if (site.names.some(n => normalizeString(n) === normalizedInput)) {
      return { site, confidence: 1.0 };
    }
  }

  // Pass 2: Substring matching on normalized strings
  let bestSubstringSite = null;
  let highestSubLength = 0;
  for (const site of WEBSITES) {
    for (const name of site.names) {
      const normalizedName = normalizeString(name);
      if (
        (normalizedInput.includes(normalizedName) || normalizedName.includes(normalizedInput)) &&
        normalizedName.length > highestSubLength
      ) {
        highestSubLength = normalizedName.length;
        bestSubstringSite = site;
      }
    }
  }
  if (bestSubstringSite) {
    return { site: bestSubstringSite, confidence: 0.85 };
  }

  // Pass 3: Fuzzy Levenshtein similarity
  let bestFuzzySite = null;
  let maxSimilarity = 0;

  for (const site of WEBSITES) {
    for (const name of site.names) {
      const normalizedName = normalizeString(name);
      const similarity = getSimilarity(normalizedInput, normalizedName);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestFuzzySite = site;
      }
    }
  }

  if (maxSimilarity >= 0.8) {
    return { site: bestFuzzySite, confidence: 0.8 };
  } else if (maxSimilarity >= 0.55) {
    return { site: bestFuzzySite, confidence: 0.6 };
  }

  return null;
}

/**
 * Return all websites, optionally filtered by category.
 * @param {string} [category]
 * @returns {Array}
 */
export function getWebsites(category) {
  if (category) return WEBSITES.filter(w => w.category === category);
  return WEBSITES;
}

/**
 * Return the list of unique categories.
 * @returns {string[]}
 */
export function getCategories() {
  return [...new Set(WEBSITES.map(w => w.category))];
}

/**
 * Return a curated list of "featured" quick-access sites for the UI.
 * @returns {Array}
 */
export function getFeaturedWebsites() {
  const featured = [
    'YouTube', 'Gmail', 'ChatGPT', 'Gemini', 'Google Maps',
    'GitHub', 'Wikipedia', 'Google Drive', 'Netflix', 'Spotify',
    'Reddit', 'LinkedIn',
  ];
  return WEBSITES.filter(w => featured.includes(w.label));
}
