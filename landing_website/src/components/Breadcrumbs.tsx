import React, { useState } from 'react';
import {
  ChevronRight,
  ArrowLeft,
  Share2,
  Check,
  ChevronDown
} from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  shortLabel?: string;
  onClick?: () => void;
  href?: string;
  isCurrent?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface BreadcrumbSibling {
  id: string | number;
  label: string;
  shortLabel?: string;
  onClick: () => void;
  isActive?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  variant?: 'bar' | 'dark' | 'light';
  showBackButton?: boolean;
  backButtonLabel?: string;
  onBack?: () => void;
  siblings?: BreadcrumbSibling[];
  siblingsLabel?: string;
  badgeText?: string;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  variant = 'bar',
  showBackButton = true,
  backButtonLabel = 'Back to Home',
  onBack,
  siblings,
  siblingsLabel,
  badgeText,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [siblingsMenuOpen, setSiblingsMenuOpen] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Schema.org BreadcrumbList JSON-LD
  const schemaBreadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href || (typeof window !== 'undefined' ? window.location.href : 'https://silarai.com')
    }))
  };

  // Styling presets based on variant
  const isBar = variant === 'bar';
  const isDark = variant === 'dark';

  const containerClasses = isBar
    ? `bg-slate-900/95 backdrop-blur-md text-slate-300 py-3 px-4 sm:px-6 lg:px-8 text-xs border-b border-slate-800 sticky top-16 sm:top-20 z-30 shadow-sm ${className}`
    : isDark
    ? `text-slate-300 py-2 text-xs ${className}`
    : `bg-slate-100 text-slate-600 py-2.5 px-4 sm:px-6 rounded-xl border border-slate-200 text-xs shadow-xs ${className}`;

  const linkClasses = isDark || isBar
    ? 'text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-peach-300 rounded px-1'
    : 'text-slate-600 hover:text-plum-950 transition-colors flex items-center gap-1.5 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-plum-800 rounded px-1';

  const currentClasses = isDark || isBar
    ? 'text-peach-300 font-extrabold flex items-center gap-1.5 bg-plum-900/60 border border-peach-300/30 px-2 py-0.5 rounded-md'
    : 'text-plum-950 font-extrabold flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-xs';

  const separatorColor = isDark || isBar ? 'text-slate-600' : 'text-slate-400';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumbs) }}
      />

      <nav aria-label="Breadcrumb" className={containerClasses}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back Button + Hierarchy Trail */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {showBackButton && onBack && (
              <>
                <button
                  type="button"
                  onClick={onBack}
                  className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg font-bold transition-all cursor-pointer ${
                    isDark || isBar
                      ? 'bg-plum-950/80 hover:bg-plum-900 text-teal-300 hover:text-teal-200 border border-plum-800 hover:border-teal-400/40 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-plum-900 border border-slate-200 shadow-xs'
                  }`}
                  title={backButtonLabel}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline sm:inline">{backButtonLabel}</span>
                </button>
                <span className={separatorColor}>/</span>
              </>
            )}

            {/* Breadcrumbs List */}
            <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {items.map((item, idx) => {
                const isLast = idx === items.length - 1 || item.isCurrent;
                const Icon = item.icon;

                return (
                  <li key={idx} className="flex items-center gap-1.5 sm:gap-2">
                    {idx > 0 && (
                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 ${separatorColor}`}
                        aria-hidden="true"
                      />
                    )}

                    {isLast ? (
                      <span
                        aria-current="page"
                        className={currentClasses}
                      >
                        {Icon && <Icon className="w-3.5 h-3.5 text-peach-300 shrink-0" />}
                        <span className="truncate max-w-[200px] sm:max-w-xs md:max-w-md font-bold">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="ml-1 text-[10px] uppercase tracking-wider font-extrabold bg-teal-400/20 text-teal-300 px-1.5 py-0.2 rounded">
                            {item.badge}
                          </span>
                        )}
                      </span>
                    ) : item.onClick ? (
                      <button
                        type="button"
                        onClick={item.onClick}
                        className={`${linkClasses} cursor-pointer`}
                      >
                        {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                        <span className="hidden sm:inline">{item.label}</span>
                        <span className="sm:hidden">{item.shortLabel || item.label}</span>
                      </button>
                    ) : item.href ? (
                      <a
                        href={item.href}
                        className={linkClasses}
                      >
                        {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                        <span className="hidden sm:inline">{item.label}</span>
                        <span className="sm:hidden">{item.shortLabel || item.label}</span>
                      </a>
                    ) : (
                      <span className={`${linkClasses} opacity-80 cursor-default`}>
                        {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                        <span>{item.label}</span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Right: Siblings Selector (if multiple guide parts) & Badges */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Quick Sibling Guide Switcher (for multi-step guides) */}
            {siblings && siblings.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSiblingsMenuOpen(!siblingsMenuOpen)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    isDark || isBar
                      ? 'bg-plum-950/90 text-peach-200 border border-plum-700 hover:border-peach-300/50'
                      : 'bg-white text-slate-800 border border-slate-200 hover:border-plum-800'
                  }`}
                  aria-expanded={siblingsMenuOpen}
                  aria-label="Switch guide page"
                >
                  <span className="text-slate-400 hidden sm:inline">{siblingsLabel || 'Guide'}:</span>
                  <span className="font-extrabold text-peach-300">
                    {siblings.find((s) => s.isActive)?.shortLabel ||
                      siblings.find((s) => s.isActive)?.label ||
                      'Switch'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {siblingsMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-plum-950 border border-plum-800 rounded-xl shadow-xl py-1.5 z-50 overflow-hidden text-xs">
                    <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold border-b border-plum-900 mb-1">
                      {siblingsLabel || 'Select Guide Part'}
                    </div>
                    {siblings.map((sibling) => (
                      <button
                        key={sibling.id}
                        type="button"
                        onClick={() => {
                          sibling.onClick();
                          setSiblingsMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between font-semibold transition-colors cursor-pointer ${
                          sibling.isActive
                            ? 'bg-peach-300/20 text-peach-300 font-bold'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span>{sibling.label}</span>
                        {sibling.isActive && <Check className="w-3.5 h-3.5 text-peach-300" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Optional Context Badge */}
            {badgeText && (
              <span className="hidden md:inline-flex text-[11px] bg-plum-800/90 text-peach-200 px-2.5 py-0.5 rounded-full font-bold border border-plum-700 shadow-xs">
                {badgeText}
              </span>
            )}

            {/* Copy Share Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy link to this page"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark || isBar
                  ? 'text-slate-400 hover:text-white hover:bg-white/10'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-teal-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
