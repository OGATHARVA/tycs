/**
 * Local NLP engine for the Accessibility Assistant.
 * Analyzes query text, inspects page/site context, and constructs structured response payloads.
 */

const OUT_OF_SCOPE_WORDS = [
  'weather', 'joke', 'capital', 'president', 'movie', 'song', 'cook', 'recipe',
  'meaning of life', 'old are you', 'how is your day', 'news', 'game', 'play',
  'who is', 'what is the capital', 'translate', 'math', 'calculate'
];

const A11Y_QUESTIONS = [
  {
    keywords: ['contrast', 'color', 'dark', 'black and white'],
    answer: "High Contrast mode swaps the website's color palette to high-contrast colors (meeting WCAG AAA contrast ratios) to improve readability for users with low vision. You can enable it in the Accessibility Settings panel (⚙ icon), or just tell me: 'enable high contrast'."
  },
  {
    keywords: ['font size', 'text size', 'bigger', 'larger', 'smaller', 'increase text', 'decrease text'],
    answer: "You can adjust text size in the Accessibility Settings panel (⚙ icon) to Small, Default, Large, X-Large, or XX-Large. Alternatively, ask me to: 'make text larger' or 'make text smaller'."
  },
  {
    keywords: ['spacing', 'letter spacing', 'line height', 'wcag 1.4.12'],
    answer: "Text Spacing increases line height and letter spacing according to WCAG 1.4.12 guidelines, making words easier to distinguish. You can toggle it via the settings panel or tell me: 'turn on spacing'."
  },
  {
    keywords: ['underline', 'link underline', 'links underline'],
    answer: "Underlining links ensures they are distinguishable from normal text by structure rather than color alone, matching accessibility best practices. You can activate this in the settings panel or ask me to: 'underline links'."
  },
  {
    keywords: ['motion', 'reduced motion', 'animations', 'stop pulsing', 'transitions'],
    answer: "Reduced Motion disables hover expansions, pulsing circles, and menu slides to help users with motion sensitivities or cognitive preferences. You can activate it in the settings panel or say: 'reduce motion'."
  },
  {
    keywords: ['wcag', 'compliant', 'accessibility standard', 'accessibility conformance'],
    answer: "This website is designed to satisfy WCAG 2.1 Level AA criteria. It features full keyboard control, screen reader accessibility headings, text customization options, continuous voice control navigation, and this AI accessibility assistant."
  }
];

