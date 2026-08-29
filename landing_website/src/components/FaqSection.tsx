import React, { useState } from 'react';
import { FAQ_ITEMS } from '../data/content';
import { ChevronDown, HelpCircle, Search, Sparkles } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string>('existing-website');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? '' : id);
  };

  const filteredFaqs = FAQ_ITEMS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="faq" className="py-20 bg-slate-50/50 border-t border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <span className="text-xs font-extrabold tracking-widest uppercase text-plum-950 bg-peach-300 px-3.5 py-1.5 rounded-full border border-peach-400">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need To Know
          </h2>
          <p className="text-base text-slate-600">
            Got questions about integrations, security, or implementation? We've got answers.
          </p>

          {/* Search bar */}
          <div className="relative max-w-md mx-auto pt-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-7" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (B2B, catalog upload, setup...)"
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-plum-700"
            />
          </div>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-plum-700 shadow-md ring-1 ring-plum-700/20'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base focus:outline-none"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className={`w-5 h-5 shrink-0 ${isOpen ? 'text-plum-700' : 'text-slate-400'}`} />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-plum-700' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-plum-50/30">
                    <p>{faq.answer}</p>
                    <div className="mt-3 text-[11px] font-bold text-plum-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-plum-700" /> Category: {faq.category}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
