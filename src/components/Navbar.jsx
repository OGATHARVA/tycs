import { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Mic, Menu, X, Radio } from 'lucide-react';
import { useVoice, STATUS } from '../contexts/VoiceContext';
import Logo from './Logo';

const NAV_LINKS = [
  { to: '/',         label: 'Home',      description: 'Go to Tejyash Cyber Solutions home page'     },
  { to: '/dashboard',label: 'Dashboard', description: 'View Tejyash Cyber Solutions dashboard and metrics' },
  { to: '/about',    label: 'About',     description: 'Learn about Tejyash Cyber Solutions and our team' },
  { to: '/services', label: 'Services',  description: 'Explore our accessibility services' },
  { to: '/contact',  label: 'Contact',   description: 'Get in touch with us'              },
];

export default function Navbar() {
  const { status } = useVoice();
  const isListening = status === STATUS.listening;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef       = useRef(null);
  const hamburgerRef  = useRef(null);

  /* Scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Keyboard handlers: Escape closes mobile menu & returns focus */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

  /* Focus trap inside mobile menu */
  useEffect(() => {
    if (!menuOpen || !menuRef.current) return;
    const focusable = menuRef.current.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    const trap = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first?.focus();
      }
    };

    document.addEventListener('keydown', trap);
    first?.focus();
    return () => document.removeEventListener('keydown', trap);
  }, [menuOpen]);

  /* Prevent body scroll when menu is open on mobile */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinkClass = ({ isActive }) =>
    `relative px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
      isActive
        ? 'text-[var(--clr-primary)] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-[var(--clr-primary)] after:rounded'
        : 'text-[var(--clr-text-muted)] hover:text-[var(--clr-text)] hover:bg-[var(--clr-bg-elevated)]'
    }`;

  return (
    <header
      role="banner"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--clr-bg-card)] border-b border-[var(--clr-border)] shadow-sm'
          : 'bg-transparent'
      }`}
    >
      {/* Landmark: skip to main content */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <div className="container">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            aria-label="Tejyash Cyber Solutions — Back to home"
            className="flex items-center group rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[var(--clr-primary)]"
          >
            <Logo size="sm" showSlogan={false} />
          </Link>

          {/* Desktop Navigation */}
          <nav
            role="navigation"
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-1"
          >
            {NAV_LINKS.map(({ to, label, description }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={navLinkClass}
                aria-description={description}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {isListening && (
              <span
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="flex items-center gap-1.5 text-xs text-[var(--clr-error)] font-medium"
              >
                <span className="w-2 h-2 bg-[var(--clr-error)] rounded-full animate-pulse" aria-hidden="true" />
                Listening…
              </span>
            )}
            <Link
              to="/contact"
              className="btn btn-primary text-sm py-2 px-4"
              aria-label="Get started with Tejyash Cyber Solutions"
            >
              <Mic size={15} aria-hidden="true" />
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            ref={hamburgerRef}
            id="mobile-menu-toggle"
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-haspopup="true"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[var(--clr-text-muted)] hover:text-[var(--clr-text)] hover:bg-[var(--clr-bg-elevated)] transition-colors"
          >
            {menuOpen
              ? <X size={20} aria-hidden="true" />
              : <Menu size={20} aria-hidden="true" />
            }
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 top-16 bg-black/20 z-40"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer */}
          <nav
            ref={menuRef}
            id="mobile-menu"
            role="navigation"
            aria-label="Mobile navigation menu"
            className="md:hidden fixed top-16 inset-x-0 bg-[var(--clr-bg-card)] border-t border-[var(--clr-border)] z-50 animate-slide-down shadow-xl"
          >
            <div className="container py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ to, label, description }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => { setMenuOpen(false); }}
                  aria-description={description}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--clr-bg-elevated)] text-[var(--clr-primary)]'
                        : 'text-[var(--clr-text-muted)] hover:bg-[var(--clr-bg-elevated)] hover:text-[var(--clr-text)]'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <div className="pt-2 border-t border-[var(--clr-border)] mt-2">
                <Link
                  to="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-primary w-full justify-center"
                  aria-label="Get started with Tejyash Cyber Solutions"
                >
                  <Mic size={15} aria-hidden="true" />
                  Get Started
                </Link>
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
