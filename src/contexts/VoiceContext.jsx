import { createContext, useContext, useState, useEffect, useRef, useCallback, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility, LANGUAGE_OPTIONS } from './AccessibilityContext';
import '../utils/domExecutor';
import { findWebsite, getFeaturedWebsites } from '../utils/websiteDatabase';

/* ═══════════════════════════════════════════════════════════════════
   LANGUAGE MAPPING
   ═══════════════════════════════════════════════════════════════════ */

const LANG_MAP = Object.fromEntries(LANGUAGE_OPTIONS.map(l => [l.code, l.bcp47]));
// { en: 'en-US', hi: 'hi-IN', mr: 'mr-IN' }

/* ═══════════════════════════════════════════════════════════════════
   MULTILINGUAL TTS CONFIRMATIONS
   ═══════════════════════════════════════════════════════════════════ */

const CONFIRM = {
  en: {
    navigate:    (lbl) => `Navigating to ${lbl}`,
    goBack:      'Going back to the previous page',
    scrollDown:  'Scrolling down',
    scrollUp:    'Scrolling up',
    scrollTop:   'Going to the top of the page',
    scrollBottom:'Going to the bottom of the page',
    help:        'Here are the available voice commands.',
    stop:        'Stopped listening.',
    repeat:      'No previous command.',
    cleared:     'History cleared.',
    readPage:    'Reading page content aloud.',
    stopReading: 'Stopped reading.',
    sorry:       "Sorry, I didn't understand that command.",
  },
  hi: {
    navigate:    (lbl) => `${lbl} पर जा रहे हैं`,
    goBack:      'पिछले पृष्ठ पर वापस जा रहे हैं',
    scrollDown:  'नीचे स्क्रॉल हो रहा है',
    scrollUp:    'ऊपर स्क्रॉल हो रहा है',
    scrollTop:   'पृष्ठ के शीर्ष पर जा रहे हैं',
    scrollBottom:'पृष्ठ के अंत में जा रहे हैं',
    help:        'उपलब्ध वॉइस कमांड यहाँ हैं।',
    stop:        'सुनना बंद हो गया।',
    repeat:      'कोई पिछला आदेश नहीं।',
    cleared:     'इतिहास साफ हो गया।',
    readPage:    'पृष्ठ सामग्री ज़ोर से पढ़ी जा रही है।',
    stopReading: 'पढ़ना बंद हो गया।',
    sorry:       'क्षमा करें, मैं यह आदेश नहीं समझा।',
  },
  mr: {
    navigate:    (lbl) => `${lbl} वर जात आहोत`,
    goBack:      'मागील पृष्ठावर परत जात आहोत',
    scrollDown:  'खाली स्क्रोल होत आहे',
    scrollUp:    'वर स्क्रोल होत आहे',
    scrollTop:   'पृष्ठाच्या शीर्षावर जात आहोत',
    scrollBottom:'पृष्ठाच्या तळाशी जात आहोत',
    help:        'उपलब्ध व्हॉइस कमांड येथे आहेत।',
    stop:        'ऐकणे थांबले।',
    repeat:      'कोणताही मागील आदेश नाही।',
    cleared:     'इतिहास साफ झाला।',
    readPage:    'पृष्ठ सामग्री मोठ्याने वाचली जात आहे।',
    stopReading: 'वाचणे थांबले।',
    sorry:       'माफ करा, हा आदेश समजला नाही।',
  },
};

function getConfirm(lang, key, param) {
  const dict = CONFIRM[lang] || CONFIRM.en;
  const val = dict[key] ?? CONFIRM.en[key];
  return typeof val === 'function' ? val(param) : val;
}

const SPEAK_MAP = {
  en: {
    opening: (name) => `Opening ${name}`,
    didYouMean: (name) => `Did you mean ${name}?`,
    searchingGoogle: (query) => `Searching Google for ${query}`,
    cancelled: 'Cancelled',
  },
  hi: {
    opening: (name) => `${name} खोल रहे हैं`,
    didYouMean: (name) => `क्या आपका मतलब ${name} से है?`,
    searchingGoogle: (query) => `${query} के लिए गूगल खोज कर रहे हैं`,
    cancelled: 'निरस्त किया गया',
  },
  mr: {
    opening: (name) => `${name} उघडत आहे`,
    didYouMean: (name) => `तुम्हाला ${name} म्हणायचे आहे का?`,
    searchingGoogle: (query) => `${query} साठी गुगल सर्च करत आहे`,
    cancelled: 'रद्द केले',
  }
};

function getSpokenText(lang, key, param) {
  const dict = SPEAK_MAP[lang] || SPEAK_MAP.en;
  const val = dict[key] ?? SPEAK_MAP.en[key];
  return typeof val === 'function' ? val(param) : val;
}

/* ═══════════════════════════════════════════════════════════════════
   NATURAL LANGUAGE COMMAND REGISTRY (English NLU + multilingual phrases)
   ═══════════════════════════════════════════════════════════════════ */

const INTENT_NAVIGATE = ['go', 'take', 'bring', 'open', 'show', 'visit', 'navigate', 'load', 'jump', 'head', 'switch', 'view', 'display', 'get', 'launch', 'find'];
const INTENT_SCROLL   = ['scroll', 'slide', 'move', 'push', 'shift', 'pan', 'swipe', 'glide'];
const INTENT_BACK     = ['back', 'backward', 'previous', 'return', 'undo', 'prior', 'revert'];
const INTENT_READ     = ['read', 'narrate', 'speak', 'announce', 'recite', 'dictate', 'aloud', 'out loud'];
const INTENT_STOP     = ['stop', 'pause', 'cancel', 'halt', 'silence', 'end', 'mute', 'hush', 'terminate'];
const INTENT_HELP     = ['help', 'assist', 'guide', 'tutorial', 'options', 'available', 'commands'];
const INTENT_REPEAT   = ['repeat', 'again', 'redo', 'replay'];
const INTENT_CLEAR    = ['clear', 'reset', 'delete', 'remove', 'wipe', 'erase', 'clean'];

