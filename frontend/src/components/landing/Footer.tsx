import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquareQuote } from 'lucide-react';

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

interface FooterLink {
  label: string;
  to?: string;
  hash?: string;
}

const cols: { heading: string; links: FooterLink[] }[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Features',     hash: 'features' },
      { label: 'Pricing',      to: '/pricing' },
      { label: 'How it works', hash: 'how-it-works' },
      { label: 'AI Chat',      hash: 'ai' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About us', to: '/about' },
      { label: 'Blog',     to: '/blog' },
      { label: 'Contact',  to: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy',   to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Refund Policy',    to: '/refund' },
    ],
  },
];

export function Footer() {
  const navigate  = useNavigate();
  const location  = useLocation();

  function handleHash(hash: string) {
    if (location.pathname === '/') {
      scrollToSection(hash);
    } else {
      sessionStorage.setItem('scrollTo', hash);
      navigate('/');
    }
  }

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <MessageSquareQuote className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-[15px] tracking-tight">ReplyCart</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              The all-in-one selling platform for social sellers worldwide.
            </p>
            <a
              href="mailto:support@replycart.app"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              support@replycart.app
            </a>
          </div>

          {cols.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {col.heading}
              </p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.hash ? (
                      <button
                        onClick={() => handleHash(l.hash!)}
                        className="text-sm text-gray-500 hover:text-gray-900 transition-colors text-left"
                      >
                        {l.label}
                      </button>
                    ) : (
                      <Link
                        to={l.to!}
                        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} ReplyCart. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">Made with ❤️ for sellers everywhere</p>
        </div>
      </div>
    </footer>
  );
}
