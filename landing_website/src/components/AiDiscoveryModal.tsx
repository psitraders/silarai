import React, { useState } from 'react';
import {
  X,
  Bot,
  Search,
  ExternalLink,
  Copy,
  Check,
  Network,
  HelpCircle,
  Code,
  Sparkles,
  Layers,
  Database,
  Globe,
  Compass,
  FileText
} from 'lucide-react';
import {
  AUTHORITATIVE_BACKLINKS,
  RAG_KNOWLEDGE_CHUNKS,
  AEO_AIO_KNOWLEDGE_QA,
  SemanticBacklink,
  RagKnowledgeChunk,
  AeoQuestionAnswer
} from '../server/ragDiscoveryEngine';

interface AiDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiDiscoveryModal: React.FC<AiDiscoveryModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'backlinks' | 'aeo' | 'rag' | 'endpoints' | 'geo'>('backlinks');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredBacklinks = AUTHORITATIVE_BACKLINKS.filter(
    (b) =>
      b.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.targetKeywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.semanticDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAeo = AEO_AIO_KNOWLEDGE_QA.filter(
    (q) =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.shortAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.targetEntities.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredRag = RAG_KNOWLEDGE_CHUNKS.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.keyEntities.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const discoveryEndpoints = [
    {
      name: 'llms.txt (GEO Knowledge Standard)',
      url: '/llms.txt',
      desc: 'Machine-readable Markdown standard for Perplexity, ChatGPT Search, Claude & Gemini.',
      type: 'GET /llms.txt'
    },
    {
      name: 'llms-full.txt (Deep Technical Topology)',
      url: '/llms-full.txt',
      desc: 'Complete architectural specification with D2C Cypher Graph and 10-cluster keyword taxonomy.',
      type: 'GET /llms-full.txt'
    },
    {
      name: 'OpenAPI 3.1 Descriptor',
      url: '/.well-known/openapi.json',
      desc: 'Machine-readable descriptor of every public RAG, GEO, and knowledge surface on this domain.',
      type: 'GET /.well-known/openapi.json'
    },
    {
      name: 'AI Plugin Manifest',
      url: '/.well-known/ai-plugin.json',
      desc: 'OpenAI and Gemini plugin discovery standard manifest.',
      type: 'GET /.well-known/ai-plugin.json'
    },
    {
      name: 'RAG Knowledge Chunks',
      url: '/ai/rag-chunks.json',
      desc: 'Chunked knowledge objects with vector-friendly metadata and canonical citation backlinks. Served complete — filter client-side.',
      type: 'GET /ai/rag-chunks.json'
    },
    {
      name: 'AI Discovery Index',
      url: '/ai/discovery.json',
      desc: 'Master index listing every machine-readable knowledge surface on this domain.',
      type: 'GET /ai/discovery.json'
    },
    {
      name: 'AEO & AIO Direct Answer FAQ API',
      url: '/ai/aeo-faq.json',
      desc: 'High-density direct question and answer pairs optimized for AI Overviews.',
      type: 'GET /ai/aeo-faq.json'
    },
    {
      name: 'Semantic Backlinks Directory API',
      url: '/ai/semantic-backlinks.json',
      desc: 'Authoritative backlink graph with Wikidata/DBpedia URIs and anchor text variations.',
      type: 'GET /ai/semantic-backlinks.json'
    },
    {
      name: 'Site Architecture & Taxonomy API',
      url: '/ai/site-architecture.json',
      desc: 'Complete JSON taxonomy of 9 product pillars, 11 industry verticals, and 2 integrations.',
      type: 'GET /ai/site-architecture.json'
    },
    {
      name: 'Dynamic XML Sitemap',
      url: '/sitemap.xml',
      desc: 'Search engine XML index with lastmod, priorities, and canonical URLs.',
      type: 'GET /sitemap.xml'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-plum-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-plum-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-plum-950 via-plum-900 to-plum-950 text-white flex items-center justify-between border-b border-plum-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-peach-400/20 border border-peach-400/30 flex items-center justify-center text-peach-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">AI &amp; SEO Discovery Engine</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-peach-300 text-plum-950 px-2 py-0.5 rounded-full">
                  GEO • AEO • AIO
                </span>
              </div>
              <p className="text-xs text-plum-300">
                Authoritative semantic backlinks, RAG vector knowledge chunks &amp; machine-readable AI standards.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-plum-400 hover:text-white hover:bg-plum-800/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Navigation Bar */}
        <div className="p-4 bg-plum-50/70 border-b border-plum-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: 'backlinks', label: 'Semantic Backlinks', icon: Network, count: AUTHORITATIVE_BACKLINKS.length },
              { id: 'aeo', label: 'AEO / AIO Direct Q&A', icon: HelpCircle, count: AEO_AIO_KNOWLEDGE_QA.length },
              { id: 'rag', label: 'RAG Knowledge Chunks', icon: Database, count: RAG_KNOWLEDGE_CHUNKS.length },
              { id: 'endpoints', label: 'AI Endpoints & Standards', icon: Code, count: discoveryEndpoints.length },
              { id: 'geo', label: 'GEO Knowledge Graph', icon: Globe }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-plum-900 text-white shadow-sm'
                      : 'bg-white text-plum-700 hover:bg-plum-100/80 border border-plum-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-peach-300' : 'text-plum-500'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive ? 'bg-peach-300 text-plum-950' : 'bg-plum-200/60 text-plum-800'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-plum-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entities, keywords, Q&A..."
              className="w-full bg-white border border-plum-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-plum-900 placeholder-plum-400 focus:outline-none focus:ring-2 focus:ring-plum-800"
            />
          </div>
        </div>

        {/* Modal Body with Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          {/* Tab 1: Semantic Backlinks */}
          {activeTab === 'backlinks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-plum-950 flex items-center gap-1.5">
                    <Network className="w-4 h-4 text-plum-800" />
                    <span>Authoritative Semantic SEO Backlink Graph</span>
                  </h4>
                  <p className="text-xs text-plum-600">
                    High-density canonical anchor texts, target keyword pairings, and Wikidata/DBpedia ontology mappings.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const allBacklinksJson = JSON.stringify(AUTHORITATIVE_BACKLINKS, null, 2);
                    copyToClipboard(allBacklinksJson, 'all-backlinks');
                  }}
                  className="px-3 py-1.5 bg-white border border-plum-200 rounded-xl text-xs font-bold text-plum-800 hover:bg-plum-50 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  {copiedIndex === 'all-backlinks' ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-plum-600" />
                  )}
                  <span>Copy Full Backlink JSON</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBacklinks.map((b, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-2xl border border-plum-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-plum-950">{b.entity}</span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                b.category === 'Distributors'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : b.category === 'Pillar'
                                  ? 'bg-plum-100 text-plum-900'
                                  : b.category === 'Manufacturing' || b.category === 'Retail' || b.category === 'D2C'
                                  ? 'bg-teal-100 text-teal-900'
                                  : 'bg-indigo-100 text-indigo-900'
                              }`}
                            >
                              {b.category}
                            </span>
                          </div>
                          <a
                            href={b.canonicalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-plum-600 hover:text-plum-900 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <span>{b.canonicalUrl}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>

                        <button
                          onClick={() => {
                            const markdown = `[${b.anchorTextVariations[0]}](${b.canonicalUrl})`;
                            copyToClipboard(markdown, `md-${idx}`);
                          }}
                          title="Copy Markdown Backlink"
                          className="p-1.5 rounded-lg bg-plum-50 hover:bg-plum-100 text-plum-700 transition-colors"
                        >
                          {copiedIndex === `md-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-plum-600" />
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{b.semanticDescription}</p>

                      {/* Anchor text variations */}
                      <div>
                        <span className="text-[10px] font-bold text-plum-700 uppercase tracking-wider">
                          Anchor Text Variations:
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {b.anchorTextVariations.map((anchor, aIdx) => (
                            <span
                              key={aIdx}
                              className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                            >
                              "{anchor}"
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer entity links */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex items-center gap-2">
                        {b.wikidataUri && (
                          <a
                            href={b.wikidataUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <span>Wikidata</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        {b.dbpediaUri && (
                          <a
                            href={b.dbpediaUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline flex items-center gap-0.5"
                          >
                            <span>DBpedia</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      <span className="font-mono text-[9px] text-slate-400">{b.schemaType.split('/').pop()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: AEO / AIO Direct Q&A */}
          {activeTab === 'aeo' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-plum-950 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-plum-800" />
                    <span>Answer Engine Optimization (AEO &amp; AIO) Fact Repository</span>
                  </h4>
                  <p className="text-xs text-plum-600">
                    Direct question and answer blocks optimized for Google AI Overviews, Perplexity, and ChatGPT Search.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {filteredAeo.map((qa, idx) => (
                  <div
                    key={qa.id}
                    className="p-4 bg-white rounded-2xl border border-plum-100 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-peach-100 text-plum-900 px-2 py-0.5 rounded-full">
                            {qa.relevantPillar}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">ID: {qa.id}</span>
                        </div>
                        <h5 className="text-xs sm:text-sm font-black text-plum-950">Q: {qa.question}</h5>
                      </div>

                      <button
                        onClick={() => {
                          const formatted = `Q: ${qa.question}\nA: ${qa.detailedAnswer}\nSource: ${qa.citationUrl}`;
                          copyToClipboard(formatted, `qa-${idx}`);
                        }}
                        className="px-2.5 py-1 bg-plum-50 hover:bg-plum-100 rounded-lg text-[11px] font-bold text-plum-800 flex items-center gap-1 shrink-0"
                      >
                        {copiedIndex === `qa-${idx}` ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-plum-600" />
                        )}
                        <span>Copy Q&amp;A</span>
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                      <div className="text-xs font-bold text-plum-900">
                        <span className="text-peach-700">Quick Answer: </span>
                        {qa.shortAnswer}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{qa.detailedAnswer}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-bold">Target Entities:</span>
                        {qa.targetEntities.map((ent, eIdx) => (
                          <span
                            key={eIdx}
                            className="text-[10px] bg-plum-50 text-plum-800 px-2 py-0.5 rounded font-medium"
                          >
                            {ent}
                          </span>
                        ))}
                      </div>

                      <a
                        href={qa.citationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-peach-700 hover:text-peach-900 font-bold flex items-center gap-1"
                      >
                        <span>Citation: {qa.citationUrl}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: RAG Knowledge Chunks */}
          {activeTab === 'rag' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-plum-950 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-plum-800" />
                    <span>Vector Knowledge RAG Chunks (High Density)</span>
                  </h4>
                  <p className="text-xs text-plum-600">
                    High-confidence text chunks prepared for semantic vector retrieval and AI context injection.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {filteredRag.map((chunk, idx) => (
                  <div
                    key={chunk.chunkId}
                    className="p-4 bg-white rounded-2xl border border-plum-100 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase bg-plum-900 text-white px-2 py-0.5 rounded-full">
                            {chunk.category}
                          </span>
                          <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                            Confidence: {(chunk.confidenceScore * 100).toFixed(0)}%
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            ~{chunk.tokenCountEstimate} tokens
                          </span>
                        </div>
                        <h5 className="text-xs sm:text-sm font-black text-plum-950 mt-1">{chunk.title}</h5>
                      </div>

                      <button
                        onClick={() => {
                          const jsonStr = JSON.stringify(chunk, null, 2);
                          copyToClipboard(jsonStr, `chunk-${idx}`);
                        }}
                        className="px-2.5 py-1 bg-plum-50 hover:bg-plum-100 rounded-lg text-[11px] font-bold text-plum-800 flex items-center gap-1 shrink-0"
                      >
                        {copiedIndex === `chunk-${idx}` ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-plum-600" />
                        )}
                        <span>Copy JSON Chunk</span>
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
                      {chunk.content}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] text-slate-500 font-bold">Key Entities:</span>
                        {chunk.keyEntities.map((ent, eIdx) => (
                          <span
                            key={eIdx}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                          >
                            {ent}
                          </span>
                        ))}
                      </div>

                      <a
                        href={chunk.canonicalBacklink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-plum-700 hover:text-plum-950 font-bold flex items-center gap-1"
                      >
                        <span>Canonical: {chunk.canonicalBacklink}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: AI Endpoints & Standards */}
          {activeTab === 'endpoints' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-black text-plum-950 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-plum-800" />
                  <span>Public AI Discovery &amp; RAG API Endpoints</span>
                </h4>
                <p className="text-xs text-plum-600">
                  Direct machine-readable endpoints compliant with OpenAI Plugins, OpenAPI 3.1, and LLM.txt standards.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {discoveryEndpoints.map((ep, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-2xl border border-plum-100 shadow-2xs space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-plum-950">{ep.name}</span>
                        <span className="text-[10px] font-mono font-bold bg-plum-100 text-plum-900 px-2 py-0.5 rounded">
                          {ep.type.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{ep.desc}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <code className="text-[11px] font-mono text-plum-800 bg-slate-100 px-2 py-1 rounded-lg truncate flex-1">
                        {ep.url}
                      </code>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            const curl = `curl -s https://silarai.com${ep.url}`;
                            copyToClipboard(curl, `curl-${idx}`);
                          }}
                          title="Copy cURL Command"
                          className="px-2 py-1 bg-plum-50 hover:bg-plum-100 text-plum-800 rounded-lg text-[10px] font-bold flex items-center gap-1"
                        >
                          {copiedIndex === `curl-${idx}` ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-plum-600" />
                          )}
                          <span>cURL</span>
                        </button>

                        <a
                          href={ep.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-plum-900 text-white hover:bg-plum-800 rounded-lg text-[10px] font-bold flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: GEO Knowledge Graph */}
          {activeTab === 'geo' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-black text-plum-950 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-plum-800" />
                  <span>Generative Engine Optimization (GEO) Knowledge Graph</span>
                </h4>
                <p className="text-xs text-plum-600">
                  Global knowledge triples, verified Wikidata IDs, and Schema.org DefinedTermSet definitions.
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-plum-100 shadow-2xs space-y-3">
                <div className="text-xs font-bold text-plum-950">Ontology Hierarchy &amp; Directed Graph:</div>
                <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {`[SilarAI Enterprise Platform]
  ├── (has_pillar) ──> [AI Commerce Platform] (Wikidata: Q180160)
  ├── (has_pillar) ──> [AI Shopping Assistant] (Wikidata: Q1151624)
  ├── (has_pillar) ──> [B2B Commerce Platform] (Wikidata: Q852331)
  ├── (has_pillar) ──> [B2B2C Commerce Platform] (Wikidata: Q4834407)
  ├── (has_pillar) ──> [AI Product Discovery] (Wikidata: Q2539)
  ├── (has_pillar) ──> [Dealer Portal Software] (Wikidata: Q798606)
  ├── (has_pillar) ──> [AI Sales Assistant] (Wikidata: Q7404313)
  ├── (serves_vertical) ──> [Manufacturing AI Commerce] (Wikidata: Q187939)
  ├── (serves_vertical) ──> [Retail AI Platform] (Wikidata: Q126793)
  ├── (serves_vertical) ──> [D2C Brands Suite] (Wikidata: Q5280053)
  └── (integrates_with) ──> [Shopify, WooCommerce, SAP S/4HANA, NetSuite, Dynamics 365]`}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-500">
                    Compliant with Google AIO, ChatGPT, Claude, and Perplexity RAG standards.
                  </div>
                  <a
                    href="/ai/geo-knowledge.json"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-plum-800 hover:underline flex items-center gap-1"
                  >
                    <span>View raw GEO JSON</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-plum-100 flex flex-wrap items-center justify-between gap-3 text-xs text-plum-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Live Discovery Service Active — Indexing Enabled for all LLMs</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="text-plum-700 hover:text-plum-950 font-bold hover:underline"
            >
              XML Sitemap
            </a>
            <span>•</span>
            <a
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-plum-700 hover:text-plum-950 font-bold hover:underline"
            >
              llms.txt
            </a>
            <span>•</span>
            <a
              href="/.well-known/openapi.json"
              target="_blank"
              rel="noopener noreferrer"
              className="text-plum-700 hover:text-plum-950 font-bold hover:underline"
            >
              OpenAPI
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
