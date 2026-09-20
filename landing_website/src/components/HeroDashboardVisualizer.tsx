import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Zap,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Send,
  Radio,
  Activity,
  Eye,
  Cloud,
  BarChart3,
  ShoppingBag,
  Maximize2,
  Server,
  Filter,
  Search,
  X
} from 'lucide-react';
import shoppingAssistantImg from '../assets/images/shopping_assistant_ui_1788795889801.webp';
import commerceCloudImg from '../assets/images/commerce_cloud_platform_1788795904634.webp';

interface HeroDashboardVisualizerProps {
  onBookDemo: () => void;
  onWatchTour?: () => void;
}

const QUICK_PROMPTS = [
  { label: 'High-pressure valves', query: 'Find high-pressure flanged valves rated for 2,500 PSI' },
  { label: 'Boutique silk saree', query: 'Show me bridal Kanchipuram silk sarees under $500' },
  { label: 'Bulk pricing tier', query: 'What is the bulk discount for 500+ hydraulic motor units?' },
];

export const HeroDashboardVisualizer: React.FC<HeroDashboardVisualizerProps> = ({
  onBookDemo,
  onWatchTour
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'shopping-ui' | 'cloud-platform' | 'analytics' | 'catalog'>('chat');
  const [userQuery, setUserQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cartToast, setCartToast] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<Array<{
    sender: 'user' | 'bot';
    text: string;
    time: string;
    products?: Array<{
      name: string;
      sku: string;
      price: string;
      stock: string;
      image: string;
    }>;
  }>>([
    {
      sender: 'user',
      text: 'Looking for industrial steel ball valves rated for 2,500 PSI steam application.',
      time: 'Just now',
    },
    {
      sender: 'bot',
      text: 'Found 3 exact matches in your live catalog with 2,500 PSI ASME ratings. Automatic bulk tier discounts applied:',
      time: '1s ago',
      products: [
        {
          name: 'Apex APX-VALVE-200 2" Flanged Valve',
          sku: 'APX-VALVE-200',
          price: '$420.00',
          stock: '48 units in stock',
          image: '⚙️',
        },
        {
          name: 'Titan Flow Pro 2.5" High-Pressure Ball Valve',
          sku: 'TTN-250-PRO',
          price: '$580.00',
          stock: '14 units in stock',
          image: '🔩',
        },
      ],
    },
  ]);

  const [expandedImage, setExpandedImage] = useState<{
    src: string;
    title: string;
    category: string;
    badge: string;
    description: string;
    highlights: string[];
  } | null>(null);

  const sendQueryText = (queryText: string) => {
    if (!queryText.trim() || isTyping) return;
    const newMsg = { sender: 'user' as const, text: queryText, time: 'Just now' };
    setChatMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    setTimeout(() => {
      let botReply = 'I scanned your connected storefront inventory and verified technical specifications and live margin thresholds.';
      let productsList: Array<{ name: string; sku: string; price: string; stock: string; image: string }> | undefined;

      const lower = queryText.toLowerCase();
      if (lower.includes('saree') || lower.includes('silk') || lower.includes('boutique')) {
        botReply = 'Here are our top handcrafted pure Kanchipuram silk sarees in stock with matching pure zari borders:';
        productsList = [
          { name: 'Bridal Crimson Pure Zari Kanchipuram Silk Saree', sku: 'SILK-KANCHI-01', price: '$440.00', stock: '6 in stock', image: '🥻' },
          { name: 'Royal Peacock Teal Silk Saree with Blouse Piece', sku: 'SILK-TEAL-09', price: '$385.00', stock: '12 in stock', image: '👗' },
        ];
      } else if (lower.includes('valve') || lower.includes('psi')) {
        botReply = 'Verified live catalog: Apex APX-VALVE-200 has ASME B16.34 certification for up to 2,500 PSI.';
        productsList = [
          { name: 'Apex APX-VALVE-200 2" Flanged Valve', sku: 'APX-VALVE-200', price: '$420.00', stock: '48 units in stock', image: '⚙️' },
        ];
      } else if (lower.includes('bulk') || lower.includes('discount')) {
        botReply = 'Tier 3 Wholesale Rule Applied: Orders over 500 units receive an automated 22.5% discount ($325.50/unit) with free freight.';
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot' as const,
          text: botReply,
          time: 'Just now',
          products: productsList,
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    sendQueryText(userQuery);
    setUserQuery('');
  };

  const handleAddToCart = (productName: string) => {
    setCartToast(`Added ${productName} to demo cart!`);
    setTimeout(() => setCartToast(null), 3000);
  };

  return (
    <div id="hero-dashboard-visualizer" className="mt-10 sm:mt-14 max-w-5xl mx-auto">
      <div className="relative rounded-[2rem] bg-white p-2.5 sm:p-4 border border-slate-200/90 shadow-2xl shadow-plum-900/20 overflow-hidden">
        
        {/* Holographic Radar Scanning Line */}
        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent z-30 pointer-events-none opacity-70 shadow-[0_0_12px_#2dd4bf] animate-[scan_7s_linear_infinite]" />

        {/* Notification Toast */}
        {cartToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{cartToast}</span>
          </div>
        )}

        {/* Top SaaS Window Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-plum-950 text-white rounded-2xl mb-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-plum-200 bg-plum-900 px-3 py-1 rounded-lg border border-plum-800">
              <Bot className="w-3.5 h-3.5 text-peach-300" />
              <span>app.silarai.com/commerce/platform</span>
            </div>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex items-center gap-1 bg-plum-900 p-1 rounded-xl text-xs font-semibold text-plum-200 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'chat' ? 'bg-plum-700 text-peach-300 font-bold shadow-xs' : 'hover:text-white hover:bg-plum-800'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-peach-300" />
              Live Copilot
            </button>
            <button
              onClick={() => setActiveTab('shopping-ui')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'shopping-ui' ? 'bg-plum-700 text-teal-300 font-bold shadow-xs' : 'hover:text-white hover:bg-plum-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-teal-300" />
              Assistant UI
            </button>
            <button
              onClick={() => setActiveTab('cloud-platform')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'cloud-platform' ? 'bg-plum-700 text-peach-300 font-bold shadow-xs' : 'hover:text-white hover:bg-plum-800'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 text-peach-300" />
              Commerce Cloud
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'analytics' ? 'bg-plum-700 text-peach-300 font-bold shadow-xs' : 'hover:text-white hover:bg-plum-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-peach-300" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'catalog' ? 'bg-plum-700 text-peach-300 font-bold shadow-xs' : 'hover:text-white hover:bg-plum-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-peach-300" />
              Catalog
            </button>
          </div>
        </div>

        {/* Quick Interactive Prompt Chips Bar */}
        {activeTab === 'chat' && (
          <div className="mb-3 px-1 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-plum-700" /> Try Prompts:
            </span>
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => sendQueryText(qp.query)}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-plum-50 hover:bg-plum-100 text-plum-900 border border-plum-200 text-[11px] font-semibold transition-all hover:scale-[1.02] cursor-pointer"
              >
                {qp.label}
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-50/80 p-3 sm:p-4 rounded-2xl border border-slate-200/80"
            >
              {/* Left Column: Live AI Chat Interface */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between h-[420px] shadow-2xs">
                {/* Chat Top Status */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-xl bg-plum-700 flex items-center justify-center text-peach-300 shadow-xs">
                        <Bot className="w-5 h-5" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-ping" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        SilarAI Assistant <Zap className="w-3.5 h-3.5 text-peach-600 fill-peach-500" />
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                        Connected to 40,000 Catalog Items &amp; Spec Sheets
                      </div>
                    </div>
                  </div>
                  <span className="bg-peach-100 text-plum-900 border border-peach-300/80 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Activity className="w-3 h-3 text-plum-700 animate-pulse" />
                    Live Test Mode
                  </span>
                </div>

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-plum-700 text-white rounded-br-none shadow-2xs'
                            : 'bg-plum-50 text-slate-900 rounded-bl-none border border-plum-100/80'
                        }`}
                      >
                        <p>{msg.text}</p>
                        {msg.products && (
                          <div className="mt-2.5 space-y-2">
                            {msg.products.map((p, pIdx) => (
                              <div
                                key={pIdx}
                                className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-900 flex items-center justify-between gap-2 shadow-2xs hover:border-plum-300 transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xl">{p.image}</span>
                                  <div>
                                    <div className="font-bold text-xs text-slate-900">{p.name}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">SKU: {p.sku} | {p.stock}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs font-extrabold text-plum-700">{p.price}</div>
                                  <button
                                    onClick={() => handleAddToCart(p.name)}
                                    className="mt-1 text-[10px] font-bold text-white bg-plum-700 hover:bg-plum-800 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                  >
                                    Add to Cart
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-2 text-xs text-plum-700 font-semibold bg-plum-50 px-3 py-2 rounded-xl w-fit border border-plum-100">
                      <Bot className="w-4 h-4 animate-spin text-peach-600" />
                      <span>AI is checking catalog specs...</span>
                    </div>
                  )}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} className="relative pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Ask any technical, pricing, or compatibility question..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl pl-3.5 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-plum-500 focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-3.5 text-plum-950 bg-peach-300 hover:bg-peach-400 p-1.5 rounded-lg transition-colors font-bold cursor-pointer"
                    aria-label="Send query"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Right Column: Live Stats & Recommendations Preview */}
              <div className="lg:col-span-5 space-y-3">
                {/* Revenue Growth Card */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Live Conversion Uplift</span>
                    <span className="text-xs font-bold text-plum-900 bg-peach-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-plum-700" /> +45.2%
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">$148,290.00</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">AI-guided order volume this month</div>

                  {/* SVG Graph Bars */}
                  <div className="mt-3 h-16 w-full flex items-end gap-1.5 pt-2">
                    {[35, 42, 58, 65, 80, 75, 95, 110, 125, 148].map((val, idx) => (
                      <div
                        key={idx}
                        style={{ height: `${(val / 150) * 100}%` }}
                        className={`flex-1 rounded-t-sm transition-all duration-300 ${
                          idx === 9 ? 'bg-plum-700 shadow-xs' : 'bg-plum-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* AI Product Recommendations Mini Card */}
                <div className="bg-gradient-to-br from-plum-800 via-plum-900 to-plum-950 text-white p-4 rounded-2xl shadow-md border border-plum-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-peach-300 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-peach-300" /> Intent AI Engine
                    </div>
                    <span className="text-[10px] bg-white/10 text-peach-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      Real-time
                    </span>
                  </div>
                  <div className="mt-2 text-xs sm:text-sm font-semibold text-slate-100">
                    "Customers asking about 2,500 PSI valves buy Gaskets 84% of time."
                  </div>
                  <div className="mt-3 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl flex items-center justify-between border border-white/10">
                    <div className="text-xs">
                      <div className="font-bold text-white">Suggested Cross-Sell Gasket Kit</div>
                      <div className="text-[10px] text-peach-200">Auto-offered in checkout</div>
                    </div>
                    <span className="text-xs font-extrabold bg-peach-300 text-plum-950 px-2.5 py-1 rounded-lg shadow-2xs">
                      +$48.00 AOV
                    </span>
                  </div>
                </div>

                {/* Quick Feature Badges */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5 bg-plum-50/60 p-2 rounded-xl text-plum-900 border border-plum-100">
                    <ShieldCheck className="w-4 h-4 text-plum-700" />
                    <span>Live Price Sync</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-plum-50/60 p-2 rounded-xl text-plum-900 border border-plum-100">
                    <Bot className="w-4 h-4 text-plum-700" />
                    <span>WhatsApp Bot</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab: AI Shopping Assistant UI */}
          {activeTab === 'shopping-ui' && (
            <motion.div
              key="shopping-ui"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80"
            >
              <div className="lg:col-span-7 relative group rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-950 flex flex-col justify-between">
                <img
                  src={shoppingAssistantImg}
                  alt="AI Shopping Assistant UI Interface Preview"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-[320px] sm:h-[380px] object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
                
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
                  <div className="text-white text-xs">
                    <div className="font-bold text-sm text-teal-300">AI Guided Conversational Cart</div>
                    <div className="text-slate-300 text-[11px]">Multi-turn intent extraction &amp; spec filtering</div>
                  </div>
                  <button
                    onClick={() =>
                      setExpandedImage({
                        src: shoppingAssistantImg,
                        title: 'AI Shopping Assistant Interface',
                        category: 'Conversational Buying Engine',
                        badge: '34% Conversion Lift',
                        description:
                          'Empower shoppers with natural language intent recognition, voice & text dialogue, automatic spec comparisons, and seamless in-chat basket checkout across Web storefronts and WhatsApp.',
                        highlights: [
                          'Multi-turn conversational context & SKU discovery',
                          'Sub-500ms real-time catalog vector indexing',
                          'Instant WhatsApp and Mobile cart recovery',
                          'Personalized cross-sell & bundle suggestions',
                        ],
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Inspect Full-Size</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Assistant Performance</span>
                      <span className="text-xs font-extrabold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                        Active in 1,200+ Stores
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Intent Resolution Accuracy</span>
                        <span className="font-bold text-slate-900">94.8%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-teal-500 h-2 rounded-full w-[94.8%]" />
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-600 font-medium">Average Cart Value Uplift</span>
                        <span className="font-bold text-slate-900">+34.2%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-coral-400 h-2 rounded-full w-[84%]" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-plum-700" />
                      <span>Key Conversational Capabilities</span>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" />
                        <span>Natural language queries (e.g. "Valves rated for 2,500 PSI steel")</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" />
                        <span>Auto cross-sell recommendation bundles on checkout flow</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" />
                        <span>Instant WhatsApp and social cart synchronization</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="w-full py-3 bg-plum-900 hover:bg-plum-950 text-peach-200 hover:text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Bot className="w-4 h-4 text-peach-300" />
                    <span>Try Live Chat in Demo Mode</span>
                    <ArrowRight className="w-3.5 h-3.5 text-peach-300" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab: Commerce Cloud */}
          {activeTab === 'cloud-platform' && (
            <motion.div
              key="cloud-platform"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80"
            >
              <div className="lg:col-span-7 relative group rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-950 flex flex-col justify-between">
                <img
                  src={commerceCloudImg}
                  alt="AI Commerce Cloud Network and Multi-Store Architecture"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-[320px] sm:h-[380px] object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
                
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
                  <div className="text-white text-xs">
                    <div className="font-bold text-sm text-peach-200">Autonomous Commerce Mesh</div>
                    <div className="text-slate-300 text-[11px]">Sub-50ms dynamic margin engine &amp; multi-channel inventory</div>
                  </div>
                  <button
                    onClick={() =>
                      setExpandedImage({
                        src: commerceCloudImg,
                        title: 'AI Commerce Cloud Platform Architecture',
                        category: 'Enterprise Cloud Infrastructure',
                        badge: 'Sub-50ms Pricing Engine',
                        description:
                          'Cloud-native architecture uniting real-time multi-storefront inventory sync, sub-50ms dynamic margin recalculation, and automated visual merchandising across Shopify, WooCommerce, SAP & Oracle.',
                        highlights: [
                          'Global multi-warehouse inventory mesh & real-time ATP',
                          'Automated visual merchandising & dynamic storefront grids',
                          'Enterprise ERP bi-directional sync (SAP, NetSuite, Dynamics)',
                          'Cloud elasticity with 99.99% uptime SLA',
                        ],
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-peach-300 hover:bg-peach-200 text-plum-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Inspect Full-Size</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cloud Latency &amp; Uptime</span>
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        99.99% SLA
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="text-[10px] text-slate-500">Price Recalculation</div>
                        <div className="text-lg font-black text-plum-950 mt-0.5">42 ms</div>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="text-[10px] text-slate-500">Catalog Sync Mesh</div>
                        <div className="text-lg font-black text-plum-950 mt-0.5">&lt; 1.2 sec</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-plum-700" />
                      <span>Enterprise Connectors &amp; Mesh</span>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" />
                        <span>1-Click Connectors for Shopify, Magento, SAP, Oracle &amp; NetSuite</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" />
                        <span>Autonomous inventory rebalancing across regional fulfillment hubs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" />
                        <span>Real-time competitor scraping &amp; margin protection rules</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="w-full py-3 bg-plum-900 hover:bg-plum-950 text-peach-200 hover:text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 text-peach-300" />
                    <span>View Revenue &amp; Conversion Analytics</span>
                    <ArrowRight className="w-3.5 h-3.5 text-peach-300" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab: Analytics */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500">Total Commerce Revenue</div>
                  <div className="text-3xl font-black text-slate-900 mt-1">$482,900</div>
                  <div className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> +38.4% vs last quarter
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500">AI Assistant Interactions</div>
                  <div className="text-3xl font-black text-slate-900 mt-1">28,410</div>
                  <div className="text-xs font-bold text-plum-700 mt-1 flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-peach-600" /> 94.8% resolution accuracy
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500">Avg. Order Value (AOV)</div>
                  <div className="text-3xl font-black text-slate-900 mt-1">$1,240</div>
                  <div className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-peach-600" /> +$280 from AI recommendations
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Conversion Comparison (Traditional Search vs SilarAI AI)</h3>
                  <span className="text-xs text-slate-500 font-medium">Last 30 Days</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>SilarAI Conversational Shoppers</span>
                      <span className="text-plum-700 font-extrabold">6.42% Conversion Rate</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-plum-700 h-3 rounded-full w-[85%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                      <span>Traditional Keyword Search Visitors</span>
                      <span>1.84% Conversion Rate</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-slate-300 h-3 rounded-full w-[32%]" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab: Catalog */}
          {activeTab === 'catalog' && (
            <motion.div
              key="catalog"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-3"
            >
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    readOnly
                    value="42,100 SKUs indexed with vector spec embeddings"
                    className="text-xs font-mono text-slate-700 bg-transparent outline-none w-80"
                  />
                </div>
                <button className="text-xs font-bold text-plum-800 bg-peach-100 px-3 py-1 rounded-lg flex items-center gap-1 border border-peach-200 cursor-pointer">
                  <Filter className="w-3 h-3" /> Filter by Product Group
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Flanged Pressure Valve 2"', sku: 'APX-VALVE-200', spec: '2500 PSI Steel', aiScore: '99% Index Match', price: '$420' },
                  { name: 'Industrial Motor Controller', sku: 'MOT-CTRL-440V', spec: '440V Three Phase', aiScore: '98% Index Match', price: '$1,290' },
                  { name: 'Hydraulic Seal Gasket Set', sku: 'GSK-HYD-SET', spec: 'EPDM High Temp', aiScore: '100% Index Match', price: '$48' },
                  { name: 'Titanium Flow Meter B2B', sku: 'FLM-TITAN-9', spec: 'NPT 1.5 Inch Digital', aiScore: '97% Index Match', price: '$850' },
                ].map((item, i) => (
                  <div key={i} className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between hover:shadow-sm transition-shadow">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">SKU: {item.sku} | {item.spec}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-slate-900">{item.price}</div>
                      <span className="text-[10px] font-bold text-plum-900 bg-peach-200 px-2 py-0.5 rounded-md">
                        {item.aiScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox / High-Resolution Image Preview Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
            onClick={() => setExpandedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-plum-950 border border-plum-700/80 rounded-3xl overflow-hidden shadow-2xl text-white"
            >
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-plum-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-peach-400/20 text-peach-200 border border-peach-400/30">
                    {expandedImage.category}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {expandedImage.title}
                  </h4>
                </div>
                <button
                  onClick={() => setExpandedImage(null)}
                  className="w-8 h-8 rounded-full bg-plum-800/80 hover:bg-plum-700 flex items-center justify-center text-plum-200 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close image preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
                <div className="rounded-2xl overflow-hidden border border-plum-800 shadow-xl bg-slate-950">
                  <img
                    src={expandedImage.src}
                    alt={expandedImage.title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto max-h-[440px] object-cover object-top"
                  />
                </div>

                <div className="bg-plum-900/60 p-4 rounded-2xl border border-plum-800/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-mono text-teal-300 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-coral-400" />
                      {expandedImage.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-plum-100 leading-relaxed">
                    {expandedImage.description}
                  </p>

                  <div className="pt-2 border-t border-plum-800/80">
                    <div className="text-xs font-bold text-peach-200 mb-2">Key Capabilities &amp; Architecture:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-plum-100">
                      {expandedImage.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-plum-950/60 p-2 rounded-xl border border-plum-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setExpandedImage(null);
                      setActiveTab(expandedImage.category.includes('Conversational') ? 'chat' : 'catalog');
                      const el = document.getElementById('hero-dashboard-visualizer');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold bg-plum-800 hover:bg-plum-700 text-white rounded-xl transition-colors cursor-pointer"
                  >
                    Launch Interactive Playground
                  </button>
                  <button
                    onClick={() => {
                      setExpandedImage(null);
                      onBookDemo();
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 text-xs font-black bg-coral-400 hover:bg-coral-500 text-plum-950 rounded-xl transition-colors shadow-lg cursor-pointer"
                  >
                    Book Live Platform Demo
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