export function queryAssistant(rawQuery, context = {}) {
  // eslint-disable-next-line no-misleading-character-class
  const query = rawQuery.toLowerCase().trim().replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, '');
  const { pathname = '/', docHeadings = [], a11ySettings = {} } = context;

  // 1. Check for Out-of-Scope general chat queries
  const isOutOfScope = OUT_OF_SCOPE_WORDS.some(word => query.includes(word)) && 
                      !['compliance', 'website', 'tycs', 'team', 'email', 'contact', 'services'].some(w => query.includes(w));
  if (isOutOfScope) {
    return {
      text: "I am your Accessibility Assistant, focused strictly on helping you navigate this site, understand voice commands, and adjust readability settings. I cannot answer general queries, but I can help you find contact info, summarize this page, or enable settings like High Contrast!",
      action: null,
      suggestions: ["Summarize this page", "What voice commands can I say?", "Enable High Contrast"]
    };
  }

  // 2. Language Switching Commands
  // Switch to English
  if (/\b(switch|change|set|use|speak)\b.*\b(english|en|अंग्रेजी|इंग्लिश|इंग्रजी)\b/i.test(query) ||
      /\b(english|अंग्रेजी)\b.*\b(language|भाषा|बोला|बोलो|में)\b/i.test(query)) {
    return {
      text: "I've switched the voice language to **English**. Speech recognition and responses will now use English.",
      action: { type: 'setting', key: 'language', value: 'en' },
      suggestions: ["Switch to Hindi", "Switch to Marathi", "What commands can I say?"]
    };
  }
  // Switch to Hindi
  if (/\b(switch|change|set|use|speak)\b.*\b(hindi|hi|हिंदी|हिन्दी)\b/i.test(query) ||
      /\b(hindi|हिंदी|हिन्दी)\b.*\b(language|भाषा|बोला|बोलो|में)\b/i.test(query) ||
      query.includes('हिंदी में बोलो') || query.includes('हिंदी में बात') || query.includes('भाषा हिंदी')) {
    return {
      text: "मैंने भाषा **हिंदी** में बदल दी है। अब वॉइस पहचान और जवाब हिंदी में होंगे।\n\n(Switched to Hindi. Speech recognition and responses will now use Hindi.)",
      action: { type: 'setting', key: 'language', value: 'hi' },
      suggestions: ["Switch to English", "Switch to Marathi", "मदद"]
    };
  }
  // Switch to Marathi
  if (/\b(switch|change|set|use|speak)\b.*\b(marathi|mr|मराठी)\b/i.test(query) ||
      /\b(marathi|मराठी)\b.*\b(language|भाषा|बोला|बोल|मध्ये)\b/i.test(query) ||
      query.includes('मराठीत बोला') || query.includes('मराठी मध्ये') || query.includes('भाषा मराठी')) {
    return {
      text: "मी भाषा **मराठी** मध्ये बदलली आहे। आता व्हॉइस ओळख आणि प्रतिसाद मराठीत होतील.\n\n(Switched to Marathi. Speech recognition and responses will now use Marathi.)",
      action: { type: 'setting', key: 'language', value: 'mr' },
      suggestions: ["Switch to English", "Switch to Hindi", "मदत"]
    };
  }
  // Current language query
  if ((query.includes('language') || query.includes('भाषा') || query.includes('lang')) &&
      (query.includes('current') || query.includes('which') || query.includes('what') || query.includes('कौन') || query.includes('कोणती'))) {
    const langNames = { en: 'English', hi: 'Hindi (हिंदी)', mr: 'Marathi (मराठी)' };
    const currentLang = context.a11ySettings?.language || 'en';
    return {
      text: `The current voice language is **${langNames[currentLang] || 'English'}**. You can switch by saying "Switch to Hindi" or "Switch to Marathi".`,
      action: null,
      suggestions: ["Switch to Hindi", "Switch to Marathi", "Switch to English"]
    };
  }

  // 3. Accessibility Action Commands (Direct Toggling)
  // Contrast
  if (/\b(enable|turn on|activate|start|show|high)\b.*\b(contrast|hc)\b/.test(query) || query === 'high contrast') {
    return {
      text: "I have turned on High Contrast mode to increase accessibility.",
      action: { type: 'setting', key: 'highContrast', value: true },
      suggestions: ["Turn off high contrast", "Increase text size", "Explain text spacing"]
    };
  }
  if (/\b(disable|turn off|deactivate|stop|normal|regular)\b.*\b(contrast|hc)\b/.test(query)) {
    return {
      text: "I have turned off High Contrast mode, restoring normal color contrast.",
      action: { type: 'setting', key: 'highContrast', value: false },
      suggestions: ["Enable high contrast", "Underline links", "What can I say?"]
    };
  }

  // Font Size
  if (/\b(increase|larger|bigger|grow|make text larger|make text bigger|increase text|increase font)\b/.test(query) && /\b(font|text|size|scale)?\b/.test(query)) {
    let targetSize = 'lg';
    if (a11ySettings.fontSize === 'sm') targetSize = 'base';
    else if (a11ySettings.fontSize === 'base') targetSize = 'lg';
    else if (a11ySettings.fontSize === 'lg') targetSize = 'xl';
    else if (a11ySettings.fontSize === 'xl') targetSize = '2xl';
    else if (a11ySettings.fontSize === '2xl') targetSize = '2xl';

    return {
      text: `I have increased the font size to "${targetSize.toUpperCase()}".`,
      action: { type: 'setting', key: 'fontSize', value: targetSize },
      suggestions: ["Increase text size further", "Decrease text size", "Underline links"]
    };
  }
  if (/\b(decrease|smaller|shrink|make text smaller|decrease text|decrease font)\b/.test(query) && /\b(font|text|size|scale)?\b/.test(query)) {
    let targetSize = 'base';
    if (a11ySettings.fontSize === '2xl') targetSize = 'xl';
    else if (a11ySettings.fontSize === 'xl') targetSize = 'lg';
    else if (a11ySettings.fontSize === 'lg') targetSize = 'base';
    else if (a11ySettings.fontSize === 'base') targetSize = 'sm';
    else if (a11ySettings.fontSize === 'sm') targetSize = 'sm';

    return {
      text: `I have decreased the font size to "${targetSize.toUpperCase()}".`,
      action: { type: 'setting', key: 'fontSize', value: targetSize },
      suggestions: ["Increase text size", "Underline links", "Explain text spacing"]
    };
  }

  // Text Spacing
  if (/\b(enable|turn on|activate|start|spacing|text spacing)\b/.test(query) && /\b(spacing|space|gaps|line height)\b/.test(query)) {
    return {
      text: "I have enabled WCAG 1.4.12 Text Spacing, increasing line-height and letter-spacing for improved reading comfort.",
      action: { type: 'setting', key: 'textSpacing', value: true },
      suggestions: ["Turn off spacing", "Enable high contrast", "What is text spacing?"]
    };
  }
  if (/\b(disable|turn off|deactivate|remove|stop)\b.*\b(spacing|space|gaps|line height)\b/.test(query)) {
    return {
      text: "I have disabled Text Spacing, restoring the standard layout heights.",
      action: { type: 'setting', key: 'textSpacing', value: false },
      suggestions: ["Turn on text spacing", "Underline links", "Reduce motion"]
    };
  }

  // Underline Links
  if (/\b(enable|turn on|activate|underline|links underline)\b/.test(query) && /\b(underline|underlines|links|link)\b/.test(query)) {
    return {
      text: "I have enabled underlines on links. They will now be visually identifiable by structure, helping individuals with color-blindness.",
      action: { type: 'setting', key: 'underlineLinks', value: true },
      suggestions: ["Disable link underlines", "Enable high contrast", "Help with commands"]
    };
  }
  if (/\b(disable|turn off|deactivate|remove|links no underline)\b/.test(query) && /\b(underline|underlines|links|link)\b/.test(query)) {
    return {
      text: "I have disabled link underlines.",
      action: { type: 'setting', key: 'underlineLinks', value: false },
      suggestions: ["Underline links", "Enable high contrast", "Tell me about this website"]
    };
  }

  // Reduced Motion
  if (/\b(enable|turn on|activate|reduce|reduced motion)\b/.test(query) && /\b(motion|animations|pulse|pulsing|movement)\b/.test(query)) {
    return {
      text: "I have enabled Reduced Motion. Transitions, glowing pulses, and mic wave visualizers have been deactivated.",
      action: { type: 'setting', key: 'reducedMotion', value: true },
      suggestions: ["Turn animations back on", "Enable high contrast", "How to use voice controls"]
    };
  }
  if (/\b(disable|turn off|deactivate|animations on|allow motion)\b/.test(query) && /\b(motion|animations|pulse|pulsing|movement)\b/.test(query)) {
    return {
      text: "I have disabled Reduced Motion, re-enabling default animations.",
      action: { type: 'setting', key: 'reducedMotion', value: false },
      suggestions: ["Reduce motion", "Underline links", "Summarize current page"]
    };
  }

  // Reset settings
  if (query.includes('reset') && (query.includes('setting') || query.includes('default') || query.includes('a11y') || query.includes('accessibility'))) {
    return {
      text: "I have reset all accessibility settings to the standard defaults.",
      action: { type: 'reset' },
      suggestions: ["Enable high contrast", "Increase text size", "Guided tour"]
    };
  }

  // 3. Summarize page content
  if (query.includes('summarize') || query.includes('summary') || (query.includes('what') && query.includes('about') && query.includes('page'))) {
    let summaryText;
    let pageName;
    
    if (pathname === '/') {
      pageName = "Home";
      summaryText = "The Home page serves as the starting point. It details how the voice-controlled website works and showcases its primary accessibility features. Key sections are the Hero banner, the 'How It Works' guide (explaining the microphone button and commands), and the accessibility features highlight grid.";
    } else if (pathname === '/about') {
      pageName = "About";
      summaryText = "The About page outlines our mission to make web navigation barriers vanish. It covers the four core WCAG accessibility principles (Perceivable, Operable, Understandable, Robust) and lists our specialist development and design team members.";
    } else if (pathname === '/services') {
      pageName = "Services";
      summaryText = "The Services page showcases our professional accessibility offerings: Auditing & Compliance, Custom Integration, and Training Workshops. It includes an interactive category filtering tab system (All, Design, Development, Strategy) to browse solutions.";
    } else if (pathname === '/contact') {
      pageName = "Contact";
      summaryText = "The Contact page contains an interactive contact request form with built-in accessibility error summaries, our business email (contact@tycs.dev), phone number (+1 555-019-2834), and physical office address in Tech City.";
    } else if (pathname === '/dashboard') {
      pageName = "System Dashboard";
      summaryText = "The System Dashboard provides a professional monitor. It displays live voice microphone indicators, dynamic intent matching stats, total commands processed, overall success rate percentages, and active accessibility preference tokens.";
    } else {
      pageName = "Active Page";
      summaryText = "You are currently browsing a page on our site. I can help you read its text or navigate back to the Home page.";
    }

    // Dynamic addition using page headings if available
    let headingsSnippet = "";
    if (docHeadings && docHeadings.length > 0) {
      const pageHeadings = docHeadings.filter(h => h && h.trim().length > 2).slice(0, 4);
      if (pageHeadings.length > 0) {
        headingsSnippet = ` Key topics found on this page include: ${pageHeadings.map(h => `"${h}"`).join(', ')}.`;
      }
    }

    return {
      text: `Here is a summary of the **${pageName}** page: ${summaryText}${headingsSnippet}`,
      action: null,
      suggestions: ["What commands can I say?", "Explain accessibility compliance", "Go to Home page"]
    };
  }

  // 4. Mappings for Guided Tours and navigation
  if (query.includes('tour') || query.includes('guided tour') || query.includes('how do i nav') || query.includes('site layout')) {
    return {
      text: "Let me guide you through the site layout! We have five main views:\n\n1. **Home**: Basic introduction & voice instructions.\n2. **Dashboard**: Performance counters and real-time logs.\n3. **About**: Team information and WCAG guidelines.\n4. **Services**: Accessibility solutions and audits.\n5. **Contact**: Form and map coordinates.\n\nYou can speak navigation commands or click below to explore.",
      action: null,
      suggestions: ["Go to Home", "Go to Services", "Go to Dashboard", "How to use voice controls"]
    };
  }

  // 5. Mapped Navigation Intents
  if (/\b(go to|navigate to|open|take me to|visit|load|show)\b.*\b(home|start|main)\b/.test(query) || query === 'go home') {
    return {
      text: "Certainly! I've prepared a shortcut to take you to the Home page.",
      action: { type: 'navigate', route: '/' },
      suggestions: ["Summarize Home page", "How to use voice controls", "Go to Services"]
    };
  }
  if (/\b(go to|navigate to|open|take me to|visit|load|show)\b.*\b(about|team|us|who)\b/.test(query)) {
    return {
      text: "Sure thing! Let's navigate to the About page.",
      action: { type: 'navigate', route: '/about' },
      suggestions: ["Summarize About page", "Who is on the team?", "WCAG principles"]
    };
  }
  if (/\b(go to|navigate to|open|take me to|visit|load|show)\b.*\b(service|services|offering|offerings)\b/.test(query)) {
    return {
      text: "Of course! Let's load the Services catalog page.",
      action: { type: 'navigate', route: '/services' },
      suggestions: ["Summarize Services page", "What services are offered?", "Go to Contact"]
    };
  }
  if (/\b(go to|navigate to|open|take me to|visit|load|show)\b.*\b(contact|reach|touch|form|email|address)\b/.test(query)) {
    return {
      text: "Understood! Moving to the Contact page.",
      action: { type: 'navigate', route: '/contact' },
      suggestions: ["Summarize Contact page", "What is the email?", "Office hours"]
    };
  }
  if (/\b(go to|navigate to|open|take me to|visit|load|show)\b.*\b(dashboard|system|metrics|stats)\b/.test(query)) {
    return {
      text: "Right away! Routing you to the System Dashboard.",
      action: { type: 'navigate', route: '/dashboard' },
      suggestions: ["Summarize Dashboard", "Total voice commands?", "Enable high contrast"]
    };
  }
  if (/\b(go to|navigate to|open|take me to|visit|load|show)\b.*\b(demo|live demo|interactive demo)\b/.test(query)) {
    return {
      text: "The Live Demo page is no longer available. Let me redirect you to our Services page where you can see all our accessibility features.",
      action: { type: 'navigate', route: '/services' },
      suggestions: ["What voice commands are there?", "Go to About page", "Summarize Services"]
    };
  }

  // 6. Voice commands explanations
  if (query.includes('command') || query.includes('phrases') || query.includes('voice control') || query.includes('speak') || query.includes('talk')) {
    if (query.includes('scroll') || query.includes('move')) {
      return {
        text: "For scrolling, you can use these voice commands:\n- **'Scroll Down'**: Scrolls down by 400px.\n- **'Scroll Up'**: Scrolls up by 400px.\n- **'Scroll to Top'**: Snaps to the absolute top of the page.\n- **'Scroll to Bottom'**: Snaps to the bottom footer.",
        action: null,
        suggestions: ["Navigation commands", "Utility commands", "Summarize this page"]
      };
    }
    if (query.includes('navigat') || query.includes('go to') || query.includes('page')) {
      return {
        text: "For navigation, you can say:\n- **'Go Home'** or **'Open Home'**\n- **'Go About'**\n- **'Go Services'**\n- **'Go Contact'**\n- **'Go Back'** (navigates to the previous page in history)",
        action: null,
        suggestions: ["Scrolling commands", "Utility commands", "Go to About page"]
      };
    }
    return {
      text: "Voice commands are grouped into three classes:\n\n1. **Navigation**: 'Go Home', 'Go About', 'Go Services', 'Go Contact', 'Go Back'.\n2. **Scroll**: 'Scroll Down', 'Scroll Up', 'Scroll Top', 'Scroll Bottom'.\n3. **Utility**: 'Help' (opens checklist dialog), 'Read Page', 'Stop Reading', 'Clear History', 'Repeat Last'.",
      action: null,
      suggestions: ["Scrolling commands", "Navigation commands", "Summarize current page"]
    };
  }

  // 7. General site queries & Q&A
  if (query.includes('what is') && (query.includes('website') || query.includes('tycs') || query.includes('this project'))) {
    return {
      text: "TYCS is an accessibility demonstration website. It lets users experience browsing without a keyboard or mouse, relying on Web Speech API voice matching. It also features font adjustments, contrast ratios, link underlining, and an audible text reader.",
      action: null,
      suggestions: ["What voice commands are there?", "Is this site WCAG compliant?", "Summarize this page"]
    };
  }

  // Page-specific Q&As
  // Contact page Q&A
  if (pathname === '/contact') {
    if (query.includes('email')) {
      return {
        text: "Our contact email address is **contact@tycs.dev**. We respond to inquiries within one business day.",
        action: null,
        suggestions: ["What is the phone number?", "Office location?", "Summarize this page"]
      };
    }
    if (query.includes('phone') || query.includes('number') || query.includes('call')) {
      return {
        text: "You can reach us by phone at **+1 (555) 019-2834** during standard support hours.",
        action: null,
        suggestions: ["What is the email?", "Office hours?", "Office location?"]
      };
    }
    if (query.includes('address') || query.includes('office') || query.includes('location') || query.includes('where')) {
      return {
        text: "Our physical office is located at **100 Accessibility Way, Suite 400, Tech City**.",
        action: null,
        suggestions: ["What is the email?", "Office hours?", "What is the phone number?"]
      };
    }
    if (query.includes('hours') || query.includes('open') || query.includes('time')) {
      return {
        text: "Our office hours are **Monday through Friday, 9:00 AM to 5:00 PM EST**.",
        action: null,
        suggestions: ["What is the email?", "What is the phone number?", "Summarize this page"]
      };
    }
  }

  // About page Q&A
  if (pathname === '/about') {
    if (query.includes('team') || query.includes('staff') || query.includes('people') || query.includes('member')) {
      return {
        text: "Our specialist team includes:\n\n- **Atharva Bhosle** (Frontend UI/UX Designer, Speech Recognition): Designs and builds the voice navigation interfaces and Speech API integrations.\n- **Omkar** (Backend Engineer): Engineers robust server systems, services, and backend integration.",
        action: null,
        suggestions: ["What is the mission?", "What are the WCAG principles?", "Summarize this page"]
      };
    }
    if (query.includes('mission') || query.includes('goal') || query.includes('purpose') || query.includes('why')) {
      return {
        text: "Our mission is to build digital environments where physical constraints do not restrict digital experiences. We create web applications controlled easily by voice and customized layouts for various accessibility settings.",
        action: null,
        suggestions: ["Who is on the team?", "What are the WCAG principles?", "Is this site WCAG compliant?"]
      };
    }
    if (query.includes('principles') || query.includes('pour') || query.includes('wcag principle')) {
      return {
        text: "We adhere to the 4 WCAG accessibility principles (POUR):\n\n1. **Perceivable**: Info must be presentable to senses (e.g. contrast, font size).\n2. **Operable**: Interface cannot require actions user cannot perform (e.g. voice control, keyboard focus traps).\n3. **Understandable**: Clear language, predictable routing, input summaries.\n4. **Robust**: Clean standards-compliant HTML parsing.",
        action: null,
        suggestions: ["Who is on the team?", "Is this site WCAG compliant?", "Summarize this page"]
      };
    }
  }

  // Services page Q&A
  if (pathname === '/services') {
    if (query.includes('what') && (query.includes('service') || query.includes('offer') || query.includes('audit'))) {
      return {
        text: "We offer three primary consulting services:\n\n1. **Auditing & Compliance**: Manual testing and compliance checks against WCAG 2.1 standards.\n2. **Custom Integration**: Integrating speech recognition models and screen readers into custom sites.\n3. **Training & Workshops**: Interactive courses on inclusive coding and design metrics.",
        action: null,
        suggestions: ["How do I filter services?", "Contact page for quotes", "Summarize this page"]
      };
    }
    if (query.includes('filter') || query.includes('categories') || query.includes('tabs')) {
      return {
        text: "You can filter services by clicking the category tabs at the top of the grid: **All**, **Design**, **Development**, or **Strategy**. This dynamically shows cards fitting that focus.",
        action: null,
        suggestions: ["What services are offered?", "Summarize services", "Go to Contact"]
      };
    }
  }

  // Dashboard page Q&A
  if (pathname === '/dashboard') {
    if (query.includes('total') || query.includes('count') || query.includes('number of command') || query.includes('stats') || query.includes('metric')) {
      return {
        text: "This page displays real-time statistics of your browser session: 'Total Commands' records all spoken inputs; 'Success Rate' gauges matched phrases; and the 'High Confidence' bar tracks NLP scores above 80%.",
        action: null,
        suggestions: ["Summarize Dashboard page", "Enable high contrast", "List commands"]
      };
    }
  }

  // 8. General A11y matching
  for (const item of A11Y_QUESTIONS) {
    if (item.keywords.some(kw => query.includes(kw))) {
      return {
        text: item.answer,
        action: null,
        suggestions: ["What voice commands are there?", "Summarize this page", "Help with navigation"]
      };
    }
  }

  // 9. Fallback response
  return {
    text: "I didn't quite understand that in relation to website accessibility. I can summarize this page, explain how to navigate the site, list voice commands, or directly adjust settings like font sizes and high contrast! Try asking: 'Summarize this page' or 'how do I use voice controls?'.",
    action: null,
    suggestions: ["Summarize this page", "What voice commands are there?", "Enable High Contrast"]
  };
}
