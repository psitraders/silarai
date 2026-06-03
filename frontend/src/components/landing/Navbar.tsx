import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquareQuote, ArrowRight, Menu, X } from 'lucide-react';

const DEMO_WA_LINK =
  'https://wa.me/918849549690?text=Hi%2C%20I%27d%20like%20to%20book%20a%20demo%20of%20ReplyCart%20%F0%9F%9A%80';

interface NavLink {
  label: string;
  hash?: string;   // scroll-to section on home page
  to?: string;     // hard route
}

const NAV_LINKS: NavLink[] = [
  { label: 'Features',     hash: 'features' },
  { label: 'How it works', hash: 'how-it-works' },
  { label: 'AI Chat',      hash: 'ai' },
  { label: 'Pricing',      to: '/pricing' },
];

/** Smooth-scroll to a section by id, accounting for the fixed 64px navbar. */
function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    const offset = 72; // navbar height + a little breathing room
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

export function Navbar() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate                = useNavigate();
  const location                = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // After navigating to /, handle pending hash scroll
  useEffect(() => {
    const pending = sessionStorage.getItem('scrollTo');
    if (pending && location.pathname === '/') {
      sessionStorage.removeItem('scrollTo');
      // Small delay so the page renders first
      setTimeout(() => scrollToSection(pending), 80);
    }
  }, [location.pathname]);

  function handleHashLink(hash: string) {
    setOpen(false);
    if (location.pathname === '/') {
      scrollToSection(hash);
    } else {
      // Navigate home, then scroll once landed
      sessionStorage.setItem('scrollTo', hash);
      navigate('/');
    }
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 bg-white transition-shadow duration-200 ${
        scrolled ? 'shadow-sm border-b border-gray-200' : 'border-b border-gray-100'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-teal-700 transition-colors">
            <MessageSquareQuote className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-[15px] tracking-tight">ReplyCart</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) =>
            link.to ? (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm text-gray-500 hover:text-gray-900 font-medium px-3.5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.label}
                onClick={() => handleHashLink(link.hash!)}
                className="text-sm text-gray-500 hover:text-gray-900 font-medium px-3.5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </button>
            )
          )}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          <a
            href={DEMO_WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3.5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Book a demo
          </a>
          <Link
            to="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3.5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Start free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3">
          <nav className="space-y-0.5 mb-4">
            {NAV_LINKS.map((link) =>
              link.to ? (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="block text-sm text-gray-600 font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  onClick={() => handleHashLink(link.hash!)}
                  className="w-full text-left text-sm text-gray-600 font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </button>
              )
            )}
          </nav>

          <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
            <a
              href={DEMO_WA_LINK}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="text-center text-sm font-medium text-gray-700 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Book a demo
            </a>
            <div className="flex gap-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex-1 text-center text-sm font-medium text-gray-700 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="flex-1 text-center text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 py-2.5 rounded-lg transition-colors"
              >
                Start free
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