const TARGET_MAP = [
  {
    route: '/',
    label: 'Open Home', icon: '🏠',
    words: ['home', 'main', 'start', 'front', 'landing', 'index', 'root', 'welcome', 'beginning'],
  },
  {
    route: '/about',
    label: 'Open About', icon: '👥',
    words: ['about', 'team', 'us', 'mission', 'story', 'who', 'company', 'people'],
  },
  {
    route: '/services',
    label: 'Open Services', icon: '⚙️',
    words: ['service', 'services', 'feature', 'features', 'product', 'offer', 'offerings', 'solutions'],
  },
  {
    route: '/contact',
    label: 'Open Contact', icon: '✉️',
    words: ['contact', 'reach', 'touch', 'email', 'message', 'information', 'info', 'connect', 'form', 'support'],
  },
  {
    route: '/dashboard',
    label: 'Open Dashboard', icon: '📊',
    words: ['dashboard', 'analytics', 'stats', 'statistics', 'monitor', 'metrics', 'panel', 'overview'],
  },
];

const SCROLL_DIR_MAP = {
  top:    ['top', 'beginning', 'start', 'first', 'initial', 'header'],
  bottom: ['bottom', 'end', 'last', 'final', 'footer'],
  down:   ['down', 'further', 'more', 'forward', 'lower', 'below', 'next', 'advance', 'onwards', 'onward'],
  up:     ['up', 'higher', 'above', 'raise'],
};

