/**
 * domExecutor — Stateless interaction engine.
 * Simulates a browser extension content script by scanning the active DOM,
 * matching elements by text/label/placeholder, applying visual glows,
 * and executing clicks, focus, typing, and form submissions.
 */

export const domExecutor = {
  /**
   * Execute a structured Voice Navigation action command.
   * @param {Object} command 
   * @returns {boolean} success status
   */
  executeCommand(command) {
    if (!command || !command.action) return false;
    const { action, target, value } = command;

    switch (action) {
      case 'CLICK':
        return this.clickElement(target);
      case 'FOCUS':
        return this.focusElement(target);
      case 'TYPE':
        return this.typeText(value);
      case 'SUBMIT':
        return this.submitForm();
      case 'OPEN_MENU':
        return this.openMenu();
      default:
        console.warn('[VoiceNav DOM Executor] Unknown action:', action);
        return false;
    }
  },

  /**
   * Scan for clickables and click the best match
   */
  clickElement(targetText) {
    const el = this.findClickable(targetText);
    if (el) {
      this.highlightElement(el);
      // Generate standard click events to trigger React/vanilla event handlers
      el.click();
      return true;
    }
    return false;
  },

  /**
   * Scan for inputs and focus the best match
   */
  focusElement(targetText) {
    const el = this.findInput(targetText);
    if (el) {
      this.highlightElement(el);
      el.focus();
      return true;
    }
    return false;
  },

  /**
   * Inputs text value into the currently focused input field
   */
  typeText(value) {
    const el = document.activeElement;
    if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && el.tagName !== 'SELECT')) {
      return false;
    }

    el.value = value;
    // Dispatch input events so React / state frameworks capture the keystroke
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    this.highlightElement(el);
    return true;
  },

  /**
   * Locates the active form or first form and submits it
   */
  submitForm() {
    const active = document.activeElement;
    let form = active ? active.closest('form') : null;
    
    if (!form) {
      form = document.querySelector('form');
    }

    if (form) {
      // Attempt to find a submit button and click it to trigger validation
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitBtn) {
        this.highlightElement(submitBtn);
        submitBtn.click();
        return true;
      }

      // Otherwise trigger submit event directly
      this.highlightElement(form);
      const event = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(event);
      if (!event.defaultPrevented && typeof form.submit === 'function') {
        form.submit();
      }
      return true;
    }
    return false;
  },

  /**
   * Searches for hamburger menu triggers or accessibility toggles
   */
  openMenu() {
    const elements = Array.from(document.querySelectorAll('button, a, [role="button"]'));
    const menuTriggers = elements.filter(el => {
      if (el.offsetWidth === 0 || el.offsetHeight === 0) return false;
      const ariaHasPopup = el.getAttribute('aria-haspopup');
      if (ariaHasPopup === 'true' || ariaHasPopup === 'menu') return true;

      const id = (el.id || '').toLowerCase();
      const cls = (el.className || '').toString().toLowerCase();
      const label = (el.getAttribute('aria-label') || '').toLowerCase();

      return id.includes('menu') || id.includes('hamburger') || id.includes('toggle') ||
             cls.includes('menu') || cls.includes('hamburger') || cls.includes('toggle') ||
             label.includes('menu') || label.includes('toggle') || label.includes('navigation');
    });

    if (menuTriggers.length > 0) {
      this.highlightElement(menuTriggers[0]);
      menuTriggers[0].click();
      return true;
    }
    return false;
  },

  /**
   * Find clickable elements matching speech terms
   */
  findClickable(targetText) {
    if (!targetText) return null;
    const cleanTarget = targetText.toLowerCase().trim();

    // Query standard interactive selectors
    let elements = Array.from(document.querySelectorAll('a, button, [role="button"], input[type="submit"], input[type="button"]'));

    // Scan for non-standard clickable divs/spans that have a pointer cursor
    document.querySelectorAll('*').forEach(el => {
      if (el.tagName !== 'A' && el.tagName !== 'BUTTON' && el.getAttribute('role') !== 'button') {
        const style = window.getComputedStyle(el);
        if (style.cursor === 'pointer' && el.clientWidth > 0 && el.clientHeight > 0) {
          elements.push(el);
        }
      }
    });

    let bestMatch = null;
    let bestScore = 0;

    for (const el of elements) {
      if (el.offsetWidth === 0 || el.offsetHeight === 0) continue; // Skip hidden elements

      const text = (el.textContent || '').toLowerCase().trim();
      const label = (el.getAttribute('aria-label') || '').toLowerCase().trim();
      const title = (el.getAttribute('title') || '').toLowerCase().trim();
      const id = (el.id || '').toLowerCase().trim();

      // Priority 1: Exact matches
      if (text === cleanTarget || label === cleanTarget) {
        return el;
      }

      // Priority 2: Keyword scoring
      let score = 0;
      if (text && text.includes(cleanTarget)) score += 5;
      if (label && label.includes(cleanTarget)) score += 5;
      if (title && title.includes(cleanTarget)) score += 3;
      if (id && id.includes(cleanTarget)) score += 2;

      // Prefer shorter matches (more specific to search phrase)
      if (score > 0) {
        score += 1 / (text.length || 1);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = el;
        }
      }
    }

    return bestMatch;
  },

  /**
   * Find inputs matching placeholder/label/id/name
   */
  findInput(targetText) {
    if (!targetText) return null;
    const cleanTarget = targetText.toLowerCase().trim();

    const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'));

    let bestMatch = null;
    let bestScore = 0;

    for (const el of inputs) {
      if (el.offsetWidth === 0 || el.offsetHeight === 0) continue;

      const placeholder = (el.getAttribute('placeholder') || '').toLowerCase().trim();
      const name = (el.getAttribute('name') || '').toLowerCase().trim();
      const id = (el.id || '').toLowerCase().trim();
      const labelText = this.getLabelForInput(el).toLowerCase().trim();

      if (placeholder === cleanTarget || name === cleanTarget || id === cleanTarget || labelText === cleanTarget) {
        return el;
      }

      let score = 0;
      if (placeholder && placeholder.includes(cleanTarget)) score += 5;
      if (labelText && labelText.includes(cleanTarget)) score += 5;
      if (name && name.includes(cleanTarget)) score += 3;
      if (id && id.includes(cleanTarget)) score += 2;

      if (score > 0) {
        score += 1 / ((placeholder || labelText || name || id).length || 1);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = el;
        }
      }
    }

    return bestMatch;
  },

  /**
   * Helper to retrieve label text corresponding to an input element
   */
  getLabelForInput(input) {
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return label.textContent || '';
    }
    const parentLabel = input.closest('label');
    if (parentLabel) return parentLabel.textContent || '';
    return '';
  },

  /**
   * Highlight element with temporary high-contrast outline glow
   */
  highlightElement(el) {
    const originalOutline = el.style.outline;
    const originalOffset  = el.style.outlineOffset;
    const originalShadow  = el.style.boxShadow;
    const originalTransition = el.style.transition;

    el.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    el.style.outline = '4px solid var(--clr-primary, #38bdf8)';
    el.style.outlineOffset = '3px';
    el.style.boxShadow = '0 0 18px rgba(56, 189, 248, 0.6)';

    setTimeout(() => {
      el.style.outline = originalOutline;
      el.style.outlineOffset = originalOffset;
      el.style.boxShadow = originalShadow;
      el.style.transition = originalTransition;
    }, 1500);
  }
};

// Event listener integration simulating extension content script message passing
if (typeof window !== 'undefined') {
  window.addEventListener('voicenav:action', (e) => {
    if (e.detail) {
      domExecutor.executeCommand(e.detail);
    }
  });
}
