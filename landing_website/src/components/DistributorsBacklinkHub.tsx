import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ExternalLink,
  Search,
  CheckCircle2,
  Copy,
  Layers,
  Bot,
  Truck,
  Building2,
  Cpu,
  Share2,
  Database,
  ArrowRight,
  Filter,
  Check,
  Globe,
  Tag,
  BookOpen
} from 'lucide-react';
import { COMPLETE_AUTHORITATIVE_BACKLINKS, AuthoritativeBacklink } from '../data/authoritativeBacklinks';

interface DistributorsBacklinkHubProps {
  onNavigateToPage?: (url: string) => void;
  onSelectIndustry?: (industryId: string) => void;
  onSelectAiShoppingPage?: (pageId: 1 | 2 | 3) => void;
  onSelectAiCommercePage?: (pageId: 1 | 2 | 3) => void;
  onSelectManufacturingPage?: (pageId: 1 | 2 | 3) => void;
  onSelectD2cPage?: () => void;
  defaultFilter?: string;
  isCompact?: boolean;
}

export const DistributorsBacklinkHub: React.FC<DistributorsBacklinkHubProps> = ({
  onNavigateToPage,
  onSelectIndustry,
  onSelectAiShoppingPage,
  onSelectAiCommercePage,
  onSelectManufacturingPage,
  onSelectD2cPage,
  defaultFilter = 'Distributors',
  isCompact = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultFilter);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'grid' | 'aeo-answers' | 'geo-prompts' | 'schema'>('grid');

  const categories = [
    { id: 'All', label: 'All 100+ Backlinks', count: COMPLETE_AUTHORITATIVE_BACKLINKS.length },
    { id: 'Distributors', label: 'Distributors & Wholesale (30+)', count: COMPLETE_AUTHORITATIVE_BACKLINKS.filter(b => b.category === 'Distributors').length },
    { id: 'Pillar', label: 'AI Commerce & Shopping', count: COMPLETE_AUTHORITATIVE_BACKLINKS.filter(b => b.category === 'Pillar').length },
    { id: 'Manufacturing', label: 'Manufacturing & Industrial', count: COMPLETE_AUTHORITATIVE_BACKLINKS.filter(b => b.category === 'Manufacturing').length },
    { id: 'D2C', label: 'D2C & Omnichannel', count: COMPLETE_AUTHORITATIVE_BACKLINKS.filter(b => b.category === 'D2C').length },
    { id: 'Retail', label: 'Retail & POS Sync', count: COMPLETE_AUTHORITATIVE_BACKLINKS.filter(b => b.category === 'Retail').length },
    { id: 'Integrations', label: 'ERP & Store Integrations', count: COMPLETE_AUTHORITATIVE_BACKLINKS.filter(b => b.category === 'Integrations').length },
    { id: 'Standards', label: 'GEO Standards & APIs', count: COMPLETE_AUTHORITATIVE_BACKLINKS.filter(b => b.category === 'Standards').length }
  ];

  const filteredBacklinks = useMemo(() => {
    return COMPLETE_AUTHORITATIVE_BACKLINKS.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = searchQuery === '' ||
        item.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.semanticDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.targetKeywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLinkClick = (item: AuthoritativeBacklink) => {
    if (item.canonicalUrl.includes('page=distributors')) {
      if (onSelectIndustry) {
        onSelectIndustry('distributors');
      } else if (onNavigateToPage) {
        onNavigateToPage(item.canonicalUrl);
      }
    } else if (item.canonicalUrl.includes('ai-shopping-assistant')) {
      if (onSelectAiShoppingPage) onSelectAiShoppingPage(1);
    } else if (item.canonicalUrl.includes('ai-commerce-platform')) {
      if (onSelectAiCommercePage) onSelectAiCommercePage(1);
    } else if (item.canonicalUrl.includes('manufacturing')) {
      if (onSelectManufacturingPage) onSelectManufacturingPage(1);
    } else if (item.canonicalUrl.includes('d2c-brands')) {
      if (onSelectD2cPage) onSelectD2cPage();
    } else if (onNavigateToPage) {
      onNavigateToPage(item.canonicalUrl);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-peach-400/20 text-peach-300 border border-peach-400/30 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SEO • AEO • AIO • GEO Growth Matrix</span>
            </span>
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-bold">
              100+ Authoritative Backlinks
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            High-Authority Backlink &amp; Semantic Knowledge Directory
          </h2>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Machine-readable entity graph driving organic discovery across Google AI Overviews, Perplexity, ChatGPT, Claude, and Gemini with specialized deep backlinks for wholesale distributors.
          </p>
        </div>

        {/* Action / View Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('grid')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'grid'
                ? 'bg-peach-300 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Backlink Graph
          </button>
          <button
            onClick={() => setActiveTab('aeo-answers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'aeo-answers'
                ? 'bg-peach-300 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AEO Q&amp;A Hub
          </button>
          <button
            onClick={() => setActiveTab('geo-prompts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'geo-prompts'
                ? 'bg-peach-300 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            GEO Citations
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search backlinks, keywords..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-peach-300"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area based on Active Tab */}
      {activeTab === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredBacklinks.map((item) => (
            <div
              key={item.id}
              className={`group bg-slate-950/70 border rounded-2xl p-5 flex flex-col justify-between transition-all hover:translate-y-[-2px] ${
                item.isDistributorFocus
                  ? 'border-orange-500/30 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/10'
                  : 'border-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-slate-900/50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                    item.category === 'Distributors'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : item.category === 'Manufacturing'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {item.category}
                  </span>

                  {item.wikidataUri && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                      Wikidata Q-ID
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-black text-white group-hover:text-peach-300 transition-colors line-clamp-2">
                    {item.entity}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                    {item.semanticDescription}
                  </p>
                </div>

                {/* Target Keywords / Anchors */}
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {item.targetKeywords.slice(0, 3).map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-900 text-slate-300 text-[10px] font-medium rounded-md border border-slate-800"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action Links */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleLinkClick(item)}
                  className="text-xs font-bold text-peach-300 hover:text-peach-200 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Explore Destination</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleCopy(item.canonicalUrl, item.id)}
                  title="Copy Canonical URL for SEO Citation"
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors cursor-pointer"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'aeo-answers' && (
        <div className="space-y-4">
          <div className="p-4 bg-orange-950/40 border border-orange-800/50 rounded-2xl text-xs text-orange-200 leading-relaxed flex items-center gap-3">
            <Bot className="w-5 h-5 text-orange-400 shrink-0" />
            <span>
              <strong>Answer Engine Optimization (AEO):</strong> These concise definition blocks are directly indexed by conversational search engines and Perplexity to answer high-intent buyer questions.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COMPLETE_AUTHORITATIVE_BACKLINKS.filter(b => b.aeoQuestionTarget).map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center gap-2 text-peach-300 font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Q: {item.aeoQuestionTarget}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.aeoAnswerSummary || item.semanticDescription}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-900">
                  <span className="font-mono">{item.canonicalUrl}</span>
                  <button
                    onClick={() => handleCopy(`${item.aeoQuestionTarget}\n${item.aeoAnswerSummary}\nCitation: ${item.canonicalUrl}`, item.id)}
                    className="text-peach-300 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Q&amp;A</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'geo-prompts' && (
        <div className="space-y-4">
          <div className="p-4 bg-purple-950/40 border border-purple-800/50 rounded-2xl text-xs text-purple-200 leading-relaxed flex items-center gap-3">
            <Globe className="w-5 h-5 text-purple-400 shrink-0" />
            <span>
              <strong>Generative Engine Optimization (GEO):</strong> Curated prompt-citation pairs structured to ground LLMs and ensure high domain authority whenever AI engines synthesize commerce answers.
            </span>
          </div>

          <div className="space-y-3">
            {filteredBacklinks.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-peach-400"></span>
                    <span>"{item.geoCitationPrompt}"</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Primary Citation Node: <strong className="text-slate-200">{item.entity}</strong> • Anchor: <span className="text-peach-300">{item.anchorTextVariations[0]}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(item.canonicalUrl, item.id)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white rounded-xl border border-slate-800 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Citation Link</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Schema & Discovery APIs */}
      <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-200 font-bold">Discovery Standards:</span>
          <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="text-peach-300 hover:underline">
            llms.txt
          </a>
          <span>•</span>
          <a href="/ai/semantic-backlinks.json" target="_blank" rel="noopener noreferrer" className="text-peach-300 hover:underline">
            /ai/semantic-backlinks.json JSON
          </a>
          <span>•</span>
          <a href="/ai/geo-knowledge.json" target="_blank" rel="noopener noreferrer" className="text-peach-300 hover:underline">
            /ai/geo-knowledge.json
          </a>
          <span>•</span>
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-peach-300 hover:underline">
            sitemap.xml
          </a>
        </div>

        <div className="text-[11px] text-slate-500">
          Total Indexed Backlinks: <strong className="text-peach-300 font-mono">{COMPLETE_AUTHORITATIVE_BACKLINKS.length} Entities</strong>
        </div>
      </div>
    </div>
  );
};