export const COMMANDS = [
  {
    phrases: [
      // English
      'open home', 'go home', 'take me home', 'go to home', 'home page', 'navigate home', 'homepage',
      // Hindi
      'घर जाओ', 'होम खोलो', 'मुख्य पृष्ठ', 'होम पेज', 'होम पेज जाओ', 'मुख पृष्ठ',
      // Marathi
      'घरी जा', 'होम उघडा', 'मुख्य पृष्ठ उघडा', 'होम पेज उघडा',
    ],
    action: 'navigate', target: '/',         label: 'Open Home',        icon: '🏠', category: 'Navigation',
  },
  {
    phrases: [
      'open about', 'go to about', 'about page', 'about us', 'navigate about', 'who are you',
      // Hindi
      'परिचय देखो', 'हमारे बारे में', 'अबाउट खोलो', 'अबाउट पेज',
      // Marathi
      'आमच्याबद्दल', 'परिचय उघडा', 'अबाउट उघडा',
    ],
    action: 'navigate', target: '/about',    label: 'Open About',       icon: '👥', category: 'Navigation',
  },
  {
    phrases: [
      'open services', 'go to services', 'services page', 'show services', 'navigate services', 'what do you offer',
      // Hindi
      'सेवाएं खोलो', 'सर्विस जाओ', 'हमारी सेवाएं', 'सर्विसेज पेज',
      // Marathi
      'सेवा उघडा', 'सर्व्हिसेस उघडा', 'आमच्या सेवा',
    ],
    action: 'navigate', target: '/services', label: 'Open Services',    icon: '⚙️', category: 'Navigation',
  },
  {
    phrases: [
      'open contact', 'go to contact', 'contact page', 'contact us', 'show contact', 'show contact information', 'contact information', 'reach out', 'navigate contact',
      // Hindi
      'संपर्क करो', 'संपर्क खोलो', 'कॉन्टेक्ट', 'संपर्क पेज',
      // Marathi
      'संपर्क उघडा', 'संपर्क करा', 'संपर्क पृष्ठ',
    ],
    action: 'navigate', target: '/contact',  label: 'Open Contact',     icon: '✉️', category: 'Navigation',
  },
  {
    phrases: [
      'open dashboard', 'go to dashboard', 'dashboard', 'show dashboard', 'show analytics', 'show stats', 'show metrics', 'view dashboard', 'navigate dashboard',
      // Hindi
      'डैशबोर्ड खोलो', 'आँकड़े दिखाओ', 'डैशबोर्ड पेज',
      // Marathi
      'डॅशबोर्ड उघडा', 'आकडेवारी दाखवा',
    ],
    action: 'navigate', target: '/dashboard', label: 'Open Dashboard',  icon: '📊', category: 'Navigation',
  },
  {
    phrases: [
      'go back', 'go backward', 'navigate back', 'take me back', 'previous page',
      // Hindi
      'वापस जाओ', 'पीछे जाओ', 'पिछला पृष्ठ', 'पीछे',
      // Marathi
      'मागे जा', 'मागील पृष्ठ', 'परत जा',
    ],
    action: 'goback',   target: null,        label: 'Go Back',          icon: '↩️', category: 'Navigation',
  },
  {
    phrases: [
      'scroll down', 'scroll further down', 'scroll page down', 'move down', 'page down',
      // Hindi
      'नीचे स्क्रॉल करो', 'नीचे जाओ', 'स्क्रॉल डाउन',
      // Marathi
      'खाली स्क्रोल करा', 'खाली जा', 'स्क्रोल खाली',
    ],
    action: 'scroll',   target: 'down',      label: 'Scroll Down',      icon: '⬇️', category: 'Scroll',
  },
  {
    phrases: [
      'scroll up', 'scroll page up', 'move up', 'page up',
      // Hindi
      'ऊपर स्क्रॉल करो', 'ऊपर जाओ', 'स्क्रॉल अप',
      // Marathi
      'वर स्क्रोल करा', 'वर जा', 'स्क्रोल वर',
    ],
    action: 'scroll',   target: 'up',        label: 'Scroll Up',        icon: '⬆️', category: 'Scroll',
  },
  {
    phrases: [
      'scroll to top', 'go to top', 'back to top', 'top of page', 'take me to the top',
      // Hindi
      'शीर्ष पर जाओ', 'सबसे ऊपर जाओ', 'टॉप पर जाओ', 'पृष्ठ के ऊपर',
      // Marathi
      'शीर्षावर जा', 'वरती जा', 'पृष्ठाच्या वर',
    ],
    action: 'scroll',   target: 'top',       label: 'Scroll to Top',    icon: '⤴️', category: 'Scroll',
  },
  {
    phrases: [
      'scroll to bottom', 'go to bottom', 'end of page', 'page end', 'take me to the bottom',
      // Hindi
      'नीचे अंत में जाओ', 'अंत में जाओ', 'पृष्ठ के अंत में',
      // Marathi
      'तळाशी जा', 'खाली अंत', 'पृष्ठाच्या तळाशी',
    ],
    action: 'scroll',   target: 'bottom',    label: 'Scroll to Bottom', icon: '⤵️', category: 'Scroll',
  },
  {
    phrases: [
      'help', 'show commands', 'what can i say', 'voice help', 'list commands',
      // Hindi
      'मदद', 'सहायता', 'कमांड दिखाओ', 'क्या बोल सकता हूँ',
      // Marathi
      'मदत', 'सहाय्य', 'कमांड दाखवा',
    ],
    action: 'help',     target: null,        label: 'Show Help',        icon: '❓', category: 'Utility',
  },
  {
    phrases: [
      'stop listening', 'stop', 'cancel', 'be quiet', 'silence',
      // Hindi
      'रुको', 'बंद करो', 'सुनना बंद करो', 'चुप',
      // Marathi
      'थांबा', 'बंद करा', 'ऐकणे बंद करा',
    ],
    action: 'stop',     target: null,        label: 'Stop Listening',   icon: '🛑', category: 'Utility',
  },
  {
    phrases: [
      'repeat', 'say that again', 'repeat last', 'do that again',
      // Hindi
      'दोहराओ', 'फिर से', 'दोबारा करो',
      // Marathi
      'पुन्हा करा', 'परत करा',
    ],
    action: 'repeat',   target: null,        label: 'Repeat Last',      icon: '🔁', category: 'Utility',
  },
  {
    phrases: [
      'clear', 'clear history', 'reset history', 'erase history',
      // Hindi
      'इतिहास साफ करो', 'क्लियर करो',
      // Marathi
      'इतिहास साफ करा', 'क्लियर करा',
    ],
    action: 'clear',    target: null,        label: 'Clear History',    icon: '🗑️', category: 'Utility',
  },
  {
    phrases: [
      'read page', 'read this page', 'read content', 'read aloud', 'read out', 'read the page',
      // Hindi
      'पृष्ठ पढ़ो', 'पेज पढ़ो', 'जोर से पढ़ो',
      // Marathi
      'पृष्ठ वाचा', 'जोरात वाचा', 'पेज वाचा',
    ],
    action: 'readpage', target: null,        label: 'Read Page',        icon: '📖', category: 'Utility',
  },
  {
    phrases: [
      'stop reading', 'stop speaking', 'mute', 'stop narrating',
      // Hindi
      'पढ़ना बंद करो', 'रुको पढ़ना', 'म्यूट',
      // Marathi
      'वाचणे थांबवा', 'वाचणे बंद करा',
    ],
    action: 'stopreading', target: null,     label: 'Stop Reading',     icon: '🔇', category: 'Utility',
  },
  {
    phrases: [
      'click [button name]', 'click services', 'click contact',
      // Hindi
      'क्लिक [बटन का नाम]', 'क्लिक करें लॉगिन',
      // Marathi
      'क्लिक करा [बटण नाव]',
    ],
    action: 'universal', target: 'click', label: 'Click Button / Link', icon: '🖱️', category: 'Universal',
  },
  {
    phrases: [
      'type [text]', 'enter [text]', 'write [text]', 'type john doe',
      // Hindi
      'टाइप [शब्द]', 'लिखें [शब्द]',
      // Marathi
      'टाइप करा [शब्द]',
    ],
    action: 'universal', target: 'type', label: 'Type Text / Input', icon: '⌨️', category: 'Universal',
  },
  {
    phrases: [
      'search [query]', 'find [query]', 'search products', 'find solutions',
    ],
    action: 'universal', target: 'search', label: 'Search / Find', icon: '🔍', category: 'Universal',
  },
  {
    phrases: [
      'submit form', 'submit',
    ],
    action: 'universal', target: 'submit', label: 'Submit Active Form', icon: '📤', category: 'Universal',
  },
  {
    phrases: [
      'open menu', 'show menu',
    ],
    action: 'universal', target: 'menu', label: 'Open Navigation Menu', icon: '🍔', category: 'Universal',
  },
  {
    phrases: [
      'open youtube', 'open wikipedia', 'open chatgpt', 'open amazon',
    ],
    action: 'external', target: 'site', label: 'Open External Website', icon: '📂', category: 'Browser',
  },
  {
    phrases: [
      'open [any website]', 'open cnn', 'open netflix',
    ],
    action: 'search_fallback', target: 'search', label: 'Google Search Fallback', icon: '🔍', category: 'Browser',
  },
  {
    phrases: [
      'open palette', 'command palette', 'open command palette', 'search commands', 'show palette',
    ],
    action: 'palette', target: null, label: 'Open Command Palette', icon: '⌘', category: 'Utility',
  },
];


