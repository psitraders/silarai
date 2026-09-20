import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowUp,
  ShoppingBag,
  Zap,
  Layers,
  Building2,
  Scale,
  BarChart3,
  CreditCard,
  HelpCircle,
  ChevronUp
} from 'lucide-react';

interface NavSectionItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

const SECTIONS: NavSectionItem[] = [
  { id: 'products', label: 'Core Products', shortLabel: 'Products', icon: ShoppingBag },
  { id: 'how-it-works', label: '3-Step Setup', shortLabel: 'How it Works', icon: Zap },
  { id: 'all-in-one-tools', label: 'Platform Tools', shortLabel: 'All-in-One', icon: Layers },
  { id: 'industries', label: 'Industries', shortLabel: 'Industries', icon: Building2 },
  { id: 'why-choose-us', label: 'SilarAI Advantage', shortLabel: 'Comparison', icon: Scale },
  { id: 'use-cases', label: 'Outcomes & Use Cases', shortLabel: 'Use Cases', icon: BarChart3 },
  { id: 'pricing', label: 'Pricing & ROI', shortLabel: 'Pricing', icon: CreditCard },
  { id: 'faq', label: 'FAQ', shortLabel: 'FAQ', icon: HelpCircle },
];

export const SectionQuickNav: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('products');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const visible = scrollY > 420;
          setIsVisible(visible);

          if (visible) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;
            setScrollProgress(progress);

            const sectionElements = SECTIONS.map((sec) => ({
              id: sec.id,
              el: document.getElementById(sec.id),
            })).filter((item) => item.el !== null);

            for (let i = sectionElements.length - 1; i >= 0; i--) {
              const item = sectionElements[i];
              if (item.el) {
                const rect = item.el.getBoundingClientRect();
                if (rect.top <= 220) {
                  setActiveSection(item.id);
                  break;
                }
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -100; // Account for fixed navbar + quick nav height
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Sticky Quick-Jump Sub-Navbar */}
      <nav
        aria-label="Quick Section Navigation"
        style={{
          height: '35.6667px',
          marginTop: '-16px',
          marginLeft: '1px',
          paddingLeft: '21px',
          paddingRight: '23px',
          paddingTop: '-4px',
        }}
        className="fixed top-16 md:top-20 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all duration-300 px-3 sm:px-6 flex items-center"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 w-full">
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 pr-2 border-r border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-plum-700" />
            <span>Jump To:</span>
          </div>

          {/* Horizontal Scrollable Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 w-full">
            {SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  type="button"
                  id={`quick-nav-${sec.id}`}
                  onClick={() => scrollToSection(sec.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 shrink-0 ${
                    isActive
                      ? 'bg-plum-700 text-white shadow-sm ring-1 ring-plum-800'
                      : 'bg-slate-100/90 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-peach-300' : 'text-slate-500'}`} />
                  <span className="hidden sm:inline">{sec.label}</span>
                  <span className="sm:hidden">{sec.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Floating Back-To-Top Button with circular progress ring */}
      <button
        type="button"
        id="btn-back-to-top"
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Back to top"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-plum-900 hover:bg-plum-800 text-white shadow-xl shadow-plum-950/30 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group border border-plum-700"
      >
        {/* SVG Progress Circle */}
        <svg className="w-12 h-12 absolute inset-0 -rotate-90 pointer-events-none" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r="20"
            className="text-plum-800/80 stroke-current"
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            className="text-peach-400 stroke-current transition-all duration-150"
            strokeWidth="3"
            strokeDasharray={125.6}
            strokeDashoffset={125.6 - (125.6 * scrollProgress) / 100}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <ChevronUp className="w-5 h-5 text-white group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </>
  );
};