function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function scoreSignals(tokens, signals) {
  return signals.reduce((n, w) => n + (tokens.includes(w) ? 1 : 0), 0);
}

function matchCommand(rawText) {
  const lower  = rawText.toLowerCase().replace(/['']/g, '');
  const tokens = tokenize(rawText);

  // Tier 1 — exact phrase match (works for all languages)
  for (const cmd of COMMANDS) {
    if (cmd.phrases.some(p => lower.includes(p))) {
      return { cmd, method: 'phrase', nlScore: 1.0 };
    }
  }

  // Tier 2 — English keyword/intent NLU fallback
  const navigateScore = scoreSignals(tokens, INTENT_NAVIGATE);
  if (navigateScore > 0) {
    let bestTarget = null;
    let bestScore  = 0;
    for (const t of TARGET_MAP) {
      const score = t.words.reduce((n, w) => {
        const wTokens = w.split(' ');
        const hit = wTokens.every(wt => tokens.some(tok => tok.startsWith(wt) || wt.startsWith(tok)));
        return n + (hit ? 1 : 0);
      }, 0);
      if (score > bestScore) { bestScore = score; bestTarget = t; }
    }
    if (bestTarget && bestScore > 0) {
      const cmd = COMMANDS.find(c => c.action === 'navigate' && c.target === bestTarget.route);
      if (cmd) return { cmd, method: 'keyword', nlScore: Math.min(0.7 + bestScore * 0.1 + navigateScore * 0.05, 0.97) };
    }
  }

  const backScore    = scoreSignals(tokens, INTENT_BACK);
  const hasGoForward = scoreSignals(tokens, INTENT_NAVIGATE) > 0 && scoreSignals(tokens, INTENT_BACK) === 0;
  if (backScore > 0 && !hasGoForward) {
    const cmd = COMMANDS.find(c => c.action === 'goback');
    if (cmd) return { cmd, method: 'keyword', nlScore: 0.85 };
  }

  const scrollScore    = scoreSignals(tokens, INTENT_SCROLL);
  const implicitScroll = ['further', 'more', 'lower', 'higher', 'below', 'above'].some(w => tokens.includes(w));
  if (scrollScore > 0 || implicitScroll) {
    let dir = 'down';
    if      (SCROLL_DIR_MAP.top.some(w    => tokens.includes(w))) dir = 'top';
    else if (SCROLL_DIR_MAP.bottom.some(w => tokens.includes(w))) dir = 'bottom';
    else if (SCROLL_DIR_MAP.up.some(w     => tokens.includes(w))) dir = 'up';
    else if (SCROLL_DIR_MAP.down.some(w   => tokens.includes(w))) dir = 'down';
    const cmd = COMMANDS.find(c => c.action === 'scroll' && c.target === dir);
    if (cmd) return { cmd, method: 'keyword', nlScore: 0.82 };
  }

  if (scoreSignals(tokens, INTENT_READ)   > 0) return { cmd: COMMANDS.find(c => c.action === 'readpage'),    method: 'intent', nlScore: 0.78 };
  if (scoreSignals(tokens, INTENT_HELP)   > 0) return { cmd: COMMANDS.find(c => c.action === 'help'),        method: 'intent', nlScore: 0.78 };
  if (scoreSignals(tokens, INTENT_CLEAR)  > 0 && tokens.includes('history')) return { cmd: COMMANDS.find(c => c.action === 'clear'), method: 'intent', nlScore: 0.78 };
  if (scoreSignals(tokens, INTENT_REPEAT) > 0) return { cmd: COMMANDS.find(c => c.action === 'repeat'),      method: 'intent', nlScore: 0.75 };
  if (scoreSignals(tokens, INTENT_STOP)   > 0 && tokens.includes('reading')) return { cmd: COMMANDS.find(c => c.action === 'stopreading'), method: 'intent', nlScore: 0.78 };
  if (scoreSignals(tokens, INTENT_STOP)   > 0) return { cmd: COMMANDS.find(c => c.action === 'stop'),        method: 'intent', nlScore: 0.72 };

  return null;
}

export const STATUS = {
  idle:       'idle',
  requesting: 'requesting',
  listening:  'listening',
  processing: 'processing',
  success:    'success',
  error:      'error',
};

export const STATUS_META = {
  idle:       { label: 'Click mic or press Alt+V',  color: 'var(--clr-text-faint)',   bg: 'var(--clr-bg-elevated)'   },
  requesting: { label: 'Requesting mic access…',    color: 'var(--clr-warning)',       bg: 'rgba(251,191,36,0.08)'    },
  listening:  { label: 'Listening — speak now',     color: 'var(--clr-error)',         bg: 'rgba(248,113,113,0.08)'   },
  processing: { label: 'Processing command…',       color: 'var(--clr-primary)',       bg: 'rgba(56,189,248,0.08)'    },
  success:    { label: 'Command executed!',          color: 'var(--clr-success)',       bg: 'rgba(52,211,153,0.08)'    },
  error:      { label: 'Error — try again',          color: 'var(--clr-error)',         bg: 'rgba(248,113,113,0.08)'   },
};

const MAX_HISTORY = 50;

function historyReducer(state, action) {
  switch (action.type) {
    case 'ADD':   return [action.entry, ...state].slice(0, MAX_HISTORY);
    case 'CLEAR': return [];
    default:      return state;
  }
}

const SpeechRec = (typeof window !== 'undefined')
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

const VoiceContext = createContext(null);

export function VoiceProvider({ children }) {
  const navigate = useNavigate();
  const { settings } = useAccessibility();

  // Derive the BCP-47 language code from accessibility settings
  const langCode = LANG_MAP[settings.language] || 'en-US';
  const langRef  = useRef(langCode);
  useEffect(() => { langRef.current = LANG_MAP[settings.language] || 'en-US'; }, [settings.language]);

  const [status, setStatus]           = useState(STATUS.idle);
  const [interimText, setInterimText] = useState('');
  const [finalText, setFinalText]     = useState('');
  const [confidence, setConfidence]   = useState(null);
  const [history, dispatchHistory]    = useReducer(historyReducer, []);
  const [lastCommand, setLastCommand] = useState(null);
  const [continuous, setContinuous]   = useState(false);
  const [ttsEnabled, setTtsEnabled]   = useState(true);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [toast, setToast]             = useState(null);

  const [pendingAction, _setPendingAction] = useState(null);
  const pendingActionRef = useRef(pendingAction);
  const setPendingAction = (val) => {
    pendingActionRef.current = val;
    _setPendingAction(val);
  };
  const pendingTimerRef = useRef(null);

  const [micPermission, setMicPermission] = useState('unknown'); // 'unknown' | 'granted' | 'denied' | 'skipped'
  const [showMicModal, setShowMicModal]   = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' })
        .then((permissionStatus) => {
          const updateStatus = () => {
            if (permissionStatus.state === 'granted') {
              setMicPermission('granted');
            } else if (permissionStatus.state === 'denied') {
              setMicPermission('denied');
            } else {
              setMicPermission('unknown');
            }
          };
          updateStatus();
          permissionStatus.onchange = updateStatus;
        })
        .catch(() => {
          // fallback
        });
    }
  }, []);

  const toastTimer    = useRef(null);

  const showToast = useCallback((msg, type = 'info', duration = 3500) => {
    setToast({ msg, type, id: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), duration);
  }, []);

  const requestMicAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission('granted');
      setShowMicModal(false);
      return true;
    } catch (err) {
      setMicPermission('denied');
      showToast('Microphone access denied. Please allow microphone permissions in your browser.', 'error', 5000);
      return false;
    }
  }, [showToast]);

  const recogniserRef = useRef(null);
  const statusRef     = useRef(status);
  const successTimer  = useRef(null);

  useEffect(() => { statusRef.current = status; }, [status]);

  useEffect(() => () => {
    recogniserRef.current?.abort();
    clearTimeout(toastTimer.current);
    clearTimeout(successTimer.current);
    window.speechSynthesis?.cancel();
  }, []);

  const speak = useCallback((text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate  = 1.0;
    utter.pitch = 1.0;
    utter.lang  = langRef.current;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend   = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, [ttsEnabled]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const confirmPendingAction = useCallback(() => {
    const action = pendingActionRef.current;
    if (!action) return;
    if (pendingTimerRef.current) {
      clearInterval(pendingTimerRef.current);
    }
    setPendingAction(null);
    window.open(action.site.url, '_blank', 'noopener,noreferrer');
    
    const lang = settings.language || 'en';
    const entry = {
      id:         Date.now(),
      text:       'confirm action',
      label:      `Opened ${action.site.label}`,
      icon:       action.site.icon || '📂',
      success:    true,
      timestamp:  new Date(),
      confidence: action.confidence,
      nlScore:    0.95,
      method:     'universal',
      lang,
    };
    dispatchHistory({ type: 'ADD', entry });
    setLastCommand(entry);
    showToast(`📂 Opened ${action.site.label}`, 'success');
    speak(getSpokenText(lang, 'opening', action.site.label));
    setStatus(STATUS.success);
    setTimeout(() => setStatus(STATUS.idle), 1500);
  }, [showToast, speak, settings.language]);

  const cancelPendingAction = useCallback(() => {
    if (pendingTimerRef.current) {
      clearInterval(pendingTimerRef.current);
    }
    setPendingAction(null);
    showToast('❌ Cancelled opening website', 'info');
    speak(getSpokenText(settings.language || 'en', 'cancelled'));
    setStatus(STATUS.idle);
  }, [showToast, speak, settings.language]);

  const searchGoogleFallback = useCallback(() => {
    const action = pendingActionRef.current;
    if (!action) return;
    if (pendingTimerRef.current) {
      clearInterval(pendingTimerRef.current);
    }
    setPendingAction(null);
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(action.query)}`;
    window.open(googleUrl, '_blank', 'noopener,noreferrer');
    
    const lang = settings.language || 'en';
    const entry = {
      id:         Date.now(),
      text:       'google fallback',
      label:      `Searching Google for "${action.query}"`,
      icon:       '🔍',
      success:    true,
      timestamp:  new Date(),
      confidence: 0.95,
      nlScore:    0.95,
      method:     'universal',
      lang,
    };
    dispatchHistory({ type: 'ADD', entry });
    setLastCommand(entry);
    showToast(`🔍 Searching Google for "${action.query}"`, 'success');
    speak(getSpokenText(lang, 'searchingGoogle', action.query));
    setStatus(STATUS.success);
    setTimeout(() => setStatus(STATUS.idle), 1500);
  }, [showToast, speak, settings.language]);

  const readPage = useCallback(() => {
    if (!window.speechSynthesis) {
      showToast('Speech synthesis not supported in this browser.', 'error');
      return;
    }
    const main = document.getElementById('main-content') || document.querySelector('main');
    if (!main) { showToast('No page content found to read.', 'error'); return; }
    const clone = main.cloneNode(true);
    clone.querySelectorAll('[aria-hidden="true"], script, style, .sr-only, nav').forEach(el => el.remove());
    const text = clone.textContent?.replace(/\s+/g, ' ').trim();
    if (!text) { showToast('No readable text found on this page.', 'error'); return; }
    stopSpeaking();
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const CHUNK = 3;
    for (let i = 0; i < sentences.length; i += CHUNK) {
      const chunk = sentences.slice(i, i + CHUNK).join(' ').trim();
      if (!chunk) continue;
      const utter = new SpeechSynthesisUtterance(chunk);
      utter.rate  = 1.0;
      utter.pitch = 1.0;
      utter.lang  = langRef.current;
      if (i === 0)                     utter.onstart = () => setIsSpeaking(true);
      if (i + CHUNK >= sentences.length) utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utter);
    }
    showToast('📖 Reading page content aloud…', 'info', 4000);
  }, [showToast, stopSpeaking]);

  const stopListening = useCallback(() => {
    recogniserRef.current?.stop();
    recogniserRef.current = null;
    setStatus(STATUS.idle);
    setInterimText('');
  }, []);

  const startListeningRef = useRef(null);
  const processCommandRef = useRef(null);

  const processCommand = useCallback((text, conf = null) => {
    const lower = text.toLowerCase().trim();
    setFinalText(lower);
    setConfidence(conf);
    setStatus(STATUS.processing);
    const lang = settings.language || 'en';

    setTimeout(() => {
      // 0. Intercept if there is a pending confirmation action
      if (pendingActionRef.current) {
        const action = pendingActionRef.current;
        const yesWords = ['yes', 'yeah', 'sure', 'ok', 'okay', 'confirm', 'open', 'हाँ', 'हाँजी', 'हो', 'नक्की', 'उघडा', 'खोलें'];
        const noWords = ['no', 'nope', 'nah', 'cancel', 'stop', 'ना', 'नही', 'नको', 'थांबा', 'बंद'];
        const words = lower.split(/\s+/);

        if (yesWords.some(w => words.includes(w))) {
          confirmPendingAction();
          return;
        } else if (noWords.some(w => words.includes(w))) {
          if (action.type === 'disambiguate') {
            searchGoogleFallback();
          } else {
            cancelPendingAction();
          }
          return;
        }
      }

      // 1. Try matching dynamic universal commands first
      let dynamicAction = null;
      let dynamicTarget = '';
      let dynamicValue = '';
      let dynamicLabel = '';
      let dynamicIcon = '🎯';

      if (lower.startsWith('click ') || lower.startsWith('tap ')) {
        const target = lower.replace(/^(click|tap)\s+/, '').trim();
        if (target) {
          dynamicAction = 'CLICK';
          dynamicTarget = target;
          dynamicLabel = `Click "${target}"`;
          dynamicIcon = '🖱️';
        }
      } else if (lower.startsWith('focus ') || lower.startsWith('select ')) {
        const target = lower.replace(/^(focus|select)\s+/, '').trim();
        if (target) {
          dynamicAction = 'FOCUS';
          dynamicTarget = target;
          dynamicLabel = `Focus "${target}"`;
          dynamicIcon = '👁️';
        }
      } else if (lower.startsWith('type ') || lower.startsWith('enter ') || lower.startsWith('write ')) {
        const text = lower.replace(/^(type|enter|write)\s+/, '').trim();
        dynamicAction = 'TYPE';
        dynamicValue = text;
        dynamicLabel = `Type "${text}"`;
        dynamicIcon = '⌨️';
      } else if (lower.startsWith('search ') || lower.startsWith('find ')) {
        const query = lower.replace(/^(search|find)\s+/, '').trim();
        if (query) {
          dynamicAction = 'SEARCH';
          dynamicTarget = 'search';
          dynamicValue = query;
          dynamicLabel = `Search "${query}"`;
          dynamicIcon = '🔍';
        }
      } else if (lower === 'submit' || lower === 'submit form') {
        dynamicAction = 'SUBMIT';
        dynamicLabel = 'Submit Form';
        dynamicIcon = '📤';
      } else if (lower === 'open menu' || lower === 'show menu' || lower === 'toggle menu') {
        dynamicAction = 'OPEN_MENU';
        dynamicLabel = 'Open Menu';
        dynamicIcon = '🍔';
      } else if (lower.startsWith('open ') || lower.startsWith('launch ') || lower.startsWith('go to ')) {
        const target = lower.replace(/^(open|launch|go to)\s+/, '').trim();
        // Check if it matches an internal route target in target map words first
        const isInternal = TARGET_MAP.some(t => t.words.some(w => target.includes(w) || w.includes(target))) || 
                           ['home', 'about', 'services', 'contact', 'dashboard', 'demo', 'landing'].includes(target);
                           
        if (!isInternal && target) {
          const res = findWebsite(target);
          if (res) {
            const { site, confidence } = res;
            if (pendingTimerRef.current) {
              clearInterval(pendingTimerRef.current);
            }
            
            if (confidence >= 0.8) {
              const newPending = {
                type: 'confirm_open',
                site,
                confidence,
                query: target,
                timeLeft: 3,
              };
              setPendingAction(newPending);
              speak(getSpokenText(lang, 'opening', site.label));
              showToast(`📂 Opening ${site.label} in 3 seconds…`, 'info', 3000);
              
              const timer = setInterval(() => {
                setPendingAction(prev => {
                  if (!prev || prev.type !== 'confirm_open') {
                    clearInterval(timer);
                    return prev;
                  }
                  if (prev.timeLeft <= 1) {
                    clearInterval(timer);
                    window.open(prev.site.url, '_blank', 'noopener,noreferrer');
                    
                    const entry = {
                      id:         Date.now(),
                      text:       lower,
                      label:      `Opened ${prev.site.label}`,
                      icon:       prev.site.icon || '📂',
                      success:    true,
                      timestamp:  new Date(),
                      confidence: prev.confidence,
                      nlScore:    0.95,
                      method:     'universal',
                      lang,
                    };
                    dispatchHistory({ type: 'ADD', entry });
                    setLastCommand(entry);
                    showToast(`📂 Opened ${prev.site.label}`, 'success');
                    setStatus(STATUS.success);
                    setTimeout(() => setStatus(STATUS.idle), 1500);
                    return null;
                  }
                  return { ...prev, timeLeft: prev.timeLeft - 1 };
                });
              }, 1000);
              pendingTimerRef.current = timer;
              setStatus(STATUS.idle);
              return;
            } else {
              // disambiguate
              const newPending = {
                type: 'disambiguate',
                site,
                confidence,
                query: target,
              };
              setPendingAction(newPending);
              speak(getSpokenText(lang, 'didYouMean', site.label));
              showToast(`❓ Did you mean ${site.label}? Say "yes" or "no".`, 'info', 5000);
              
              setTimeout(() => {
                if (statusRef.current === STATUS.idle || statusRef.current === STATUS.success || statusRef.current === STATUS.error) {
                  startListeningRef.current?.();
                }
              }, 1800);
              setStatus(STATUS.idle);
              return;
            }
          } else {
            // Google fallback
            const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
            window.open(googleUrl, '_blank', 'noopener,noreferrer');
            const entry = {
              id:         Date.now(),
              text:       lower,
              label:      `Searching Google for "${target}"`,
              icon:       '🔍',
              success:    true,
              timestamp:  new Date(),
              confidence: conf || 0.95,
              nlScore:    0.95,
              method:     'universal',
              lang,
            };
            dispatchHistory({ type: 'ADD', entry });
            setLastCommand(entry);
            showToast(`🔍 Searching Google for "${target}"`, 'success');
            speak(getSpokenText(lang, 'searchingGoogle', target));
            setStatus(STATUS.success);
            setTimeout(() => setStatus(STATUS.idle), 1500);
            return;
          }
        }
      }

      if (dynamicAction) {
        let success = false;
        
        if (dynamicAction === 'SEARCH') {
          const searchEl = document.querySelector('input[type="search"], input[name*="search"], input[id*="search"], input[placeholder*="search"]');
          if (searchEl) {
            window.dispatchEvent(new CustomEvent('voicenav:action', { 
              detail: { action: 'FOCUS', target: 'search' } 
            }));
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('voicenav:action', { 
                detail: { action: 'TYPE', value: dynamicValue } 
              }));
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('voicenav:action', { 
                  detail: { action: 'SUBMIT' } 
                }));
              }, 300);
            }, 300);
            success = true;
          } else {
            window.dispatchEvent(new CustomEvent('voicenav:action', { 
              detail: { action: 'FOCUS', target: 'search' } 
            }));
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('voicenav:action', { 
                detail: { action: 'TYPE', value: dynamicValue } 
              }));
            }, 300);
            success = true;
          }
        } else {
          const event = new CustomEvent('voicenav:action', { 
            detail: { action: dynamicAction, target: dynamicTarget, value: dynamicValue } 
          });
          window.dispatchEvent(event);
          success = true;
        }

        const entry = {
          id:         Date.now(),
          text:       lower,
          label:      dynamicLabel,
          icon:       dynamicIcon,
          success:    success,
          timestamp:  new Date(),
          confidence: conf || 0.95,
          nlScore:    0.95,
          method:     'universal',
          lang,
        };

        dispatchHistory({ type: 'ADD', entry });
        setLastCommand(entry);
        
        if (success) {
          showToast(`${dynamicIcon} Executing: ${dynamicLabel}`, 'success');
          speak(dynamicLabel);
          setStatus(STATUS.success);
        } else {
          showToast(`❌ Failed to execute: ${dynamicLabel}`, 'error');
          setStatus(STATUS.error);
        }

        successTimer.current = setTimeout(() => {
          if (statusRef.current === STATUS.success || statusRef.current === STATUS.error) {
            setStatus(STATUS.idle);
          }
        }, 1500);

        return;
      }

      const match = matchCommand(lower);

      if (match) {
        const { cmd, method, nlScore } = match;
        const methodTag = method !== 'phrase' ? ` (${method})` : '';

        const entry = {
          id:         Date.now(),
          text:       lower,
          label:      cmd.label,
          icon:       cmd.icon,
          success:    true,
          timestamp:  new Date(),
          confidence: conf,
          nlScore,
          method,
          lang,
        };

        if (cmd.action === 'navigate') {
          navigate(cmd.target);
          const shortLabel = cmd.label.replace('Open ', '');
          showToast(`${cmd.icon} Navigating — ${shortLabel}${methodTag}`, 'success');
          speak(getConfirm(lang, 'navigate', shortLabel));
        } else if (cmd.action === 'goback') {
          navigate(-1);
          showToast(`${cmd.icon} Going back${methodTag}`, 'success');
          speak(getConfirm(lang, 'goBack'));
        } else if (cmd.action === 'scroll') {
          const keyMap = { down: 'scrollDown', up: 'scrollUp', top: 'scrollTop', bottom: 'scrollBottom' };
          if      (cmd.target === 'down')   window.scrollBy({ top:  400, behavior: 'smooth' });
          else if (cmd.target === 'up')     window.scrollBy({ top: -400, behavior: 'smooth' });
          else if (cmd.target === 'top')    window.scrollTo({ top:    0, behavior: 'smooth' });
          else if (cmd.target === 'bottom') window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          showToast(`${cmd.icon} ${cmd.label}${methodTag}`, 'success');
          speak(getConfirm(lang, keyMap[cmd.target]));
        } else if (cmd.action === 'help') {
          showToast('Showing available commands', 'info');
          speak(getConfirm(lang, 'help'));
          window.dispatchEvent(new Event('voicenav:help'));
        } else if (cmd.action === 'palette') {
          showToast('\u2318 Opening Command Palette…', 'info', 2000);
          speak('Opening command palette');
          setTimeout(() => window.dispatchEvent(new Event('voicenav:palette')), 400);
        } else if (cmd.action === 'stop') {
          stopListening();
          speak(getConfirm(lang, 'stop'));
        } else if (cmd.action === 'repeat') {
          if (lastCommand) { processCommand(lastCommand.text); }
          else { showToast('No previous command to repeat', 'info'); speak(getConfirm(lang, 'repeat')); }
          return;
        } else if (cmd.action === 'clear') {
          dispatchHistory({ type: 'CLEAR' });
          showToast('History cleared', 'info');
          speak(getConfirm(lang, 'cleared'));
        } else if (cmd.action === 'readpage') {
          readPage();
        } else if (cmd.action === 'stopreading') {
          stopSpeaking();
          showToast('🔇 Stopped reading', 'info');
        }

        dispatchHistory({ type: 'ADD', entry });
        setLastCommand(entry);
        setStatus(STATUS.success);
        successTimer.current = setTimeout(() => {
          if (statusRef.current === STATUS.success) setStatus(STATUS.idle);
        }, 1500);

      } else {
        const tokens = tokenize(lower);
        let suggestion = '';
        if (tokens.some(t => ['home','about','services','contact'].includes(t)))
          suggestion = ' Try: "Open [page name]"';
        else if (tokens.some(t => ['scroll','down','up','top','bottom','further'].includes(t)))
          suggestion = ' Try: "Scroll down" or "Scroll top"';

        const entry = {
          id:         Date.now(),
          text:       lower,
          label:      'Unknown command',
          icon:       '❓',
          success:    false,
          timestamp:  new Date(),
          confidence: conf,
          nlScore:    0,
          method:     'none',
          lang,
        };
        dispatchHistory({ type: 'ADD', entry });
        showToast(`Didn't understand: "${lower}".${suggestion}`, 'error', 4000);
        speak(getConfirm(lang, 'sorry'));
        setStatus(STATUS.error);
        setTimeout(() => {
          if (statusRef.current === STATUS.error) setStatus(STATUS.idle);
        }, 2000);
      }
    }, 300);
  }, [navigate, showToast, stopListening, lastCommand, speak, readPage, stopSpeaking, settings.language, confirmPendingAction, cancelPendingAction, searchGoogleFallback]);

  useEffect(() => {
    startListeningRef.current = startListening;
    processCommandRef.current = processCommand;
  }, [startListening, processCommand]);

  const startListening = useCallback(() => {
    if (statusRef.current === STATUS.listening) { stopListening(); return; }

    if (!SpeechRec) {
      showToast('Web Speech API not supported. Use Chrome or Edge.', 'error', 5000);
      return;
    }

    if (micPermission !== 'granted') {
      setShowMicModal(true);
      return;
    }

    setStatus(STATUS.requesting);
    setInterimText('');
    setFinalText('');
    setConfidence(null);

    const rec = new SpeechRec();
    rec.continuous      = continuous;
    rec.interimResults  = true;
    rec.lang            = langRef.current;   // ← active language
    rec.maxAlternatives = 3;

    rec.onstart = () => setStatus(STATUS.listening);

    rec.onspeechstart = () => setInterimText('…');

    rec.onresult = (e) => {
      let interim = '';
      let finalTranscript = '';
      let conf = null;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) { finalTranscript = result[0].transcript; conf = result[0].confidence; }
        else                { interim = result[0].transcript; }
      }
      if (interim)         setInterimText(interim);
      if (finalTranscript) {
        setInterimText('');
        processCommandRef.current?.(finalTranscript, conf);
        if (!continuous) recogniserRef.current?.stop();
      }
    };

    rec.onerror = (e) => {
      let msg = 'Speech recognition error.';
      if (e.error === 'not-allowed' || e.error === 'permission-denied') msg = 'Microphone access denied. Check browser permissions.';
      else if (e.error === 'no-speech') msg = 'No speech detected. Please try again.';
      else if (e.error === 'network')   msg = 'Network error. Check your internet connection.';
      else if (e.error === 'aborted')   return;
      showToast(msg, 'error', 4000);
      setStatus(STATUS.error);
      setInterimText('');
      setTimeout(() => { if (statusRef.current === STATUS.error) setStatus(STATUS.idle); }, 2500);
    };

    rec.onend = () => {
      if (statusRef.current === STATUS.listening) { setStatus(STATUS.idle); setInterimText(''); }
      if (continuous && statusRef.current !== STATUS.idle) { try { rec.start(); } catch (_) { } }
    };

    recogniserRef.current = rec;
    try { rec.start(); }
    catch (err) { showToast('Failed to start speech recognition.', 'error'); setStatus(STATUS.idle); }
  }, [continuous, showToast, stopListening, micPermission]);

  // Global Alt+V hotkey
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'v' && e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        startListening();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [startListening]);

  return (
    <VoiceContext.Provider value={{
      status, interimText, finalText, confidence, history, dispatchHistory,
      continuous, setContinuous, ttsEnabled, setTtsEnabled, isSpeaking,
      toast, setToast,
      startListening, stopListening, processCommand, readPage, stopSpeaking,
      langCode,
      micPermission, setMicPermission,
      showMicModal, setShowMicModal,
      requestMicAccess,
      pendingAction,
      confirmPendingAction,
      cancelPendingAction,
      searchGoogleFallback,
    }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error('useVoice must be used inside VoiceProvider');
  return ctx;
}
